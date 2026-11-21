import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PresentationContent } from '../lib/presentation-types';
import { Stepper } from './ui/stepper';

type ContentShowcaseProps = {
  items: PresentationContent[];
  variant: 'design1' | 'design2' | 'design3';
};

type Preset = {
  stageInitial: Record<string, number | string>;
  stageAnimate: Record<string, number | string>;
  stageExit: Record<string, number | string>;
  thumbOffsetX: number;
  thumbOffsetY: number;
  routeColor: string;
  routePointColor: string;
};

const PRESETS: Record<ContentShowcaseProps['variant'], Preset> = {
  design1: {
    stageInitial: { opacity: 0, y: 30 },
    stageAnimate: { opacity: 1, y: 0 },
    stageExit: { opacity: 0, y: -20 },
    thumbOffsetX: 120,
    thumbOffsetY: 0,
    routeColor: '#bdd277',
    routePointColor: '#edf6cd'
  },
  design2: {
    stageInitial: { opacity: 0, x: -26, rotate: -2 },
    stageAnimate: { opacity: 1, x: 0, rotate: 0 },
    stageExit: { opacity: 0, x: 26, rotate: 1.5 },
    thumbOffsetX: -80,
    thumbOffsetY: 50,
    routeColor: '#8a1b13',
    routePointColor: '#4f120e'
  },
  design3: {
    stageInitial: { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
    stageAnimate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    stageExit: { opacity: 0, scale: 1.03, filter: 'blur(5px)' },
    thumbOffsetX: 0,
    thumbOffsetY: -70,
    routeColor: '#2f5564',
    routePointColor: '#9a6a3e'
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const IMAGE_TIME_SCALE = 5;
const IMAGE_ENTRY_MS = 1800;
const IMAGE_TO_THUMB_MS = 1800;
const MAP_STEP_MS = 900;
const ROUTE_STEP_MS = 1400;

const fitToAllRoutePoints = (map: maplibregl.Map, routes?: PresentationContent['routes']) => {
  if (!routes?.length) {
    map.flyTo({
      center: [2.2, 47.3],
      zoom: 4.8,
      duration: 700,
      essential: true
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  routes.forEach((route) => {
    bounds.extend([route.from.lng, route.from.lat]);
    bounds.extend([route.to.lng, route.to.lat]);
  });

  map.fitBounds(bounds, {
    padding: { top: 60, right: 60, bottom: 60, left: 60 },
    duration: 800,
    maxZoom: 6.8,
    essential: true
  });
};

export default function ContentShowcase({ items, variant }: ContentShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const routeIdsRef = useRef<string[]>([]);
  const runIdRef = useRef(0);
  const timelineTimersRef = useRef<number[]>([]);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const lockAlignedRef = useRef(false);

  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const mapReadyRef = useRef(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlaybackLocked, setIsPlaybackLocked] = useState(true);
  const [isSequenceCompleted, setIsSequenceCompleted] = useState(false);

  const [showDate, setShowDate] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState<number[]>([]);
  const [imagePhaseByIndex, setImagePhaseByIndex] = useState<Record<number, 'hero' | 'thumb'>>({});
  const [heroImage, setHeroImage] = useState<{ index: number; side: 'left' | 'right' } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const preset = PRESETS[variant];
  const currentContent = items[activeContentIndex];
  const progressRatio = items.length <= 1 ? 100 : (activeContentIndex / (items.length - 1)) * 100;

  useEffect(() => {
    mapReadyRef.current = mapReady;
  }, [mapReady]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsSectionVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0, rootMargin: '-10% 0px -10% 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!isSectionVisible || !isPlaybackLocked || !sectionRef.current) {
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const isInside = rect.top <= window.innerHeight * 0.25 && rect.bottom >= window.innerHeight * 0.75;
      if (!isInside) {
        lockAlignedRef.current = false;
        return;
      }

      if (!lockAlignedRef.current && Math.abs(rect.top) > 2) {
        window.scrollTo({ top: window.scrollY + rect.top, behavior: 'auto' });
        lockAlignedRef.current = true;
      }

      event.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isPlaybackLocked, isSectionVisible]);

  useEffect(() => {
    if (!isPlaybackLocked) {
      lockAlignedRef.current = false;
    }
  }, [isPlaybackLocked]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') {
        return;
      }

      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const next = clamp(activeContentIndex + direction, 0, items.length - 1);
      if (next !== activeContentIndex) {
        event.preventDefault();
        setIsPlaybackLocked(true);
        setIsSequenceCompleted(false);
        setActiveContentIndex(next);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeContentIndex, items.length]);

  const clearRouteScene = () => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    routeIdsRef.current.forEach((routeId) => {
      if (map.getLayer(`${routeId}-line`)) {
        map.removeLayer(`${routeId}-line`);
      }
      if (map.getSource(routeId)) {
        map.removeSource(routeId);
      }
    });
    routeIdsRef.current = [];
  };

  const animateRoute = (routeIndex: number): Promise<void> => {
    const map = mapRef.current;
    if (!map || !mapReady || !currentContent.routes?.[routeIndex]) {
      return Promise.resolve();
    }

    const leg = currentContent.routes[routeIndex];
    const sourceId = `route-${activeContentIndex}-${routeIndex}`;

    if (map.getSource(sourceId)) {
      return Promise.resolve();
    }

    routeIdsRef.current.push(sourceId);

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [leg.from.lng, leg.from.lat],
            [leg.from.lng, leg.from.lat]
          ]
        }
      }
    });

    map.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': preset.routeColor,
        'line-width': 4,
        'line-opacity': 0.9
      }
    });

    const fromMarker = new maplibregl.Marker({ color: preset.routePointColor })
      .setLngLat([leg.from.lng, leg.from.lat])
      .setPopup(new maplibregl.Popup({ offset: 12 }).setText(leg.from.name))
      .addTo(map);

    const toMarker = new maplibregl.Marker({ color: preset.routePointColor })
      .setLngLat([leg.to.lng, leg.to.lat])
      .setPopup(new maplibregl.Popup({ offset: 12 }).setText(leg.to.name))
      .addTo(map);

    const planeEl = document.createElement('div');
    planeEl.className = 'plane-marker';
    planeEl.textContent = '✈';

    const planeMarker = new maplibregl.Marker({ element: planeEl })
      .setLngLat([leg.from.lng, leg.from.lat])
      .addTo(map);

    markersRef.current.push(fromMarker, toMarker, planeMarker);

    const runId = runIdRef.current;
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    const duration = ROUTE_STEP_MS;
    const start = performance.now();

    return new Promise<void>((resolve) => {
      const tick = (time: number) => {
        if (runId !== runIdRef.current) {
          resolve();
          return;
        }

        const t = clamp((time - start) / duration, 0, 1);
        const lng = lerp(leg.from.lng, leg.to.lng, t);
        const lat = lerp(leg.from.lat, leg.to.lat, t);

        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [leg.from.lng, leg.from.lat],
              [lng, lat]
            ]
          }
        });

        planeMarker.setLngLat([lng, lat]);

        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }

        resolve();
      };

      requestAnimationFrame(tick);
    });
  };

  useEffect(() => {
    if (!isSectionVisible) {
      return;
    }
    if (isSequenceCompleted && activeContentIndex === items.length - 1) {
      return;
    }

    runIdRef.current += 1;
    timelineTimersRef.current.forEach((id) => window.clearTimeout(id));
    timelineTimersRef.current = [];

    setShowDate(false);
    setShowTitle(false);
    setShowDescription(false);
    setShowMap(false);
    setActiveRoutes([]);
    setImagePhaseByIndex({});
    setHeroImage(null);
    setElapsedMs(0);

    if (!currentContent) {
      return;
    }

    let cancelled = false;
    let elapsed = 0;

    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsPlaybackLocked(true);

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          elapsed += ms;
          setElapsedMs(elapsed);
          resolve();
        }, ms);
        timelineTimersRef.current.push(timeoutId);
      });

    const waitForMapReady = async () => {
      const start = performance.now();
      while (!cancelled) {
        if (mapReadyRef.current && mapRef.current) {
          return true;
        }
        if (performance.now() - start > 5000) {
          return false;
        }
        await wait(50);
      }
      return false;
    };

    const runTimeline = async () => {
      for (const event of currentContent.timeline) {
        await wait(event.delayMs);
        if (cancelled) {
          return;
        }

        if (event.cue === 'date') {
          setShowDate(true);
          continue;
        }
        if (event.cue === 'title') {
          setShowTitle(true);
          continue;
        }
        if (event.cue === 'description') {
          setShowDescription(true);
          continue;
        }
        if (event.cue === 'map') {
          setShowMap(true);
          await wait(MAP_STEP_MS);
          continue;
        }
        if (event.cue === 'route') {
          const index = event.routeIndex ?? 0;
          setActiveRoutes((prev) => (prev.includes(index) ? prev : [...prev, index]));
          const ready = await waitForMapReady();
          if (cancelled) {
            return;
          }
          if (!ready) {
            continue;
          }
          await animateRoute(index);
          continue;
        }
        if (event.cue === 'image') {
          const index = event.imageIndex ?? 0;
          const side = event.side ?? (index % 2 === 0 ? 'left' : 'right');
          const holdMs = (event.holdMs ?? 1000) * IMAGE_TIME_SCALE;

          setHeroImage({ index, side });
          setImagePhaseByIndex((prev) => ({ ...prev, [index]: 'hero' }));
          await wait(IMAGE_ENTRY_MS + holdMs);
          if (cancelled) {
            return;
          }
          setImagePhaseByIndex((prev) => ({ ...prev, [index]: 'thumb' }));
          setHeroImage((prev) => (prev?.index === index ? null : prev));
          await wait(IMAGE_TO_THUMB_MS);
        }
      }

      if (cancelled) {
        return;
      }

      const hasNext = activeContentIndex < items.length - 1;
      if (!hasNext) {
        setIsPlaybackLocked(false);
        setIsSequenceCompleted(true);
        return;
      }

      autoAdvanceTimerRef.current = window.setTimeout(() => {
        setIsSequenceCompleted(false);
        setActiveContentIndex((prev) => clamp(prev + 1, 0, items.length - 1));
      }, 1000);
    };

    runTimeline();

    return () => {
      cancelled = true;
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      timelineTimersRef.current.forEach((id) => window.clearTimeout(id));
      timelineTimersRef.current = [];
    };
  }, [activeContentIndex, currentContent, isSectionVisible, isSequenceCompleted, items.length]);

  useEffect(() => {
    if (!showMap) {
      if (mapRef.current) {
        runIdRef.current += 1;
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
      return;
    }

    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [2.2, 47.3],
      zoom: 4.8,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      runIdRef.current += 1;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [showMap]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    clearRouteScene();
    fitToAllRoutePoints(mapRef.current, currentContent.routes);
  }, [currentContent.routes, mapReady]);

  const timelineWithState = useMemo(() => {
    let cursor = 0;
    return currentContent.timeline.map((event, index) => {
      cursor += event.delayMs;
      return {
        ...event,
        index,
        atMs: cursor,
        active: elapsedMs >= cursor
      };
    });
  }, [currentContent.timeline, elapsedMs]);

  if (!currentContent) {
    return null;
  }

  return (
    <section
      className={`content-showcase ${variant}`}
      ref={sectionRef}
      style={{ ['--content-count' as string]: String(items.length), ['--step-count' as string]: String(items.length * 4) }}
    >
      <LayoutGroup id={`content-${activeContentIndex}`}>
        <div className="showcase-sticky">
          <div className="showcase-shell">
          <aside className="showcase-progress">
            <p className="progress-kicker">Contenus</p>
            <p className="progress-title">{currentContent.date} · {currentContent.title}</p>
            <p className="progress-step">Stepper + lecture auto</p>
            <Stepper
              steps={items.map((item, index) => ({
                id: index,
                label: String(index + 1),
                tooltip: item.title
              }))}
              activeStep={activeContentIndex}
              onStepClick={(step) => {
                if (autoAdvanceTimerRef.current) {
                  window.clearTimeout(autoAdvanceTimerRef.current);
                  autoAdvanceTimerRef.current = null;
                }
                setIsPlaybackLocked(true);
                setIsSequenceCompleted(false);
                setActiveContentIndex(step);
              }}
            />
            <p className="progress-counter">{activeContentIndex + 1} / {items.length}</p>
            <div className="progress-meter" role="presentation">
              <span style={{ height: `${progressRatio}%`, width: `${progressRatio}%` }}></span>
            </div>
          </aside>

          <AnimatePresence mode="wait">
            <motion.div
              className="showcase-stage"
              key={`content-${activeContentIndex}`}
              initial={preset.stageInitial}
              animate={preset.stageAnimate}
              exit={preset.stageExit}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.article
                className="stage-card stage-meta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <motion.p animate={{ opacity: showDate ? 1 : 0.2 }}>{currentContent.date}</motion.p>
                <motion.h2 animate={{ opacity: showTitle ? 1 : 0.2 }}>{currentContent.title}</motion.h2>
                <motion.p className="lead" animate={{ opacity: showDescription ? 1 : 0.2 }}>
                  {currentContent.description}
                </motion.p>
              </motion.article>

              <div className="stage-columns">
                <motion.article
                  className="stage-card stage-map"
                  animate={{ opacity: showMap ? 1 : 0.12, y: showMap ? 0 : 16 }}
                  transition={{ duration: 0.35 }}
                >
                  <h3>Carte des deplacements</h3>
                  <p>Declenchement selon le frontmatter timeline.</p>
                  {showMap ? (
                    <div ref={mapContainerRef} className="map-canvas"></div>
                  ) : (
                    <div className="map-canvas map-placeholder">La carte apparait a l'evenement map</div>
                  )}

                  <motion.ul
                    className="route-legend"
                    initial={false}
                    animate={{ opacity: activeRoutes.length > 0 ? 1 : 0, y: activeRoutes.length > 0 ? 0 : 10 }}
                    transition={{ duration: 0.28 }}
                  >
                    {currentContent.routes?.map((route, index) => (
                      <li key={`${route.from.name}-${route.to.name}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        {route.from.name} {'->'} {route.to.name}
                      </li>
                    ))}
                  </motion.ul>
                </motion.article>

                <motion.article className="stage-card stage-gallery" animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                  <h3>Photographies associees</h3>
                  <p>Image hero (90% viewport) puis retour fluide vers le thumbnail.</p>
                  <ul className="thumb-grid">
                    {currentContent.images.map((image, index) => {
                      const phase = imagePhaseByIndex[index];
                      const isThumbnail = phase === 'thumb';
                      return (
                        <li key={image} className={`thumb-slot ${isThumbnail ? 'is-filled' : ''}`}>
                          <button type="button" onClick={() => isThumbnail && setModalImage(image)} disabled={!isThumbnail}>
                            {isThumbnail ? (
                              <motion.img
                                layoutId={`media-${activeContentIndex}-${index}`}
                                src={image}
                                alt={`Archive ${index + 1}`}
                                loading="lazy"
                                transition={{ layout: { duration: IMAGE_TO_THUMB_MS / 1000, ease: [0.22, 1, 0.36, 1] } }}
                              />
                            ) : (
                              <span className="thumb-placeholder"></span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.article>
              </div>

              <article className="stage-card timeline-card">
                <h3>Timeline du contenu</h3>
                <ul className="timeline-list">
                  {timelineWithState.map((event) => (
                    <li key={`${event.cue}-${event.index}-${event.atMs}`} className={event.active ? 'is-active' : ''}>
                      <span>+{event.delayMs}ms</span>
                      <strong>{event.cue}</strong>
                      {typeof event.routeIndex === 'number' ? <em>route {event.routeIndex + 1}</em> : null}
                      {typeof event.imageIndex === 'number' ? <em>image {event.imageIndex + 1}</em> : null}
                    </li>
                  ))}
                </ul>
              </article>
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      
        <AnimatePresence>
          {heroImage && imagePhaseByIndex[heroImage.index] === 'hero' && (
            <motion.div className="hero-image-overlay">
              <motion.img
                layoutId={`media-${activeContentIndex}-${heroImage.index}`}
                className="hero-image-floating"
                src={currentContent.images[heroImage.index]}
                alt="Apercu animation image"
                initial={{ opacity: 0, x: heroImage.side === 'left' ? -320 : 320, scale: 0.72 }}
                animate={{ opacity: 1, x: 0, scale: 1.5 }}
                exit={{ opacity: 1, scale: 1.5 }}
                transition={{
                  x: { duration: IMAGE_ENTRY_MS / 1000, ease: [0.2, 0.75, 0.2, 1] },
                  scale: { duration: IMAGE_ENTRY_MS / 1000, ease: [0.2, 0.75, 0.2, 1] },
                  opacity: { duration: 0.35 },
                  layout: { duration: IMAGE_TO_THUMB_MS / 1000, ease: [0.22, 1, 0.36, 1] }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      <AnimatePresence>
        {modalImage && (
          <motion.div
            className="media-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalImage(null)}
          >
            <motion.div
              className="media-modal-inner"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => setModalImage(null)}>Fermer</button>
              <img src={modalImage} alt="Agrandissement d'une archive" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

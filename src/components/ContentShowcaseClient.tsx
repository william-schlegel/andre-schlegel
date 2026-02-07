import { AnimatePresence, motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PresentationContent } from '../lib/presentation-types';

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

  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [previewContent, setPreviewContent] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  const [showDate, setShowDate] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState<number[]>([]);
  const [thumbnailImages, setThumbnailImages] = useState<number[]>([]);
  const [heroImage, setHeroImage] = useState<{ index: number; side: 'left' | 'right' } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const preset = PRESETS[variant];
  const currentContent = items[activeContentIndex];
  const progressRatio = items.length <= 1 ? 100 : (activeContentIndex / (items.length - 1)) * 100;

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

  const commitPreview = () => {
    const next = clamp(previewContent ?? activeContentIndex, 0, items.length - 1);
    setIsDraggingProgress(false);
    setPreviewContent(null);
    setActiveContentIndex(next);
  };

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current || isDraggingProgress) {
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const maxScroll = Math.max(sectionRef.current.offsetHeight - window.innerHeight, 1);
      const passed = clamp(-rect.top, 0, maxScroll);
      const ratio = passed / maxScroll;
      const nextIndex = clamp(Math.round(ratio * (items.length - 1)), 0, items.length - 1);

      if (nextIndex !== activeContentIndex) {
        setActiveContentIndex(nextIndex);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [activeContentIndex, isDraggingProgress, items.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') {
        return;
      }

      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const next = clamp(activeContentIndex + direction, 0, items.length - 1);
      if (next !== activeContentIndex) {
        event.preventDefault();
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

  const animateRoute = (routeIndex: number) => {
    const map = mapRef.current;
    if (!map || !mapReady || !currentContent.routes?.[routeIndex]) {
      return;
    }

    const leg = currentContent.routes[routeIndex];
    const sourceId = `route-${activeContentIndex}-${routeIndex}`;

    if (map.getSource(sourceId)) {
      return;
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
    const duration = 1400;
    const start = performance.now();

    const tick = (time: number) => {
      if (runId !== runIdRef.current) {
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
      }
    };

    requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!isSectionVisible) {
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
    setThumbnailImages([]);
    setHeroImage(null);
    setElapsedMs(0);

    if (!currentContent) {
      return;
    }

    const timeline = [...currentContent.timeline].sort((a, b) => a.at - b.at);

    const elapsedInterval = window.setInterval(() => {
      setElapsedMs((prev) => {
        const max = timeline[timeline.length - 1]?.at ?? 0;
        return prev < max + 1200 ? prev + 50 : prev;
      });
    }, 50);

    timeline.forEach((event) => {
      const timerId = window.setTimeout(() => {
        if (event.cue === 'date') {
          setShowDate(true);
        }
        if (event.cue === 'title') {
          setShowTitle(true);
        }
        if (event.cue === 'description') {
          setShowDescription(true);
        }
        if (event.cue === 'map') {
          setShowMap(true);
        }
        if (event.cue === 'route') {
          const index = event.routeIndex ?? 0;
          setActiveRoutes((prev) => (prev.includes(index) ? prev : [...prev, index]));
        }
        if (event.cue === 'image') {
          const index = event.imageIndex ?? 0;
          const side = event.side ?? (index % 2 === 0 ? 'left' : 'right');
          setHeroImage({ index, side });
          window.setTimeout(() => {
            setThumbnailImages((prev) => (prev.includes(index) ? prev : [...prev, index]));
            setHeroImage((prev) => (prev?.index === index ? null : prev));
          }, 1000);
        }
      }, event.at);
      timelineTimersRef.current.push(timerId);
    });

    timelineTimersRef.current.push(elapsedInterval);

    return () => {
      timelineTimersRef.current.forEach((id) => window.clearTimeout(id));
      timelineTimersRef.current = [];
      window.clearInterval(elapsedInterval);
    };
  }, [activeContentIndex, currentContent, isSectionVisible]);

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

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    activeRoutes.forEach((routeIndex) => animateRoute(routeIndex));
  }, [activeRoutes, mapReady]);

  const timelineWithState = useMemo(() => {
    return currentContent.timeline
      .slice()
      .sort((a, b) => a.at - b.at)
      .map((event, index) => ({
        ...event,
        index,
        active: elapsedMs >= event.at
      }));
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
      <div className="showcase-sticky">
        <div className="showcase-shell">
          <aside className="showcase-progress">
            <p className="progress-kicker">Contenus</p>
            <p className="progress-title">{currentContent.date} · {currentContent.title}</p>
            <p className="progress-step">Timeline auto</p>
            <div className="progress-meter" role="presentation">
              <span style={{ height: `${progressRatio}%`, width: `${progressRatio}%` }}></span>
            </div>
            <input
              className="progress-range"
              type="range"
              min={0}
              max={items.length - 1}
              value={previewContent ?? activeContentIndex}
              onPointerDown={() => setIsDraggingProgress(true)}
              onChange={(event) => setPreviewContent(Number(event.currentTarget.value))}
              onPointerUp={commitPreview}
              onTouchEnd={commitPreview}
              aria-label="Progression des contenus"
            />
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
                  <p>Image hero puis rangement automatique en thumbnail.</p>
                  <ul className="thumb-grid">
                    {currentContent.images.map((image, index) => {
                      const visible = thumbnailImages.includes(index);
                      return (
                        <motion.li
                          key={image}
                          initial={{ opacity: 0, x: preset.thumbOffsetX, y: preset.thumbOffsetY }}
                          animate={{
                            opacity: visible ? 1 : 0.05,
                            x: visible ? 0 : preset.thumbOffsetX,
                            y: visible ? 0 : preset.thumbOffsetY
                          }}
                          transition={{ duration: 0.32 }}
                        >
                          <button type="button" onClick={() => setModalImage(image)}>
                            <img src={image} alt={`Archive ${index + 1}`} loading="lazy" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.article>
              </div>

              <article className="stage-card timeline-card">
                <h3>Timeline du contenu</h3>
                <ul className="timeline-list">
                  {timelineWithState.map((event) => (
                    <li key={`${event.cue}-${event.index}-${event.at}`} className={event.active ? 'is-active' : ''}>
                      <span>{String(event.at).padStart(4, '0')}ms</span>
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
        {heroImage && (
          <motion.div
            className={`hero-image-overlay hero-${heroImage.side}`}
            initial={{ opacity: 0, x: heroImage.side === 'left' ? -260 : 260, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: heroImage.side === 'left' ? -180 : 180, scale: 0.94 }}
            transition={{ duration: 0.45 }}
          >
            <img src={currentContent.images[heroImage.index]} alt="Apercu animation image" />
          </motion.div>
        )}
      </AnimatePresence>

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

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * The cut from one place to another (the table, the Shelf): the picture goes black at once
 * and comes back on the new place, so the camera is never seen crossing the room.
 */
export function Curtain({ place }: { place: string }) {
  const curtain = useRef<HTMLDivElement>(null);
  const from = useRef(place);
  useGSAP(
    () => {
      if (from.current === place) return;
      from.current = place;
      gsap.fromTo(curtain.current, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut', delay: 0.12 });
    },
    { dependencies: [place] },
  );
  return <div ref={curtain} className="pointer-events-none invisible absolute inset-0 z-10 bg-black" aria-hidden="true" />;
}

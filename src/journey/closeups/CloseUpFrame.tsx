import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, type ReactNode } from 'react';
import { closeCloseUp } from '../engine/journey';

gsap.registerPlugin(useGSAP);

/**
 * What every Close-up shares: the Narration waits behind it, Escape or the cross closes it.
 * `veil` darkens the Scene behind (for Close-ups that are not part of the table itself).
 * `back` is given when closing leads somewhere else than the Scene: a print goes back in its folder.
 */
export function CloseUpFrame({ label, veil = true, back, children }: { label: string; veil?: boolean; back?: () => void; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const close = back ?? closeCloseUp;

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [close]);

  useGSAP(() => {
    gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
  });

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} className="invisible absolute inset-0 z-20">
      {veil && <div className="absolute inset-0 bg-night/80 backdrop-blur-[6px]" onClick={close} />}
      {children}
      <button
        type="button"
        onClick={close}
        autoFocus
        className="typed absolute right-4 top-4 flex items-center gap-2 rounded-sm border border-paper/35 bg-night/70 px-3 py-[0.4rem] text-[0.72rem] uppercase tracking-[0.14em] text-paper backdrop-blur-sm transition hover:border-lamp hover:text-lamp"
      >
        {back ? 'Retour' : 'Fermer'}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  );
}

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, type PointerEvent } from 'react';
import type { PrintCue } from '../content/types';
import { CloseUpFrame } from './CloseUpFrame';

/** A photograph or a document taken in hand: seen whole, then closer where the visitor points. */
export function PrintCloseUp({ print }: { print: PrintCue }) {
  const sheet = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  useGSAP(() => {
    gsap.fromTo(sheet.current, { y: 40, rotate: -3, scale: 0.9 }, { y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
  });

  const point = (event: PointerEvent<HTMLImageElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin(`${((event.clientX - box.left) / box.width) * 100}% ${((event.clientY - box.top) / box.height) * 100}%`);
  };

  const isPhoto = (print.paper ?? 'photo') === 'photo';

  return (
    <CloseUpFrame label={print.legend}>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 pb-6 pt-14">
        <div ref={sheet} className={`pointer-events-auto min-h-0 overflow-hidden shadow-[0_30px_80px_rgb(0_0_0/0.7)] ${isPhoto ? 'bg-[#f4f0e6] p-[1.1vmin]' : ''}`}>
          <img
            src={print.src}
            alt={print.legend}
            draggable={false}
            onClick={(event) => {
              point(event as unknown as PointerEvent<HTMLImageElement>);
              setNear(!near);
            }}
            onPointerMove={near ? point : undefined}
            className="block max-h-[72vh] max-w-[88vw] select-none object-contain transition-transform duration-500 ease-out"
            style={{ transform: near ? 'scale(2.4)' : 'scale(1)', transformOrigin: origin, cursor: near ? 'zoom-out' : 'zoom-in' }}
          />
        </div>
        <div className="pointer-events-auto max-w-[70ch] text-center">
          <p className="text-[clamp(1.05rem,0.8rem+0.6vw,1.4rem)] text-paper-light">{print.legend}</p>
          <p className="typed mt-1 text-[0.74rem] tracking-wide text-paper/60">
            {print.source}
            {print.bonus ? ' — document hors film' : ''}
          </p>
        </div>
      </div>
    </CloseUpFrame>
  );
}

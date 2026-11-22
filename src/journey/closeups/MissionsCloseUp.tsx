import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { missionsOf, typedDate, writtenDate } from '../content/missionsList';
import type { MissionsCue } from '../content/types';
import { closeCloseUp, seek } from '../engine/journey';
import { useJourney } from '../engine/store';
import { CloseUpFrame } from './CloseUpFrame';

/**
 * A page of the Missions list taken in hand: every sortie of the period, to be read at leisure.
 * The sorties Eric tells are underlined; choosing one takes the Narration to its telling.
 */
export function MissionsCloseUp({ sheet }: { sheet: MissionsCue }) {
  const paper = useRef<HTMLDivElement>(null);
  const missions = missionsOf(sheet.period);

  useGSAP(() => {
    gsap.fromTo(paper.current, { y: 40, rotate: -1.5, scale: 0.94 }, { y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
  });

  const go = (at: number) => {
    seek(at);
    // choosing a sortie is asking to hear it told
    useJourney.setState({ resumeOnClose: true });
    closeCloseUp();
  };

  return (
    <CloseUpFrame label={sheet.legend}>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pb-5 pt-14">
        <div
          ref={paper}
          className="typed pointer-events-auto max-h-[76vh] w-[min(76rem,94vw)] select-text overflow-y-auto bg-paper px-[clamp(1.2rem,3vw,2.6rem)] py-[clamp(1.2rem,2.6vw,2.2rem)] text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]"
        >
          <div className="text-center">
            {sheet.heading.map((line, index) => (
              <p key={index} className={index === 0 ? 'text-[1.35rem] tracking-[0.08em]' : 'mt-1 text-[0.92rem]'}>
                {line}
              </p>
            ))}
          </div>
          <table className="mt-5 w-full border-collapse text-left text-[clamp(0.72rem,0.55rem+0.42vw,0.95rem)] leading-snug">
            <thead>
              <tr className="border-y-2 border-ink/80 text-[0.82em] tracking-[0.18em]">
                <th className="py-[0.4rem] pr-3 font-normal">DATE</th>
                <th className="py-[0.4rem] pr-3 font-normal">AVION</th>
                <th className="py-[0.4rem] pr-3 font-normal">OBJECTIF</th>
                <th className="py-[0.4rem] pr-3 font-normal">INCIDENT</th>
                <th className="py-[0.4rem] pr-3 font-normal">CITATION</th>
                <th className="py-[0.4rem] font-normal">
                  <span className="sr-only">Récit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => {
                const told = sheet.told.find((entry) => entry.date === mission.date);
                return (
                  <tr key={mission.date} className={`border-b ${told ? 'border-b-2 border-red-ink' : 'border-ink/15'}`}>
                    <td className="whitespace-nowrap py-[0.32rem] pr-3">
                      <time dateTime={mission.date} title={writtenDate(mission.date)}>
                        {typedDate(mission.date)}
                      </time>
                    </td>
                    <td className="whitespace-nowrap py-[0.32rem] pr-3">{mission.aircraft}</td>
                    <td className="py-[0.32rem] pr-3">{mission.target}</td>
                    <td className="py-[0.32rem] pr-3">{mission.note}</td>
                    <td className="py-[0.32rem] pr-3">{mission.cited}</td>
                    <td className="py-[0.2rem] text-right">
                      {told && (
                        <button
                          type="button"
                          onClick={() => go(told.from ?? told.at)}
                          aria-label={`Écouter le récit de la mission du ${writtenDate(mission.date)}`}
                          className="whitespace-nowrap rounded-sm border border-red-ink/60 px-[0.45rem] py-[0.08rem] text-[0.86em] text-red-ink transition hover:bg-red-ink hover:text-paper"
                        >
                          ▸ écouter
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-[0.74rem] leading-snug text-ink-soft">
            Soulignées en rouge : les missions qu’Éric raconte. Les citations à l’ordre de la brigade et de la division aériennes sont celles de l’équipage ; celles à
            l’ordre de l’armée aérienne et la Distinguished Flying Cross, celles du capitaine Schlegel.
          </p>
        </div>
        <div className="pointer-events-auto max-w-[80ch] text-center">
          <p className="text-[clamp(1rem,0.8rem+0.5vw,1.3rem)] text-paper-light">{sheet.legend}</p>
          <p className="typed mt-1 text-[0.74rem] tracking-wide text-paper/60">{sheet.source}</p>
        </div>
      </div>
    </CloseUpFrame>
  );
}

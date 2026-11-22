import type { ReactNode } from 'react';
import { openChapters, openCloseUp } from '../engine/journey';
import { useJourney } from '../engine/store';

function Control({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      title={label}
      className={`typed flex items-center gap-2 rounded-sm border px-3 py-[0.4rem] text-[0.72rem] uppercase tracking-[0.14em] backdrop-blur-sm transition ${
        pressed === false ? 'border-paper/15 bg-night/40 text-paper/40 hover:text-paper/70' : 'border-paper/25 bg-night/50 text-paper/85 hover:border-lamp hover:text-lamp'
      }`}
    >
      {children}
    </button>
  );
}

/** On a small screen the pictogram stands alone (the word is still read aloud, and shown on hover). */
function Word({ children }: { children: ReactNode }) {
  return <span className="max-lg:sr-only">{children}</span>;
}

/** The few things a visitor can ask for at any moment of a Scene. */
export function Controls() {
  const captions = useJourney((state) => state.captions);
  const sounds = useJourney((state) => state.sounds);

  return (
    <nav className="absolute right-4 top-4 flex items-center gap-2" aria-label="Commandes du parcours">
      <Control label="Aller à un chapitre" onClick={openChapters}>
        <svg width="13" height="11" viewBox="0 0 13 11" aria-hidden="true">
          <path d="M0 1h13M0 5.5h13M0 10h13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <Word>Chapitres</Word>
      </Control>
      <Control label="Lire le texte du chapitre" onClick={() => openCloseUp({ kind: 'text' })}>
        <svg width="12" height="13" viewBox="0 0 12 13" aria-hidden="true">
          <path d="M1 .7h10v11.6H1z M3 4h6M3 6.5h6M3 9h4" stroke="currentColor" strokeWidth="1.1" fill="none" />
        </svg>
        <Word>Texte</Word>
      </Control>
      <Control label={captions ? 'Masquer les sous-titres' : 'Afficher les sous-titres'} pressed={captions} onClick={() => useJourney.setState({ captions: !captions })}>
        <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">
          <rect x=".6" y=".6" width="13.8" height="9.8" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none" />
          <path d="M3 5h4M9 5h3M3 7.5h2M7 7.5h5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
        <Word>Sous-titres</Word>
      </Control>
      <Control label={sounds ? 'Couper les sons d’ambiance (la voix reste)' : 'Rétablir les sons d’ambiance'} pressed={sounds} onClick={() => useJourney.setState({ sounds: !sounds })}>
        <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
          <path d="M1 4h2.5L7 1v10L3.5 8H1z" fill="currentColor" />
          {sounds ? <path d="M9 3.5c1.3 1.3 1.3 3.7 0 5M10.8 1.8c2.3 2.3 2.3 6.1 0 8.4" stroke="currentColor" strokeWidth="1.1" fill="none" /> : <path d="M9.3 4l3.4 4M12.7 4L9.3 8" stroke="currentColor" strokeWidth="1.1" />}
        </svg>
        <Word>Ambiance</Word>
      </Control>
      <Control label="Voir les documents que le film ne montre pas" onClick={() => openCloseUp({ kind: 'bonuses' })}>
        <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
          <path d="M.7 2.2V11h12.6V3.6H6.4L5 1H1.6z" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
        </svg>
        <Word>Hors film</Word>
      </Control>
      <a
        href="/sources"
        className="typed rounded-sm border border-paper/25 bg-night/50 px-3 py-[0.4rem] text-[0.72rem] uppercase tracking-[0.14em] text-paper/85 no-underline backdrop-blur-sm transition hover:border-lamp hover:text-lamp"
      >
        Sources
      </a>
    </nav>
  );
}

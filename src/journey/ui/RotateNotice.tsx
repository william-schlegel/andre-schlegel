/** A phone held upright is too narrow for the table: the visitor is asked to turn it. */
export function RotateNotice() {
  return (
    <div className="absolute inset-0 z-50 hidden flex-col items-center justify-center gap-6 bg-night px-10 text-center max-[720px]:portrait:flex">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" className="text-lamp">
        <rect x="34" y="14" width="28" height="52" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <rect x="22" y="48" width="52" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <animateTransform attributeName="transform" type="rotate" values="-90 48 62;0 48 62;0 48 62" keyTimes="0;0.6;1" dur="2.4s" repeatCount="indefinite" />
        </rect>
      </svg>
      <p className="title-face text-[1.7rem] leading-tight text-paper-light">Tournez votre téléphone</p>
      <p className="text-[1.1rem] text-paper/75">Ce récit se regarde en largeur, comme un carnet ouvert sur une table.</p>
    </div>
  );
}

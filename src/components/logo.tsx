// The Balearic sling: the cord whirling round, the stone flying off it.
// Same drawing as src/app/logo.svg and src/app/icon.svg.
export const slingPath =
  'M14.2 23.1 13.9 23.1 13.6 23.3 13.2 23.5 13.0 23.9 12.8 24.3 12.7 24.8 12.8 25.4 12.9 25.9 13.3 26.5 13.7 27.0 14.3 27.4 15.0 27.6 15.8 27.8 16.6 27.7 17.4 27.5 18.2 27.1 19.0 26.5 19.6 25.7 20.0 24.7 20.3 23.7 20.3 22.6 20.1 21.4 19.6 20.3 18.9 19.3 18.0 18.5 16.9 17.8 15.6 17.3 14.2 17.1 12.8 17.2 11.3 17.7 10.0 18.4 8.8 19.4 7.8 20.6 7.1 22.1 6.7 23.8 6.6 25.5 6.9 27.2 7.5 28.9 8.5 30.5 9.9 31.8 11.5 32.9 13.3 33.6 15.3 34.0 17.3 33.9 19.4 33.4 21.3 32.5 23.1 31.2 24.5 29.5';

export const Logo = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <svg
    className={`shrink-0 ${className}`}
    viewBox="3 7.4 36 36"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={slingPath}
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="31.8" cy="21.2" r="4.3" className="fill-accent" />
  </svg>
);

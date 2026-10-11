const StatIcon = ({ name, size = 24 }: any) => (
  <svg
    className={`stat-svg stat-svg-${name}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {name === 'stat-live' && (
      <>
        <path d="M12 2.5c2.8 1.9 4.2 5 4.2 8.3l-2.4 2.4h-3.6L7.8 10.8C7.8 7.5 9.2 4.4 12 2.5z" />
        <circle cx="12" cy="8.5" r="1.5" />
        <path d="M9.2 12.3 6.5 15l3 .8M14.8 12.3l2.7 2.7-3 .8" />
        <g className="si-flame">
          <path d="M11 14.5c.3 1.6-.4 2.6-.4 4.2M13 14.5c-.3 1.6.4 2.6.4 4.2M12 14.5v4.5" />
        </g>
        <path className="si-lines" d="M4.5 16.5 3 19M19.5 16.5 21 19" />
      </>
    )}
    {name === 'stat-stack' && (
      <>
        <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
        <path className="si-l2" d="M4.5 12 12 16l7.5-4" />
        <path className="si-l3" d="M4.5 15.5 12 19.5l7.5-4" />
      </>
    )}
    {name === 'stat-areas' && (
      <>
        <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
        <rect className="si-core" x="10" y="10" width="4" height="4" rx="1" />
        <path className="si-pins-a" d="M9 3.5v3M15 3.5v3M9 17.5v3M15 17.5v3" />
        <path className="si-pins-b" d="M3.5 9h3M3.5 15h3M17.5 9h3M17.5 15h3" />
      </>
    )}
  </svg>
);

export default StatIcon;

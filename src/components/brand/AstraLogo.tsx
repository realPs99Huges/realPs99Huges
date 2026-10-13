import './AstraLogo.css';

export function AstraMark({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`astra-mark ${className}`}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="astra-mark__orbit-line" cx="16" cy="16" r="13" />
      <g className="astra-mark__orbit">
        <circle cx="16" cy="3" r="1.35" className="astra-mark__moon" />
      </g>
      <g className="astra-mark__diagonal">
        <path d="M16 9.5Q16.4 15.6 22.5 16 16.4 16.4 16 22.5 15.6 16.4 9.5 16 15.6 15.6 16 9.5Z" />
      </g>
      <g className="astra-mark__star">
        <path d="M16 4Q16.9 15.1 28 16 16.9 16.9 16 28 15.1 16.9 4 16 15.1 15.1 16 4Z" />
      </g>
    </svg>
  );
}

interface AstraLogoProps {
  onClick?: () => void;
  href?: string;
}

export function AstraLogo({ onClick, href = '#top' }: AstraLogoProps) {
  return (
    <a
      className="astra-logo"
      href={href}
      onClick={(event) => {
        if (!onClick) return;
        event.preventDefault();
        onClick();
      }}
      aria-label="ASTRA — back to the start"
    >
      <AstraMark />
      <span className="astra-logo__word" aria-hidden="true">
        ASTRA
      </span>
    </a>
  );
}

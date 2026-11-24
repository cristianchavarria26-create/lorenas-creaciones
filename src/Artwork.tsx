import { useId } from "react";
import type { CSSProperties } from "react";

const paths = {
  arrow: (
    <>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </>
  ),
  diagonal: (
    <>
      <path d="M5 19 19 5M5 5h14v14" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.7 11.7a8.7 8.7 0 0 1-12.9 7.7L3 20.7l1.3-4.6a8.7 8.7 0 1 1 16.4-4.4Z" />
      <path
        d="M8.3 7.6c.3-.4.6-.4.9.2l1 2c.2.3-.2.7-.7 1.2.7 1.7 1.9 2.8 3.7 3.5l1-1.1c.2-.3.5-.3.9-.1l1.8.9c.3.2.3.6.1 1.1-.5 1.3-1.7 1.8-3.2 1.3-3.2-1-6-3.8-7-6.5-.4-1 .1-2 .5-2.5Z"
        strokeWidth="1.2"
      />
    </>
  ),
  heart: (
    <path d="M20 4.8c-2.9-2.6-6.6-1-8 1.9-1.8-3.3-5.4-4.2-8-1.5-3 3.4 0 7 2.7 9.6L12 20l5.5-5.3c3.2-3.2 5.6-6.8 2.5-9.9Z" />
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.7" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.7" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.7" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.7" />
    </>
  ),
  bear: (
    <>
      <path d="M6 7.7C.4 6.1 3.8.8 7.5 3.2c1 .7 1.1 1.5 1 2.1 2.1-.9 4.9-.9 7.1 0-.3-2.7 3.4-4.1 5.1-1.9 1.7 2.5-.1 4.4-2.2 4.5 1.2 1.7 1.7 3.6 1.5 5.7-.3 4-3.9 6.5-8 6.5s-8-2.5-8.2-6.7C3.7 11.4 4.5 9.2 6 7.7Z" />
      <circle cx="8.5" cy="11.3" r=".7" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11.3" r=".7" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="15.4" rx="3.3" ry="2.4" />
      <path d="m11 14.6 1 1 1-1" />
    </>
  ),
  doll: (
    <>
      <path d="M6.2 9c-2.9-.5-3.5 2.1-3.5 4.2M17.8 9c2.9-.5 3.5 2.1 3.5 4.2" />
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M6.8 7.7c2.2.3 4.4-.9 5.8-3.3 1.1 2.1 2.6 2.9 4.5 3.2M9.7 14l-3.1 6.6c3.3 1.1 7.5 1.1 10.8 0L14.3 14M10.1 9h.1m3.7 0h.1" />
    </>
  ),
  flower: (
    <>
      <path d="M9.3 8.4c-4.1-3.9 1.3-8.3 3.2-3.2 2.4-5 7.2-.6 3.8 2.5 5.6-.1 4.9 5.8.3 5.1 3 4-2.5 7.2-4.6 2.8-1.5 4.9-7.3 2.4-4.6-1.9-5.1 1.3-6.4-4.8-1-5.1Z" />
      <circle cx="12.1" cy="10.4" r="2.4" />
      <path d="M12.2 17v5m0-1c1-2.2 2.4-2.9 4.2-2.9-1.1 2.1-2.6 2.8-4.2 2.9Z" />
    </>
  ),
  needle: (
    <>
      <path d="m4 20 7.7-12.4c2.7-4 5.7-6.5 7.7-4.9 2.2 1.8-.7 5.4-4.1 7.9L4 20Z" />
      <path d="m15.5 7.5 2.4-2.4M17 6c-4.2-8.6-10.5-.5-7.8 2.7 1.4 1.8 2.4 3.5 1.5 5.5" />
    </>
  ),
  spark: (
    <>
      <path d="m12.5 3 1.9 5.7 5.6 2-5.6 2-1.9 5.8-2-5.8-5.5-2 5.5-2L12.5 3Z" />
      <path d="m4 15 .9 2.9 2.8.9-2.8.8L4 22l-.8-2.4-2.5-.8 2.5-.9L4 15Z" />
    </>
  ),
  lock: (
    <>
      <rect x="5.4" y="10" width="13.2" height="11" rx="2" />
      <path d="M8.6 10V7a3.4 3.4 0 0 1 6.8 0v3m-3.4 5v2" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  edit: (
    <>
      <path d="m15.3 4.8 3.9 3.9m-15 11.1 4.9-.9L20 8a2.8 2.8 0 0 0-4-4L5.2 14.9l-1 4.9Z" />
    </>
  ),
  trash: (
    <>
      <path d="M3.5 6h17M8.7 6V3.5h6.6V6M6 6l.8 14h10.4L18 6m-8.5 4.2.3 6m4.7-6-.3 6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  exit: (
    <>
      <path d="M10 3H4v18h6m-1-9h12m-5-5 5 5-5 5" />
    </>
  ),
  picture: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.4" cy="8" r="1.8" />
      <path d="m3 17 5-4 3 2 5.2-6 4.8 5" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 19C1.2 8 8 3 21 3c0 12.2-5.8 18.2-14.6 15.4M4 21l12-13" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
};

export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 19,
  className = "",
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}

export function Sprig({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      className={flipped ? "sprig flipped" : "sprig"}
      width="32"
      height="19"
      viewBox="0 0 36 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 17c8.4-1 17.8-4.8 30-11M13 14c-.3-5-2.8-7.5-4.2-8 .1 5.2 1.6 7.9 4.2 8Zm7-3c-.2-4-1.4-6.8-3.2-8 .1 3.9 1.1 6.6 3.2 8Zm-7 3c3.1.4 5.8 1.6 7.2 3.2-4.1.9-6.7-.6-7.2-3.2Zm10-4.6c2.3-.5 4.9.1 7.5 1.7-3.7 1.4-6 .5-7.5-1.7Z" />
    </svg>
  );
}

export function YarnMark({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`yarn-mark ${className}`}
      viewBox="0 0 77 66"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <ellipse
            cx="36"
            cy="39"
            rx="23"
            ry="21"
            transform="rotate(-13 36 39)"
          />
        </clipPath>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#8a7570" strokeWidth="2.1">
          <path d="m23 5 26 46M56 2 39 35" />
          <circle cx="22.5" cy="4.7" r="2.1" fill="#e6d8ca" />
          <circle cx="56.8" cy="2.8" r="2.1" fill="#e6d8ca" />
        </g>
        <ellipse
          cx="36"
          cy="39"
          rx="23"
          ry="21"
          transform="rotate(-13 36 39)"
          fill="#e4bdc7"
          stroke="#986e7e"
          strokeWidth="1.6"
        />
        <g clipPath={`url(#${id})`} stroke="#aa7c8b" strokeWidth="1.3">
          <path d="M9 29q18-5 29-16M9 33q22-6 32-19M10 37q23-6 35-23M10 41q26-7 38-25M10 45q29-8 41-26M12 49q28-7 42-27M18 55q26-8 39-29M22 59q26-8 36-28M29 61q22-8 31-23M36 62q19-8 25-17" />
          <path d="M12 28q16-4 39 28l-13 6Q23 37 11 38Z" fill="#e9c7cf" />
          <path d="M12 30q17-2 37 28M11 33q16-2 35 27M11 36q15 0 31 25" />
        </g>
        <path
          d="M46.5 56.5c-1.3 7 10 8.6 14.9 2.6 5.5-6.8-1.7-10.2-3.6-6.1-2 4.2 8 9.9 15.2 4.3"
          stroke="#aa7c8b"
          strokeWidth="1.5"
        />
        <g stroke="#9c9a88" strokeWidth="1.1">
          <path
            d="M17 58C9.1 52.2 7.8 42.3 8 35m1.2 11c-4.3-.4-6-2.3-6.8-5.2 3.4.3 5.6 2.3 6.8 5.2Zm1 3.1c2-2 2.7-4.8 2-7.8-2.3 1.6-3 4.5-2 7.8ZM8 39c-2.9-1.8-3.6-4.3-3-6.6 2.6 1.7 3.7 3.8 3 6.6Z"
            fill="#c7c7b2"
          />
        </g>
      </g>
    </svg>
  );
}

export function Brand({ logo = "" }: { logo?: string }) {
  if (logo)
    return (
      <img className="uploaded-brand" src={logo} alt="Lorenas Creaciones" />
    );
  return (
    <span className="brand" aria-label="Lorenas Creaciones">
      <YarnMark />
      <span className="brand-type">
        <span className="brand-script">Lorenas</span>
        <span className="brand-subtitle">Creaciones</span>
      </span>
    </span>
  );
}

export function ThreadHeart() {
  return (
    <svg
      className="thread-heart"
      viewBox="0 0 52 43"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 34c4.8-6.5 14.1-2.9 11.1.4-4.1 4.3-1.9-12 5.2-13.1M28.5 29S12.7 17.7 17.6 11.1c3.3-4.5 8.3-.7 10.2 3.5 1.3-6.5 6.4-12.6 10.7-9.4 6.9 5.2-4.2 18.8-10 23.8Z" />
      <path d="m39 1 1-2m4.3 6 3.6-1m-6.1 7.1 3.5 1.1" />
    </svg>
  );
}

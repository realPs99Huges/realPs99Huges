import type { SVGProps } from 'react';

const ICONS = {
  arrowRight: 'M4 12h15.5M14 6.5l5.5 5.5-5.5 5.5',
  arrowLeft: 'M20 12H4.5M10 6.5 4.5 12l5.5 5.5',
  arrowUp: 'M12 20V4.5M6.5 10 12 4.5l5.5 5.5',
  lock: 'M7 10.5V8a5 5 0 0 1 10 0v2.5M5.5 10.5h13v10h-13zM12 14.5v2.5',
  unlock: 'M7 10.5V8a5 5 0 0 1 9.6-2M5.5 10.5h13v10h-13zM12 14.5v2.5',
  copy: 'M9 9h10.5v11.5H9zM15 9V4.5H4.5V15H9',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  download: 'M12 3.5v11.5M7 10.5l5 5 5-5M4.5 20.5h15',
  restart: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 9h16M4 15h16',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.6v.1',
  edit: 'M4.5 19.5h4L19 9l-4-4L4.5 15.5zM13 7l4 4',
  shield: 'M12 3.5 19.5 6v5.5c0 4.4-3.2 8-7.5 9-4.3-1-7.5-4.6-7.5-9V6z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  sparkle: 'M12 3c.4 4.6 2.4 6.6 7 9-4.6.4-6.6 2.4-7 9-.4-6.6-2.4-8.6-7-9 4.6-2.4 6.6-4.4 7-9z',
  pin: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  minus: 'M5 12h14',
  calendar: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.5, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

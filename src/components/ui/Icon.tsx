const PATHS = {
  home: '<rect x="3" y="3" width="7.5" height="9" rx="1"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1"/><rect x="3" y="15" width="7.5" height="6" rx="1"/>',
  building: '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h7A1.5 1.5 0 0 1 15 4.5V21"/><path d="M15 9h3.5a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M3 21h18"/><path d="M8.5 7.5h3M8.5 11.5h3M8.5 15.5h3"/>',
  users: '<circle cx="9" cy="8" r="3.25"/><path d="M3 20c.4-3.2 2.9-5.5 6-5.5s5.6 2.3 6 5.5"/><path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2"/><path d="M17.5 14.7c1.9.8 3.2 2.7 3.5 5.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  )
}

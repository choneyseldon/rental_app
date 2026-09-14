/**
 * Inline SVGs rather than an icon package: a handful of glyphs is not worth a
 * dependency, and inlining keeps them working with no network at print time.
 */
type P = { className?: string };
const base = "h-5 w-5";

const S = ({ children, className }: P & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className ?? base}
  >
    {children}
  </svg>
);

export const IconHome = (p: P) => (
  <S {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /></S>
);
export const IconBuilding = (p: P) => (
  <S {...p}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" /></S>
);
export const IconReceipt = (p: P) => (
  <S {...p}><path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21z" /><path d="M9.5 8h5M9.5 12h5" /></S>
);
export const IconDrop = (p: P) => (
  <S {...p}><path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z" /></S>
);
export const IconQr = (p: P) => (
  <S {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" /></S>
);
export const IconBell = (p: P) => (
  <S {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z" /><path d="M10 18.5a2 2 0 0 0 4 0" /></S>
);
export const IconDoc = (p: P) => (
  <S {...p}><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" /><path d="M14 3v4h4" /></S>
);
export const IconHelp = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M9.7 9.3a2.4 2.4 0 0 1 4.6.8c0 1.6-2.3 2-2.3 3.4" /><path d="M12 17h.01" /></S>
);
export const IconLogout = (p: P) => (
  <S {...p}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 8l-4 4 4 4M6 12h9" /></S>
);
export const IconChevron = (p: P) => (
  <S {...p}><path d="M9 5l7 7-7 7" /></S>
);
export const IconSend = (p: P) => (
  <S {...p}><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="M21 3 10 14" /></S>
);
export const IconCheck = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.3 2.3 4.7-4.8" /></S>
);
export const IconAlert = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></S>
);
export const IconCash = (p: P) => (
  <S {...p}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></S>
);
export const IconCamera = (p: P) => (
  <S {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.2" /></S>
);
export const IconCopy = (p: P) => (
  <S {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h9" /></S>
);
export const IconBolt = (p: P) => (
  <S {...p}><path d="M13 3 5 13.5h6L11 21l8-10.5h-6z" /></S>
);
export const IconMore = (p: P) => (
  <S {...p}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></S>
);
export const IconCalendar = (p: P) => (
  <S {...p}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></S>
);

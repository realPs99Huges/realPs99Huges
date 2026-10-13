export type View = 'home' | 'reading';
export type NavTarget = 'top' | 'discover' | 'reading' | 'how-it-works';

export const NAV_ITEMS: Array<{ target: NavTarget; label: string; href: string }> = [
  { target: 'discover', label: 'Discover', href: '#discover' },
  { target: 'reading', label: 'Your Reading', href: '#reading' },
  { target: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
];

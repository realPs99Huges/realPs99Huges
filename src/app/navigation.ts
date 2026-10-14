export type View = 'home' | 'reading';
export type NavTarget = 'top' | 'discover' | 'reading' | 'how-it-works';

export const NAV_ITEMS: Array<{ target: NavTarget; label: string; href: string }> = [
  { target: 'discover', label: 'Entdecken', href: '#discover' },
  { target: 'reading', label: 'Deine Deutung', href: '#reading' },
  { target: 'how-it-works', label: 'So funktioniert’s', href: '#how-it-works' },
];

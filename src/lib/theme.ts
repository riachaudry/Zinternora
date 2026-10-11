/** The three selectable dashboard themes. `classic` (Navy & Gold) is the default. */
export const THEMES = [
  { id: 'classic', label: 'Classic Navy & Gold', hint: 'The Internora’s premium navy and gold look (default).' },
  { id: 'light', label: 'Light & Minimal', hint: 'Clean white, soft grey surfaces and subtle blue accents.' },
  { id: 'dark', label: 'Dark Mode', hint: 'Dark backgrounds with comfortable, high-contrast text.' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'classic';
export const THEME_STORAGE_KEY = 'internora-theme';
export const isTheme = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

/** Inline script run before first paint so the saved theme never flashes. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'||t==='classic'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

// Light/dark theme. With no stored choice the page follows the OS
// (prefers-color-scheme in globals.css); a stored one is set as
// `<html data-theme>`, which the CSS lets win over the OS.
export const themeChoices = ['system', 'light', 'dark'] as const;
export type ThemeChoice = (typeof themeChoices)[number];

const storageKey = 'theme';

// Inline in <head> (Body), so a forced theme applies before the first paint
// instead of flashing the OS one.
export const getThemeBootstrap = () =>
  `try{var t=localStorage.getItem(${JSON.stringify(storageKey)});if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export function readThemeChoice(): ThemeChoice {
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

export function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

export function applyThemeChoice(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === 'system') delete root.dataset.theme;
  else root.dataset.theme = choice;
  try {
    if (choice === 'system') localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, choice);
  } catch {
    // Storage blocked (private mode, site data off): the choice lasts for
    // this page only.
  }
}

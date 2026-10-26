declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

// @next/third-parties used to declare these through a catch-all
// `[key: string]: any` on Window.
interface Window {
  dataLayer?: object[];
  // Exposed by Redirecter so GTM can call it.
  redirect: () => void;
  // Google API and Google Identity Services scripts (utils/google-drive.ts).
  /* eslint-disable @typescript-eslint/no-explicit-any */
  gapi: any;
  google: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

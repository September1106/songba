/// <reference types="vite/client" />

declare const startAnimation: (gsap: unknown, MotionPathPlugin: unknown) => () => void;
declare const gsap: unknown;
declare const MotionPathPlugin: unknown;

// empty — actual components are in src/lib/ and imported via Vite alias

declare module 'animal-island-ui/dist/es/components/Loading/island/gsap.min.js' {
  const gsap: unknown;
  export default gsap;
}
declare module 'animal-island-ui/dist/es/components/Loading/island/MotionPathPlugin.min.js' {
  const MotionPathPlugin: unknown;
  export default MotionPathPlugin;
  export { MotionPathPlugin };
}
declare module 'animal-island-ui/dist/es/components/Loading/island/script.js' {
  export function startAnimation(gsap: unknown, MotionPathPlugin: unknown): () => void;
}

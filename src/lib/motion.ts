/**
 * Centralized Framer Motion spring physics constants and reusable spatial animation variants.
 * Inspired by Apple HIG and Linear/Raycast spatial interactions.
 */

export const SPRING = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 32, mass: 0.8 },
  smooth: { type: "spring" as const, stiffness: 280, damping: 28, mass: 1.0 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 24, mass: 1.2 },
  bounce: { type: "spring" as const, stiffness: 350, damping: 20, mass: 0.6 },
};

// Desktop collapsible panel variants
export const panelVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: (width: number | string = 270) => ({
    width,
    opacity: 1,
    transition: SPRING.snappy,
  }),
  exit: {
    width: 0,
    opacity: 0,
    transition: { ...SPRING.snappy, stiffness: 450, damping: 35 },
  },
};

// Full-page horizontal mobile panel transitions (History <-> Studio <-> Canvas)
export const mobilePageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0.85,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: SPRING.smooth,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    opacity: 0.85,
    scale: 0.98,
    transition: SPRING.smooth,
  }),
};

// Floating modal / lightbox overlay variants
export const overlayVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

// Bottom sheet drawer variants
export const sheetVariants = {
  closed: { y: "100%" },
  open: {
    y: 0,
    transition: SPRING.snappy,
  },
  exit: {
    y: "100%",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

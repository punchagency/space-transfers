import { gsap } from "gsap";
import { CANVAS, ANIMATION } from "../../../../config/artboard.config";

export const animateToPosition = (
  element: HTMLElement,
  targetX: number,
  targetY: number,
  onComplete?: () => void
) => {
  gsap.to(element, {
    left: `${targetX * CANVAS.PIXELS_PER_INCH}px`,
    top: `${targetY * CANVAS.PIXELS_PER_INCH}px`,
    duration: ANIMATION.POSITION_DURATION,
    ease: "power2.out",
    onComplete,
  });
};

export const animateBounce = (element: HTMLElement, targetY: number, onComplete?: () => void) => {
  gsap.to(element, {
    top: `${(targetY - ANIMATION.BOUNCE_OFFSET) * CANVAS.PIXELS_PER_INCH}px`,
    duration: ANIMATION.BOUNCE_DURATION,
    ease: "power2.in",
    yoyo: true,
    repeat: 1,
    onComplete,
  });
};

export const animateShake = (element: HTMLElement) => {
  gsap.to(element, {
    x: `+=${ANIMATION.SHAKE_DISTANCE}`,
    yoyo: true,
    repeat: ANIMATION.SHAKE_REPEATS,
    duration: ANIMATION.SHAKE_DURATION,
    ease: "power1.inOut",
    onComplete: () => { gsap.set(element, { x: 0 }); },
  });
};

export const animateItemPosition = (element: HTMLElement, posX: number, posY: number, gravityActive: boolean) => {
  if (gravityActive) {
    gsap.to(element, {
      left: `${posX * CANVAS.PIXELS_PER_INCH}px`,
      top: `${posY * CANVAS.PIXELS_PER_INCH}px`,
      duration: ANIMATION.GRAVITY_DURATION,
      ease: "bounce.out",
    });
  } else {
    gsap.to(element, {
      left: `${posX * CANVAS.PIXELS_PER_INCH}px`,
      top: `${posY * CANVAS.PIXELS_PER_INCH}px`,
      duration: ANIMATION.NORMAL_DURATION,
      ease: "power2.out",
    });
  }
};

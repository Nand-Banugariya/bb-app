/**
 * Motion for the auth screens (Login v2), copied from the design's keyframes. Scoped to the
 * pages that render it — React hoists this <style> into <head> once and dedupes it by `href` —
 * so nothing is added to globals.css. Reduced motion is handled by the global rule there.
 */
const AUTH_MOTION_CSS = `
@keyframes bb-fade{from{opacity:0}to{opacity:1}}
@keyframes bb-pop{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@keyframes bb-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes bb-fwd{from{opacity:0;transform:translateX(32px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes bb-back{from{opacity:0;transform:translateX(-32px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes bb-word{from{transform:translateY(110%) rotate(4deg)}to{transform:none}}
@keyframes bb-draw{to{stroke-dashoffset:0}}
@keyframes bb-scale{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes bb-bar{from{width:0}to{width:100%}}
@keyframes bb-rec{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes bb-sheen{0%,60%{background-position:150% 0}100%{background-position:-50% 0}}
@keyframes bb-sweep{from{transform:translateX(-120%)}to{transform:translateX(320%)}}
@keyframes bb-shoot{0%{transform:translateX(0) scale(1);opacity:1}100%{transform:translateX(70px) scale(.3);opacity:0}}
@keyframes bb-c-tl{from{transform:translate(-18px,-18px);opacity:0}to{transform:none;opacity:1}}
@keyframes bb-c-tr{from{transform:translate(18px,-18px);opacity:0}to{transform:none;opacity:1}}
@keyframes bb-c-bl{from{transform:translate(-18px,18px);opacity:0}to{transform:none;opacity:1}}
@keyframes bb-c-br{from{transform:translate(18px,18px);opacity:0}to{transform:none;opacity:1}}
@keyframes bb-blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.08)}66%{transform:translate(-20px,15px) scale(.95)}}
@keyframes bb-float{0%,100%{translate:0 0}50%{translate:0 -6px}}
`;

/** Mount once on any screen that uses the auth motion (AuthLayout does). */
function AuthMotionStyles() {
    return (
        <style href="bb-auth-motion" precedence="default">
            {AUTH_MOTION_CSS}
        </style>
    );
}

const ENTER = 'cubic-bezier(.16,1,.3,1)';

/** Design animation shorthands, used as inline `style={{ animation }}`. */
const motion = {
    fade: (delay = 0, duration = 0.6) => `bb-fade ${duration}s ease ${delay}s both`,
    up: (delay = 0, duration = 0.6) => `bb-up ${duration}s ${ENTER} ${delay}s both`,
    pop: (delay = 0, duration = 0.2) => `bb-pop ${duration}s ease ${delay}s both`,
    scale: (delay = 0) => `bb-scale .4s cubic-bezier(.34,1.56,.64,1) ${delay}s both`,
    step: (dir: 'fwd' | 'back' = 'fwd') => `bb-${dir} .55s ${ENTER} both`,
    word: (delay: number) => `bb-word .7s ${ENTER} ${delay}s both`,
    pulse: '1.6s ease-in-out infinite bb-rec',
    sheen: 'bb-sheen 3.6s ease-in-out 1.2s infinite',
    sweep: 'bb-sweep .9s linear infinite',
    bar: (duration: number, delay = 0) => `bb-bar ${duration}s ease-in-out ${delay}s both`,
    blob: (duration: number, delay = 0) => `bb-blob ${duration}s ease-in-out ${delay}s infinite`,
    float: (duration: number, delay = 0) => `bb-float ${duration}s ease-in-out ${delay}s infinite`
};

/** The design's error shake, played with the Web Animations API (no keyframes needed). */
const SHAKE_KEYFRAMES: Keyframe[] = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-1px)', offset: 0.1 },
    { transform: 'translateX(3px)', offset: 0.2 },
    { transform: 'translateX(-6px)', offset: 0.3 },
    { transform: 'translateX(6px)', offset: 0.4 },
    { transform: 'translateX(-6px)', offset: 0.5 },
    { transform: 'translateX(6px)', offset: 0.6 },
    { transform: 'translateX(-6px)', offset: 0.7 },
    { transform: 'translateX(3px)', offset: 0.8 },
    { transform: 'translateX(-1px)', offset: 0.9 },
    { transform: 'translateX(0)' }
];

const shake = (el: HTMLElement | null) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.animate(SHAKE_KEYFRAMES, { duration: 420, easing: 'cubic-bezier(.36,.07,.19,.97)' });
};

export { AuthMotionStyles, motion, shake };

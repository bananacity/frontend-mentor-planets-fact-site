import anime from 'https://esm.sh/animejs@3.2.1';

function animatePlanetOrbit(selector, speed = 4000) {
  anime({
    targets: selector,
    rotate: 360,
    loop: true,
    duration: speed,
    easing: 'linear',
    transformOrigin: '50% 50%', // Rotate around center
  });
}

document.addEventListener('DOMContentLoaded', () => {
  animatePlanetOrbit('.planet-image .orbiting-element', 4000);
});

const navList = document.querySelector('.nav-list');
const navMobileList = document.querySelector('.nav-mobile-list');
const header = document.querySelector('.header');
const hamburgerBtn = document.querySelector('.hamburger');
const planetPage = document.querySelector('.planet-page');
const planetParallaxContainer = document.querySelector('.planet-container');
const planetVisual = document.querySelector('.planet-visual');
const planetImage = document.querySelector('.planet-image');
const planetStructureImage = document.querySelector(
  '.planet-internal-structure'
);
const geologyImage = document.querySelector('.geology-image');
const planetTitle = document.querySelector('.planet-title');
const planetDescription = document.querySelector('.planet-description');
const sourceLink = document.querySelector('.source-link');
const statValues = document.querySelectorAll('.stat-value');
const tabs = document.querySelectorAll('.tab');

const BASE_PATH = '/frontend-mentor-planets-fact-site/';

let planets;
let currentPlanet;
let currentView;

let currentScale = 1;
let parallaxX = 0;
let parallaxY = 0;

async function getPlanets() {
  const url = `./data.json`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Couldn't fetch planets. Response status: `,
        response.status
      );

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(`Couldn't fetch planets: `, error.message);
  }
}

function renderNavigationLinks(planets) {
  navList.innerHTML = '';
  navMobileList.innerHTML = '';

  const activeIndicator = document.createElement('span');
  activeIndicator.className = 'nav-indicator';
  navList.appendChild(activeIndicator);

  for (let planet of planets) {
    const planetLi = document.createElement('li');
    planetLi.className = 'nav-item';
    planetLi.innerHTML = `<a href="/${planet.name.toLowerCase()}" class="nav-link">${
      planet.name
    }</a>`;

    navList.appendChild(planetLi);

    // Mobile nav
    planetLiMobile = document.createElement('li');
    planetLiMobile.className = 'nav-mobile-item';
    planetLiMobile.innerHTML = `<a href="/${planet.name.toLowerCase()}" class="nav-mobile-link" style="--planet-border-color: var(--color-${planet.name.toLowerCase()});">
              <div class="nav-mobile-link-container">
                <div class="nav-mobile-planet-wrapper">
                  <span class="nav-mobile-circle" style="background-color: var(--color-${planet.name.toLowerCase()});"></span>
                  <span class="nav-mobile-planet">${planet.name}</span>
                </div>

                <img
                  src="${BASE_PATH}assets/images/icon-chevron.svg"
                  class="nav-mobile-chevron"
                  alt=""
                />
              </div>
            </a>`;

    navMobileList.appendChild(planetLiMobile);
  }

  setupNavIndicatorAutoUpdate();
}

function renderPlanetData(planet, view = 'overview') {
  if (!planet) return;

  document.title = `${planet.name} | Planet Facts`;

  if (currentPlanet !== planet) {
    updateStatValues(statValues, [
      planet.rotation,
      planet.revolution,
      planet.radius,
      planet.temperature,
    ]);

    planetVisual.classList.add('animate');

    setTimeout(() => {
      planetVisual.classList.remove('animate');
    }, 600);
  }

  currentPlanet = planet;

  const planetColor = `--accent-${planet.name.toLowerCase()}`;
  const colorValue = getComputedStyle(
    document.documentElement
  ).getPropertyValue(planetColor);
  document.documentElement.style.setProperty('--accent-planet', colorValue);

  planetPage.setAttribute('data-planet', planet.name.toLowerCase());

  let description;
  switch (view) {
    case 'structure':
      description = planet.structure.content;
      sourceLink.href = planet.structure.source;
      planetStructureImage.classList.add('active');
      geologyImage.classList.add('hidden');
      break;
    case 'geology':
      description = planet.geology.content;
      sourceLink.href = planet.geology.source;
      planetStructureImage.classList.remove('active');
      geologyImage.classList.remove('hidden');
      break;
    default:
      description = planet.overview.content;
      sourceLink.href = planet.overview.source;
      planetStructureImage.classList.remove('active');
      geologyImage.classList.add('hidden');
  }

  updatePlanetDescription(description);

  planetImage.alt = planet.name;
  geologyImage.src =
    BASE_PATH +
    `assets/images/planets/${planet.name.toLowerCase()}/geology-${planet.name.toLowerCase()}.png`;
  geologyImage.alt = `${planet.name} geology`;

  planetTitle.textContent = planet.name;

  updateActiveNavItem(planet.name);
  updateActiveTab(view);
}

function updatePlanetDescription(content) {
  planetDescription.classList.add('hidden');

  setTimeout(() => {
    planetDescription.classList.remove('hidden');

    planetDescription.textContent = content;
  }, 300);
}

function updateStatValues(statValues, values) {
  statValues.forEach((statValue, index) => {
    statValue.classList.add('hidden');

    setTimeout(() => {
      statValue.classList.remove('hidden');

      statValue.textContent = values[index];
    }, 300);
  });
}

function updateActiveTab(view) {
  tabs.forEach((tab) => tab.classList.remove('active'));

  let activeIndex;
  switch (view) {
    case 'structure':
      activeIndex = 1;
      break;
    case 'geology':
      activeIndex = 2;
      break;
    default:
      activeIndex = 0;
  }

  tabs[activeIndex].classList.add('active');
}

function updateActiveNavItem(planetName) {
  const navItems = document.querySelectorAll('.nav-item');
  const navMobileItems = document.querySelectorAll('.nav-mobile-item');

  navItems.forEach((item) => item.classList.remove('active'));
  navMobileItems.forEach((item) => item.classList.remove('active'));

  const activeLink = Array.from(navItems).find(
    (link) => link.textContent.toLowerCase() === planetName.toLowerCase()
  );

  const activeMobileLink = Array.from(navMobileItems).find((item) => {
    const planetSpan = item.querySelector('.nav-mobile-planet');
    return (
      planetSpan.textContent.trim().toLowerCase() === planetName.toLowerCase()
    );
  });

  if (activeLink && activeMobileLink) {
    activeLink.classList.add('active');
    activeMobileLink.classList.add('active');
    updateNavIndicator(activeLink);
  }
}

function updateNavIndicator(activeItem) {
  const indicator = document.querySelector('.nav-indicator');
  if (!indicator || !activeItem) return;

  const rect = activeItem.getBoundingClientRect();
  const navRect = navList.getBoundingClientRect();

  indicator.style.width = `${rect.width}px`;
  indicator.style.transform = `translateX(${rect.left - navRect.left}px)`;
}

function setupNavIndicatorAutoUpdate() {
  const update = () => {
    const activeItem = document.querySelector('.nav-item.active');
    updateNavIndicator(activeItem);
  };

  // recalculate on window resize
  window.addEventListener('resize', update);

  // recalculate when fonts load to prevent misalignment
  if (document.fonts) {
    document.fonts.ready.then(update);
  }
}

function getPlanetFromURL() {
  const path = window.location.pathname;

  const planetName = path.split('/').pop() || 'earth';

  return planetName;
}

function getViewFromURL() {
  const hash = window.location.hash.substring(1);
  return hash || 'overview';
}

function findPlanetByName(planetName) {
  return planets.find(
    (planet) => planet.name.toLowerCase() === planetName.toLowerCase()
  );
}

function handleNavigation(e) {
  const link = e.target.closest('a');

  e.preventDefault();

  const href = link.getAttribute('href');

  window.history.pushState({}, '', BASE_PATH.slice(0, -1) + href);

  const planetName = getPlanetFromURL();
  const planet = findPlanetByName(planetName);
  renderPlanetData(planet);

  header.classList.remove('open');
}

function handleTabClick(e) {
  const tab = e.target;
  const tabIndex = Array.from(tabs).indexOf(tab);

  let view;
  let hash;

  switch (tabIndex) {
    case 1:
      view = 'structure';
      hash = '#structure';
      break;
    case 2:
      view = 'geology';
      hash = '#geology';
      break;
    default:
      view = 'overview';
      hash = '';
  }

  const currentPath = window.location.pathname;
  window.history.pushState({}, '', currentPath + hash);

  renderPlanetData(currentPlanet, view);
}

window.addEventListener('popstate', () => {
  const planetName = getPlanetFromURL();
  const view = getViewFromURL();
  const planet = findPlanetByName(planetName);
  renderPlanetData(planet, view);
});

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.stars-bg circle');

  stars.forEach((star) => {
    // Random chance that this star twinkles (e.g. 40%)
    if (Math.random() < 0.4) {
      star.classList.add('animate-star');

      const duration = 2 + Math.random() * 3; // 2–5s
      const delay = Math.random() * 5; // up to 5s
      star.style.animationDuration = `${duration}s`;
      star.style.animationDelay = `${delay}s`;
    }
  });
});

document.addEventListener('mousemove', parallax);
function parallax(event) {
  parallaxX = (window.innerWidth / 2 - event.pageX) / 150;
  parallaxY = (window.innerHeight / 2 - event.pageY) / 150;

  updatePlanetTransform();
}

function scalePlanetContainer() {
  const minScale = 0.38;
  const maxScale = 1;
  const minWindowWidth = 320;
  const maxWindowWidth = 1110;

  const windowWidth = window.innerWidth;

  currentScale =
    ((windowWidth - minWindowWidth) / (maxWindowWidth - minWindowWidth)) *
      (maxScale - minScale) +
    minScale;

  currentScale = Math.min(Math.max(currentScale, minScale), maxScale);

  updatePlanetTransform();
}

window.addEventListener('resize', scalePlanetContainer);

function updatePlanetTransform() {
  planetParallaxContainer.style.transform = `translateX(${parallaxX}px) translateY(${parallaxY}px) scale(${currentScale})`;
}

hamburgerBtn.addEventListener('click', () => {
  header.classList.toggle('open');
});

async function init() {
  planets = await getPlanets();

  if (planets && planets.length > 0) {
    renderNavigationLinks(planets);

    navList.addEventListener('click', handleNavigation);
    navMobileList.addEventListener('click', handleNavigation);
    tabs.forEach((tab) => tab.addEventListener('click', handleTabClick));

    const planetName = getPlanetFromURL();
    const view = getViewFromURL();
    const planet = findPlanetByName(planetName);
    renderPlanetData(planet, view);
    scalePlanetContainer();
  }
}

init();

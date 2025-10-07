const navList = document.querySelector('.nav-list');
const planetVisual = document.querySelector('.planet-visual');
const planetImage = document.querySelector('.planet-image');
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
  }
}

async function loadSVG(filePath) {
  filePath = BASE_PATH + filePath;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(response.status);

    const svgText = await response.text();
    return svgText;
  } catch (error) {
    console.error(`Couldn't load planet SVG: `, error);
    return '';
  }
}

async function renderPlanetSVG(planetImagePath) {
  const planetSVG = await loadSVG(planetImagePath);

  planetImage.innerHTML = planetSVG;
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

  const planetColor = `--color-${planet.name.toLowerCase()}`;
  const colorValue = getComputedStyle(
    document.documentElement
  ).getPropertyValue(planetColor);
  document.documentElement.style.setProperty('--color-planet', colorValue);

  let description;
  switch (view) {
    case 'structure':
      description = planet.structure.content;
      sourceLink.href = planet.structure.source;
      renderPlanetSVG(planet.images.internal);
      geologyImage.classList.add('hidden');
      break;
    case 'geology':
      description = planet.geology.content;
      sourceLink.href = planet.geology.source;
      renderPlanetSVG(planet.images.planet);
      geologyImage.classList.remove('hidden');
      break;
    default:
      description = planet.overview.content;
      sourceLink.href = planet.overview.source;
      renderPlanetSVG(planet.images.planet);
      geologyImage.classList.add('hidden');
  }

  updatePlanetDescription(description);

  planetImage.alt = planet.name;
  geologyImage.src = planet.images.geology;
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

  navItems.forEach((item) => item.classList.remove('active'));

  const activeLink = Array.from(navItems).find(
    (link) => link.textContent.toLowerCase() === planetName.toLowerCase()
  );
  if (activeLink) {
    activeLink.classList.add('active');
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
  const link = e.target;

  e.preventDefault();

  const href = link.getAttribute('href');

  window.history.pushState({}, '', href);

  const planetName = getPlanetFromURL();
  const planet = findPlanetByName(planetName);
  renderPlanetData(planet);
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

async function init() {
  planets = await getPlanets();

  if (planets && planets.length > 0) {
    renderNavigationLinks(planets);

    navList.addEventListener('click', handleNavigation);
    tabs.forEach((tab) => tab.addEventListener('click', handleTabClick));

    const planetName = getPlanetFromURL();
    const view = getViewFromURL();
    const planet = findPlanetByName(planetName);
    renderPlanetData(planet, view);
  }
}

init();

// animate the planet svg to make it look like it's rotating. use the planets rotation time to determine the speed of the rotation too.

// make the planets sizes always relative to each other. so in css set their starting sizes like width: 240px etc and then calculate the size so it can scale down as needed but retain it's relative size to other planets.

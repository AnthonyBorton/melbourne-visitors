const stops = [
  {
    id: "patricia",
    name: "Patricia Coffee Brewers",
    category: "coffee",
    label: "Coffee",
    icon: "☕",
    duration: 50,
    x: 42,
    y: 28,
    address: "Little Bourke Street",
    description: "A tiny standing-room espresso bar beloved by Melbourne coffee people.",
    maps: "-37.8146,144.9589",
  },
  {
    id: "laneways",
    name: "Degraves & Centre Place",
    category: "culture",
    label: "Laneways",
    icon: "✦",
    duration: 70,
    x: 51,
    y: 43,
    address: "Degraves Street",
    description: "The classic laneway wander: cafe tables, local art and hidden shopfronts.",
    maps: "-37.8166,144.9651",
  },
  {
    id: "flinders",
    name: "Flinders Street Station",
    category: "icon",
    label: "Icon",
    icon: "◎",
    duration: 35,
    x: 55,
    y: 50,
    address: "Flinders Street",
    description: "Meet under the clocks at Melbourne's most recognisable railway station.",
    maps: "-37.8183,144.9671",
  },
  {
    id: "shrine",
    name: "Shrine of Remembrance",
    category: "icon",
    label: "Landmark",
    icon: "△",
    duration: 90,
    x: 67,
    y: 76,
    address: "Birdwood Avenue",
    description: "A moving memorial with serene gardens and panoramic city views.",
    maps: "-37.8305,144.9734",
  },
  {
    id: "marketlane",
    name: "Market Lane Coffee",
    category: "coffee",
    label: "Coffee",
    icon: "☕",
    duration: 50,
    x: 35,
    y: 33,
    address: "Queen Victoria Market",
    description: "Beautifully sourced coffee served with precision and no fuss.",
    maps: "-37.8077,144.9568",
  },
  {
    id: "abbotsford",
    name: "Higher Ground",
    category: "food",
    label: "Brunch",
    icon: "◒",
    duration: 80,
    x: 31,
    y: 48,
    address: "Little Bourke Street",
    description: "A spectacular heritage dining room with an all-day brunch menu.",
    maps: "-37.8159,144.9535",
  },
  {
    id: "ngv",
    name: "NGV International",
    category: "culture",
    label: "Art",
    icon: "▣",
    duration: 100,
    x: 61,
    y: 64,
    address: "St Kilda Road",
    description: "Australia's oldest gallery, with a world-class permanent collection.",
    maps: "-37.8226,144.9689",
  },
  {
    id: "royal",
    name: "Royal Botanic Gardens",
    category: "culture",
    label: "Gardens",
    icon: "❧",
    duration: 80,
    x: 78,
    y: 70,
    address: "Birdwood Avenue",
    description: "Calm lawns, ornamental lakes and a green escape beside the city.",
    maps: "-37.8304,144.9796",
  },
  {
    id: "queenvic",
    name: "Queen Victoria Market",
    category: "food",
    label: "Market",
    icon: "◇",
    duration: 85,
    x: 33,
    y: 20,
    address: "Queen Street",
    description: "Fresh produce, deli halls and generations of Melbourne food culture.",
    maps: "-37.8076,144.9568",
  },
  {
    id: "chinatown",
    name: "Chinatown & Section 8",
    category: "food",
    label: "Evening",
    icon: "●",
    duration: 100,
    x: 61,
    y: 28,
    address: "Tattersalls Lane",
    description: "Dumplings, neon signs and a laneway container bar to finish the day.",
    maps: "-37.8118,144.9680",
  },
];

const defaultSelection = ["patricia", "laneways", "flinders", "shrine"];
const paceSettings = {
  slow: { gap: 45, multiplier: 1.18, label: "A leisurely" },
  balanced: { gap: 30, multiplier: 1, label: "A relaxed" },
  packed: { gap: 20, multiplier: 0.82, label: "An energetic" },
};
const themes = new Set(["light", "dark"]);
const themeStorageKey = "melbourne-theme";
const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

let selectedIds = [...defaultSelection];
let currentFilter = "all";
let currentPace = "balanced";

const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const stopList = document.querySelector("#stop-list");
const timeline = document.querySelector("#timeline");
const mapMarkers = document.querySelector("#map-markers");
const routeLayer = document.querySelector("#route-layer");

function updateThemeToggle() {
  const currentTheme = root.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const icon = nextTheme === "dark" ? "☾" : "☀";
  const label = `Switch to ${nextTheme} theme`;

  themeToggle.querySelector(".theme-icon").textContent = icon;
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
}

function applyTheme(theme, source) {
  if (!themes.has(theme)) return;

  root.dataset.theme = theme;
  root.dataset.themeSource = source;
  updateThemeToggle();
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, "saved");

  try {
    window.localStorage.setItem(themeStorageKey, nextTheme);
  } catch (error) {
    console.warn("Unable to save the theme preference.", error);
  }
});

colorSchemeQuery.addEventListener("change", (event) => {
  if (root.dataset.themeSource === "system") {
    applyTheme(event.matches ? "dark" : "light", "system");
  }
});

function formatTime(totalMinutes) {
  const minutesInDay = totalMinutes % (24 * 60);
  const hour = Math.floor(minutesInDay / 60);
  const minute = minutesInDay % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function selectedStops() {
  return selectedIds.map((id) => stops.find((stop) => stop.id === id)).filter(Boolean);
}

function toggleStop(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
  } else {
    selectedIds.push(id);
  }
  render();
}

function renderStopList() {
  const visibleStops =
    currentFilter === "all" ? stops : stops.filter((stop) => stop.category === currentFilter);

  stopList.innerHTML = visibleStops
    .map((stop) => {
      const isSelected = selectedIds.includes(stop.id);
      return `
        <button class="stop-card ${isSelected ? "selected" : ""}" type="button" data-stop-id="${stop.id}" aria-pressed="${isSelected}">
          <span class="stop-card-main">
            <span class="stop-icon" aria-hidden="true">${stop.icon}</span>
            <span class="stop-info">
              <strong>${stop.name}</strong>
              <span>${stop.label} · ${stop.duration} min</span>
            </span>
          </span>
          <span class="add-button" aria-hidden="true">${isSelected ? "✓" : "+"}</span>
        </button>
      `;
    })
    .join("");

  stopList.querySelectorAll("[data-stop-id]").forEach((button) => {
    button.addEventListener("click", () => toggleStop(button.dataset.stopId));
  });
}

function getPlanStats() {
  const pace = paceSettings[currentPace];
  const chosenStops = selectedStops();
  const visitMinutes = chosenStops.reduce(
    (total, stop) => total + Math.round(stop.duration * pace.multiplier),
    0,
  );
  const travelMinutes = Math.max(0, chosenStops.length - 1) * pace.gap;
  const totalHours = Math.max(0, (visitMinutes + travelMinutes) / 60);
  const distance = chosenStops.reduce((total, stop, index) => {
    if (index === 0) return total;
    const previous = chosenStops[index - 1];
    return total + Math.hypot(stop.x - previous.x, stop.y - previous.y) * 0.105;
  }, 0);
  return {
    hours: totalHours.toFixed(1),
    distance: distance.toFixed(1),
  };
}

function renderTimeline() {
  const chosenStops = selectedStops();
  const pace = paceSettings[currentPace];
  let cursor = 8 * 60;

  if (!chosenStops.length) {
    timeline.innerHTML =
      '<li class="empty-state">Choose a few favourites and your day will appear here.</li>';
  } else {
    timeline.innerHTML = chosenStops
      .map((stop, index) => {
        const startTime = cursor;
        cursor += Math.round(stop.duration * pace.multiplier);
        if (index < chosenStops.length - 1) cursor += pace.gap;
        return `
          <li class="timeline-item">
            <span class="timeline-time">${formatTime(startTime)}</span>
            <span class="timeline-node">${index + 1}</span>
            <span class="timeline-copy">
              <strong>${stop.name}</strong>
              <span>${stop.label} · ${stop.address}</span>
            </span>
            <button class="remove-stop" type="button" data-remove-id="${stop.id}" aria-label="Remove ${stop.name}">×</button>
          </li>
        `;
      })
      .join("");
  }

  timeline.querySelectorAll("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => toggleStop(button.dataset.removeId));
  });

  const stats = getPlanStats();
  document.querySelector("#selection-count").textContent = `${chosenStops.length} selected`;
  document.querySelector("#summary-stops").textContent = chosenStops.length;
  document.querySelector("#summary-hours").textContent = stats.hours;
  document.querySelector("#summary-distance").textContent = stats.distance;
  document.querySelector("#map-route-summary").textContent =
    chosenStops.length > 1
      ? `${pace.label} ${stats.distance} km route through the heart of Melbourne`
      : "Choose at least two stops to create your route";
}

function showPopover(stop, left, top) {
  document.querySelector(".map-popover")?.remove();
  const popover = document.createElement("div");
  popover.className = "map-popover";
  popover.style.left = `${left}%`;
  popover.style.top = `${top}%`;
  popover.innerHTML = `<strong>${stop.name}</strong><span>${stop.description}</span>`;
  document.querySelector("#map-canvas").appendChild(popover);
}

function renderMap() {
  const chosenStops = selectedStops();

  mapMarkers.innerHTML = stops
    .map((stop) => {
      const order = selectedIds.indexOf(stop.id);
      const isSelected = order !== -1;
      return `
        <button
          class="map-marker ${isSelected ? "selected" : ""}"
          style="left: ${stop.x}%; top: ${stop.y}%"
          type="button"
          data-map-id="${stop.id}"
          aria-label="${stop.name}"
        >
          <span>${isSelected ? order + 1 : stop.icon}</span>
        </button>
      `;
    })
    .join("");

  mapMarkers.querySelectorAll("[data-map-id]").forEach((marker) => {
    marker.addEventListener("click", (event) => {
      event.stopPropagation();
      const stop = stops.find((item) => item.id === marker.dataset.mapId);
      showPopover(stop, stop.x, stop.y);
    });
  });

  const points = chosenStops.map((stop) => `${stop.x * 10},${stop.y * 5.4}`).join(" ");
  routeLayer.innerHTML =
    chosenStops.length > 1 ? `<polyline class="route-path" points="${points}" />` : "";

  const routeUrl =
    chosenStops.length > 1
      ? `https://www.google.com/maps/dir/${chosenStops.map((stop) => stop.maps).join("/")}`
      : "https://www.google.com/maps/search/Melbourne+Australia";
  document.querySelector("#google-maps-link").href = routeUrl;
}

function render() {
  renderStopList();
  renderTimeline();
  renderMap();
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    renderStopList();
  });
});

document.querySelectorAll("[data-pace]").forEach((button) => {
  button.addEventListener("click", () => {
    currentPace = button.dataset.pace;
    document.querySelectorAll("[data-pace]").forEach((paceButton) => {
      paceButton.classList.toggle("active", paceButton === button);
    });
    renderTimeline();
  });
});

document.querySelector("#reset-plan").addEventListener("click", () => {
  selectedIds = [...defaultSelection];
  currentPace = "balanced";
  document.querySelectorAll("[data-pace]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pace === "balanced");
  });
  render();
});

document.querySelector("#map-canvas").addEventListener("click", () => {
  document.querySelector(".map-popover")?.remove();
});

document.querySelectorAll("[data-scroll-to-planner]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#planner").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("[data-scroll-to-map]").addEventListener("click", () => {
  document.querySelector("#map").scrollIntoView({ behavior: "smooth" });
});

updateThemeToggle();
render();

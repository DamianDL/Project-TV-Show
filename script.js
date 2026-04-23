const SHOWS_URL = "https://api.tvmaze.com/shows";
const fetchCache = new Map();

const state = {
  allShows: [],
  filteredShows: [],
  currentShow: null,
  allEpisodes: [],
};

function hideLoading() {
  document.getElementById("loading-message").classList.add("hidden");
}

function showLoading(message) {
  const loadingElem = document.getElementById("loading-message");
  loadingElem.classList.remove("hidden");
  loadingElem.textContent = message;
}

function showError(message) {
  hideLoading();
  const errorElem = document.getElementById("error-message");
  errorElem.classList.remove("hidden");
  errorElem.textContent = `Error loading data: ${message}`;
}

function clearError() {
  const errorElem = document.getElementById("error-message");
  errorElem.classList.add("hidden");
  errorElem.textContent = "";
}

function fetchJsonOnce(url) {
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }

  const requestPromise = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });

  fetchCache.set(url, requestPromise);
  return requestPromise;
}

function stripHtmlTags(value) {
  const temp = document.createElement("div");
  temp.innerHTML = value || "";
  return temp.textContent || temp.innerText || "";
}

function createEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  const genresText = Array.isArray(show.genres) && show.genres.length > 0
    ? show.genres.join(", ")
    : "Unknown";
  const ratingText = show.rating && show.rating.average !== null
    ? String(show.rating.average)
    : "N/A";
  const runtimeText = show.runtime ? `${show.runtime} min` : "Unknown";
  const imageSrc = show.image && show.image.medium ? show.image.medium : "";

  card.innerHTML = `
    <div class="show-image">
      <img src="${imageSrc}" alt="${show.name}">
    </div>
    <div class="show-content">
      <h2>
        <button class="show-name-button" data-show-id="${show.id}">${show.name}</button>
      </h2>
      <p class="show-meta"><strong>Genres:</strong> ${genresText}</p>
      <p class="show-meta"><strong>Status:</strong> ${show.status || "Unknown"}</p>
      <p class="show-meta"><strong>Rating:</strong> ${ratingText}</p>
      <p class="show-meta"><strong>Runtime:</strong> ${runtimeText}</p>
      <div class="show-summary">${show.summary || "<p>No summary available.</p>"}</div>
    </div>
  `;

  return card;
}

function renderShows(showsToRender) {
  const showsListElem = document.getElementById("shows-list");
  const showCountElem = document.getElementById("show-count");

  showCountElem.textContent = `Displaying ${showsToRender.length}/${state.allShows.length} show(s)`;
  showsListElem.replaceChildren(...showsToRender.map(createShowCard));
}

function filterShows(searchTerm) {
  const normalized = searchTerm.trim().toLowerCase();

  const filtered = state.allShows.filter((show) => {
    const inName = show.name.toLowerCase().includes(normalized);
    const inGenres = (show.genres || []).join(" ").toLowerCase().includes(normalized);
    const inSummary = stripHtmlTags(show.summary).toLowerCase().includes(normalized);

    return inName || inGenres || inSummary;
  });

  state.filteredShows = filtered;
  renderShows(filtered);
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const episodeCode = createEpisodeCode(episode.season, episode.number);
  const imageSrc = episode.image ? episode.image.medium : "";

  card.innerHTML = `
    <div class="episode-header">
      <h3>${episodeCode}</h3>
      <p class="episode-numbers">Season ${episode.season} - Episode ${episode.number}</p>
    </div>
    <div class="episode-image">
      <img src="${imageSrc}" alt="${episode.name}">
    </div>
    <div class="episode-name">
      <h4>${episode.name}</h4>
    </div>
    <div class="episode-summary">
      ${episode.summary || "<p>No summary available.</p>"}
    </div>
    <div class="episode-link">
      <a href="${episode.url}" target="_blank" rel="noopener noreferrer">View on TVMaze</a>
    </div>
  `;

  return card;
}

function renderEpisodes(episodeList) {
  const totalElem = document.getElementById("episode-total");
  const countElem = document.getElementById("episode-count");
  const episodesElem = document.getElementById("episodes");

  totalElem.textContent = `${state.allEpisodes.length} Episode(s)`;
  countElem.textContent = `Displaying ${episodeList.length}/${state.allEpisodes.length} episode(s)`;
  episodesElem.replaceChildren(...episodeList.map(createEpisodeCard));
}

function populateEpisodeSelect(episodes) {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${createEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeSelect.value = "";
}

function applyEpisodeFilters() {
  const searchInput = document.getElementById("episode-search-input");
  const episodeSelect = document.getElementById("episode-select");

  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedEpisodeId = episodeSelect.value;

  const filtered = state.allEpisodes.filter((episode) => {
    const matchesSearch =
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm);
    const matchesSelection = !selectedEpisodeId || String(episode.id) === selectedEpisodeId;

    return matchesSearch && matchesSelection;
  });

  renderEpisodes(filtered);
}

function getEpisodesUrl(showId) {
  return `https://api.tvmaze.com/shows/${showId}/episodes`;
}

function showEpisodesView() {
  document.getElementById("shows-view").classList.add("hidden");
  document.getElementById("episodes-view").classList.remove("hidden");
}

function showShowsView() {
  document.getElementById("episodes-view").classList.add("hidden");
  document.getElementById("shows-view").classList.remove("hidden");
}

function loadEpisodesForShow(show) {
  if (!show) {
    return Promise.resolve();
  }

  clearError();
  showLoading(`Loading episodes for ${show.name}...`);

  return fetchJsonOnce(getEpisodesUrl(show.id))
    .then((episodes) => {
      state.currentShow = show;
      state.allEpisodes = Array.isArray(episodes) ? episodes : [];

      document.getElementById("current-show-title").textContent = `${show.name} Episodes`;
      document.getElementById("episode-search-input").value = "";
      populateEpisodeSelect(state.allEpisodes);
      applyEpisodeFilters();

      hideLoading();
      showEpisodesView();
    })
    .catch((error) => {
      showError(error.message);
    });
}

function populateInitialShows(shows) {
  state.allShows = [...shows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  state.filteredShows = state.allShows;
  renderShows(state.filteredShows);
}

function setupEventListeners() {
  const showSearchInput = document.getElementById("show-search-input");
  const episodeSearchInput = document.getElementById("episode-search-input");
  const episodeSelect = document.getElementById("episode-select");
  const showsList = document.getElementById("shows-list");
  const backToShows = document.getElementById("back-to-shows");

  showSearchInput.addEventListener("input", () => {
    filterShows(showSearchInput.value);
  });

  showsList.addEventListener("click", (event) => {
    const clicked = event.target.closest(".show-name-button");
    if (!clicked) {
      return;
    }

    const selectedId = Number(clicked.dataset.showId);
    const selectedShow = state.allShows.find((show) => show.id === selectedId);
    loadEpisodesForShow(selectedShow);
  });

  backToShows.addEventListener("click", (event) => {
    event.preventDefault();
    clearError();
    hideLoading();
    showShowsView();
  });

  episodeSearchInput.addEventListener("input", applyEpisodeFilters);
  episodeSelect.addEventListener("change", applyEpisodeFilters);
}

function setup() {
  clearError();
  showLoading("Loading shows...");
  setupEventListeners();

  fetchJsonOnce(SHOWS_URL)
    .then((shows) => {
      if (!Array.isArray(shows) || shows.length === 0) {
        throw new Error("No shows found");
      }

      populateInitialShows(shows);
      hideLoading();
      showShowsView();
    })
    .catch((error) => {
      showError(error.message);
    });
}

window.onload = setup;

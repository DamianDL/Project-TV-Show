const SHOWS_URL = "https://api.tvmaze.com/shows";
const fetchCache = new Map();

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const domCache = {};

function cacheDOM() {
  domCache.showsList = document.getElementById("shows-list");
  domCache.showCount = document.getElementById("show-count");
  domCache.episodes = document.getElementById("episodes");
  domCache.episodeTotal = document.getElementById("episode-total");
  domCache.episodeCount = document.getElementById("episode-count");
}

const state = {
  allShows: [],
  filteredShows: [],
  currentShow: null,
  allEpisodes: [],
  searchableShows: [],
  searchableEpisodes: [],
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

  const requestPromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      fetchCache.delete(url);
      throw error;
    });

  fetchCache.set(url, requestPromise);
  return requestPromise;
}

function stripHtmlTags(value) {
  const temp = document.createElement("div");
  temp.innerHTML = value || "";
  return temp.textContent || temp.innerText || "";
}

function createShowSearchText(show) {
  const genres = (show.genres || []).join(" ");
  const summary = stripHtmlTags(show.summary || "");
  return `${show.name} ${genres} ${summary}`.toLowerCase();
}

function createEpisodeSearchText(episode) {
  return `${episode.name} ${stripHtmlTags(episode.summary || "")}`.toLowerCase();
}

function createMetaLine(label, value) {
  const line = document.createElement("p");
  line.className = "show-meta";
  const strong = document.createElement("strong");
  strong.textContent = `${label}:`;
  line.append(strong, ` ${value}`);
  return line;
}

function createEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  const genresText =
    Array.isArray(show.genres) && show.genres.length > 0
      ? show.genres.join(", ")
      : "Unknown";
  const ratingText =
    show.rating && show.rating.average !== null
      ? String(show.rating.average)
      : "N/A";
  const runtimeText = show.runtime ? `${show.runtime} min` : "Unknown";
  const imageSrc = show.image && show.image.medium ? show.image.medium : "";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "show-image";
  if (imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = show.name;
    imageWrapper.appendChild(image);
  }

  const content = document.createElement("div");
  content.className = "show-content";

  const heading = document.createElement("h2");
  const nameButton = document.createElement("button");
  nameButton.className = "show-name-button";
  nameButton.type = "button";
  nameButton.dataset.showId = String(show.id);
  nameButton.textContent = show.name;
  heading.appendChild(nameButton);

  const genres = createMetaLine("Genres", genresText);
  const status = createMetaLine("Status", show.status || "Unknown");
  const rating = createMetaLine("Rating", ratingText);
  const runtime = createMetaLine("Runtime", runtimeText);

  const summary = document.createElement("div");
  summary.className = "show-summary";
  summary.textContent = show.summaryText || "No summary available.";

  content.append(heading, genres, status, rating, runtime, summary);
  card.append(imageWrapper, content);

  return card;
}

function renderShows(showsToRender) {
  domCache.showCount.textContent = `Displaying ${showsToRender.length}/${state.allShows.length} show(s)`;
  domCache.showsList.replaceChildren(...showsToRender.map(createShowCard));
}

function filterShows(searchTerm) {
  const normalized = searchTerm.trim().toLowerCase();

  const filtered = state.searchableShows
    .filter((entry) => entry.searchText.includes(normalized))
    .map((entry) => entry.show);

  state.filteredShows = filtered;
  renderShows(filtered);
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const episodeCode = createEpisodeCode(episode.season, episode.number);
  const imageSrc = episode.image ? episode.image.medium : "";

  const header = document.createElement("div");
  header.className = "episode-header";
  const codeHeading = document.createElement("h3");
  codeHeading.textContent = episodeCode;
  const numbers = document.createElement("p");
  numbers.className = "episode-numbers";
  numbers.textContent = `Season ${episode.season} - Episode ${episode.number}`;
  header.append(codeHeading, numbers);

  const imageContainer = document.createElement("div");
  imageContainer.className = "episode-image";
  if (imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = episode.name;
    imageContainer.appendChild(image);
  } else {
    imageContainer.classList.add("hidden");
  }

  const nameContainer = document.createElement("div");
  nameContainer.className = "episode-name";
  const title = document.createElement("h4");
  title.textContent = episode.name;
  nameContainer.appendChild(title);

  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.textContent = episode.summaryText || "No summary available.";

  const linkContainer = document.createElement("div");
  linkContainer.className = "episode-link";
  const link = document.createElement("a");
  link.href = episode.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View on TVMaze";
  linkContainer.appendChild(link);

  card.append(header, imageContainer, nameContainer, summary, linkContainer);

  return card;
}

function renderEpisodes(episodeList) {
  domCache.episodeTotal.textContent = `${state.allEpisodes.length} Episode(s)`;
  domCache.episodeCount.textContent = `Displaying ${episodeList.length}/${state.allEpisodes.length} episode(s)`;
  domCache.episodes.replaceChildren(...episodeList.map(createEpisodeCard));
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
    option.value = episode.id;
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

  const filtered = state.searchableEpisodes
    .filter((entry) => {
      const matchesSearch = entry.searchText.includes(searchTerm);
      const matchesSelection =
        !selectedEpisodeId || entry.episode.id == selectedEpisodeId;
      return matchesSearch && matchesSelection;
    })
    .map((entry) => entry.episode);

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
      state.searchableEpisodes = state.allEpisodes.map((episode) => ({
        episode: { ...episode, summaryText: stripHtmlTags(episode.summary || "") },
        searchText: createEpisodeSearchText(episode),
      }));
      state.allEpisodes = state.searchableEpisodes.map((entry) => entry.episode);

      document.getElementById("current-show-title").textContent =
        `${show.name} Episodes`;
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
  state.searchableShows = state.allShows.map((show) => ({
    show: { ...show, summaryText: stripHtmlTags(show.summary || "") },
    searchText: createShowSearchText(show),
  }));
  state.allShows = state.searchableShows.map((entry) => entry.show);
  state.filteredShows = state.allShows;
  renderShows(state.filteredShows);
}

function setupEventListeners() {
  const showSearchInput = document.getElementById("show-search-input");
  const episodeSearchInput = document.getElementById("episode-search-input");
  const episodeSelect = document.getElementById("episode-select");
  const showsList = document.getElementById("shows-list");
  const backToShows = document.getElementById("back-to-shows");

  const debouncedFilterShows = debounce((searchTerm) => {
    filterShows(searchTerm);
  }, 250);

  const debouncedApplyFilters = debounce(() => {
    applyEpisodeFilters();
  }, 250);

  showSearchInput.addEventListener("input", () => {
    debouncedFilterShows(showSearchInput.value);
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

  episodeSearchInput.addEventListener("input", debouncedApplyFilters);
  episodeSelect.addEventListener("change", applyEpisodeFilters);
}

function setup() {
  cacheDOM();
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

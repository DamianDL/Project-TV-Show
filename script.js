const SHOWS_URL = "https://api.tvmaze.com/shows";
const fetchCache = new Map();

const state = {
  allShows: [],
  filteredShows: [],
  currentShow: null,
  selectedShowId: "",
  allEpisodes: [],
  searchableShows: [],
  searchableEpisodes: [],
};
const API_URL = "https://api.tvmaze.com/shows/82/episodes";
let episodesPromise = null;

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

function fetchEpisodesOnce() {
  if (episodesPromise) {
    return episodesPromise;
  }

  episodesPromise = fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((episodes) => {
      if (!Array.isArray(episodes) || episodes.length === 0) {
        throw new Error("No episodes found");
      }
      return episodes;
    });

  return episodesPromise;
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
  summary.textContent =
    stripHtmlTags(show.summary || "") || "No summary available.";

  content.append(heading, genres, status, rating, runtime, summary);
  card.append(imageWrapper, content);

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

  const filtered = state.searchableShows
    .filter((entry) => entry.searchText.includes(normalized))
    .map((entry) => entry.show);

  state.filteredShows = filtered;
  renderShows(filtered);
function stripHtml(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html || "";
  return temp.textContent || temp.innerText || "";
}

function createSearchText(episode) {
  return `${episode.name} ${stripHtml(episode.summary || "")}`.toLowerCase();
}

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card-template");
  const card = template.content.firstElementChild.cloneNode(true);

  const episodeCode = createEpisodeCode(episode.season, episode.number);
  const imageSrc = episode.image ? episode.image.medium : "";

  const header = document.createElement("div");
  header.className = "episode-header";
  const codeHeading = document.createElement("h3");
  codeHeading.textContent = episodeCode;
  const numbers = document.createElement("p");
  numbers.className = "episode-numbers";
  numbers.textContent = `Season ${episode.season} - Episode ${episode.number}`;

  const codeHeading = document.createElement("h2");
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
  card.querySelector(".episode-code").textContent = episodeCode;
  card.querySelector(".episode-numbers").textContent =
    `Season ${episode.season} - Episode ${episode.number}`;

  const imageElem = card.querySelector(".episode-image-img");
  const imageContainer = card.querySelector(".episode-image");
  if (imageSrc) {
    imageElem.src = imageSrc;
    imageElem.alt = episode.name;
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
  summary.textContent =
    stripHtmlTags(episode.summary || "") || "No summary available.";

  const linkContainer = document.createElement("div");
  linkContainer.className = "episode-link";

  const title = document.createElement("h3");
  title.textContent = episode.name;
  nameContainer.appendChild(title);

  const summaryContainer = document.createElement("div");
  summaryContainer.className = "episode-summary";
  summaryContainer.textContent =
    stripHtml(episode.summary || "") || "No summary available.";

  const linkContainer = document.createElement("div");
  linkContainer.className = "episode-link";

  const link = document.createElement("a");
  link.href = episode.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View on TVMaze";
  linkContainer.appendChild(link);

  card.append(header, imageContainer, nameContainer, summary, linkContainer);
  card.append(
    header,
    imageContainer,
    nameContainer,
    summaryContainer,
    linkContainer,
  );
  card.querySelector(".episode-title").textContent = episode.name;
  const summaryText = stripHtml(episode.summary || "");
  card.querySelector(".episode-summary").textContent =
    summaryText || "No summary available.";
  card.querySelector(".episode-url").href = episode.url;

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
function populateSelect(episodes) {
  const select = document.getElementById("episode-select");
  select.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);
  select.appendChild(allOption);

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

  const filtered = state.searchableEpisodes
    .filter((entry) => {
      const matchesSearch = entry.searchText.includes(searchTerm);
      const matchesSelection =
        !selectedEpisodeId || String(entry.episode.id) === selectedEpisodeId;
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
        episode,
        searchText: createEpisodeSearchText(episode),
      }));

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
    show,
    searchText: createShowSearchText(show),
  }));
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
  showSelect.addEventListener("change", () => {
    state.selectedShowId = showSelect.value;
    loadEpisodesForShow(state.selectedShowId);
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
      populateShowSelect(shows);
      return loadEpisodesForShow(state.selectedShowId);
    select.appendChild(option);
  });
}

function setup() {
  const filterInput = document.getElementById("filter-input");
  const episodeSelect = document.getElementById("episode-select");

  fetchEpisodesOnce()
    .then((allEpisodes) => {
      hideLoading();
      clearError();
      populateSelect(allEpisodes);

      const searchableEpisodes = allEpisodes.map((episode) => ({
        ...episode,
        _searchText: createSearchText(episode),
      }));

      function applyFilters() {
        const searchTerm = filterInput.value.toLowerCase();
        const selectedId = episodeSelect.value;

        const filtered = searchableEpisodes.filter((episode) => {
          const matchesSearch = episode._searchText.includes(searchTerm);
          const matchesSelection =
            !selectedId || String(episode.id) === selectedId;
          return matchesSearch && matchesSelection;
        });

        renderEpisodes(filtered, allEpisodes.length);
      }

      filterInput.addEventListener("input", applyFilters);
      episodeSelect.addEventListener("change", applyFilters);

      renderEpisodes(allEpisodes, allEpisodes.length);
    })
    .catch((error) => {
      showError(error.message);
    });
}

window.onload = setup;

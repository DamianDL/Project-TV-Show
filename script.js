const SHOWS_URL = "https://api.tvmaze.com/shows";
const fetchCache = new Map();

const state = {
  selectedShowId: "",
  allEpisodes: [],
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

  const requestPromise = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
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

function createEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

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

function renderEpisodes(episodeList, totalCount) {
  const totalElem = document.getElementById("episode-total");
  const countElem = document.getElementById("episode-count");
  const episodesElem = document.getElementById("episodes");

  totalElem.textContent = `${totalCount} Episode(s)`;
  countElem.textContent = `Displaying ${episodeList.length}/${totalCount} episode(s)`;
  episodesElem.replaceChildren(...episodeList.map(createEpisodeCard));
}

function populateShowSelect(shows) {
  const showSelect = document.getElementById("show-select");
  showSelect.replaceChildren();

  const sortedShows = [...shows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  if (sortedShows.length > 0) {
    state.selectedShowId = String(sortedShows[0].id);
    showSelect.value = state.selectedShowId;
  }
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

function applyFilters() {
  const filterInput = document.getElementById("filter-input");
  const episodeSelect = document.getElementById("episode-select");

  const searchTerm = filterInput.value.trim().toLowerCase();
  const selectedEpisodeId = episodeSelect.value;

  const filtered = state.allEpisodes.filter((episode) => {
    const matchesSearch =
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm);
    const matchesEpisode =
      !selectedEpisodeId || String(episode.id) === selectedEpisodeId;

    return matchesSearch && matchesEpisode;
  });

  renderEpisodes(filtered, state.allEpisodes.length);
}

function getEpisodesUrl(showId) {
  return `https://api.tvmaze.com/shows/${showId}/episodes`;
}

function loadEpisodesForShow(showId) {
  showLoading("Loading episodes...");
  clearError();

  return fetchJsonOnce(getEpisodesUrl(showId))
    .then((episodes) => {
      hideLoading();
      state.allEpisodes = Array.isArray(episodes) ? episodes : [];
      populateEpisodeSelect(state.allEpisodes);
      applyFilters();
    })
    .catch((error) => {
      state.allEpisodes = [];
      populateEpisodeSelect([]);
      renderEpisodes([], 0);
      showError(error.message);
    });
}

function setupEventListeners() {
  const showSelect = document.getElementById("show-select");
  const episodeSelect = document.getElementById("episode-select");
  const filterInput = document.getElementById("filter-input");

  showSelect.addEventListener("change", () => {
    state.selectedShowId = showSelect.value;
    loadEpisodesForShow(state.selectedShowId);
  });

  episodeSelect.addEventListener("change", applyFilters);
  filterInput.addEventListener("input", applyFilters);
}

function setup() {
  showLoading("Loading shows...");
  clearError();
  setupEventListeners();

  fetchJsonOnce(SHOWS_URL)
    .then((shows) => {
      if (!Array.isArray(shows) || shows.length === 0) {
        throw new Error("No shows found");
      }

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

const API_URL = "https://api.tvmaze.com/shows/82/episodes";
let episodesPromise = null;

function hideLoading() {
  document.getElementById("loading-message").classList.add("hidden");
}

function showError(message) {
  hideLoading();
  const errorElem = document.getElementById("error-message");
  errorElem.classList.remove("hidden");
  errorElem.textContent = `Error loading episodes: ${message}`;
}

function clearError() {
  const errorElem = document.getElementById("error-message");
  errorElem.classList.add("hidden");
  errorElem.textContent = "";
}

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

function populateSelect(episodes) {
  const select = document.getElementById("episode-select");
  select.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${createEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
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

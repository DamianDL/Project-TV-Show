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

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card-template");
  const card = template.content.firstElementChild.cloneNode(true);

  const episodeCode = createEpisodeCode(episode.season, episode.number);
  const imageSrc = episode.image ? episode.image.medium : "";

  card.querySelector(".episode-code").textContent = episodeCode;
  card.querySelector(".episode-numbers").textContent =
    `Season ${episode.season} • Episode ${episode.number}`;

  const imageElem = card.querySelector(".episode-image-img");
  imageElem.src = imageSrc;
  imageElem.alt = episode.name;

  card.querySelector(".episode-title").textContent = episode.name;
  card.querySelector(".episode-summary").innerHTML =
    episode.summary || "<p>No summary available.</p>";
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

      function applyFilters() {
        const searchTerm = filterInput.value.toLowerCase();
        const selectedId = episodeSelect.value;

        const filtered = allEpisodes.filter((episode) => {
          const matchesSearch =
            episode.name.toLowerCase().includes(searchTerm) ||
            (episode.summary || "").toLowerCase().includes(searchTerm);
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

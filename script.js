function setup() {
  const allEpisodes = getAllEpisodes();

  // 1. Set the static total count ONCE at the start
  const totalElem = document.getElementById("episode-total");
  totalElem.textContent = `${allEpisodes.length} Episode(s)`;

  //Initialize the dropdown option
  populateSelect(allEpisodes);

  //Render the initial list
  renderEpisodes(allEpisodes);

  // Grab form elements
  const filterInput = document.getElementById("filter-input");
  const episodeSelect = document.getElementById("episode-select");

  //  Search input event listener
  filterInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = allEpisodes.filter((ep) => {
      return (
        ep.name.toLowerCase().includes(searchTerm) ||
        ep.summary.toLowerCase().includes(searchTerm)
      );
    });
    renderEpisodes(filtered);
  });

  // Dropdown select event listener
  episodeSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      renderEpisodes(allEpisodes);
    } else {
      const filtered = allEpisodes.filter((ep) => ep.id == selectedId);
      renderEpisodes(filtered);
    }
  });
}

// New function to fill the <select> dropdown
function populateSelect(episodes) {
  const select = document.getElementById("episode-select");
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${createEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    select.appendChild(option);
  });
}

function renderEpisodes(episodeList) {
  // 2. Only update the "Displaying" count here
  const countElem = document.getElementById("episode-count");
  const episodesElem = document.getElementById("episodes");

  countElem.textContent = `Displaying ${episodeList.length} episode(s)`;
  episodesElem.replaceChildren(...episodeList.map(createEpisodeCard));
}

function createEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const episodeCode = createEpisodeCode(episode.season, episode.number);
  const imageSrc = episode.image ? episode.image.medium : "";

  card.innerHTML = `
    <div class="episode-header">
      <h2>${episodeCode}</h2>
    </div>
    <div class="episode-image">
      <img src="${imageSrc}" alt="${episode.name}">
    </div>
    <div class="episode-name">
      <h3>${episode.name}</h3>
    </div>
    <div class="episode-summary">
      ${episode.summary || "<p>No summary available.</p>"}
    </div>
  `;

  return card;
}

function renderEpisodes(episodeList) {
  const countElem = document.getElementById("episode-count");
  const episodesElem = document.getElementById("episodes");

  // Dynamically update the count based on the filtered list
  countElem.textContent = `Displaying ${episodeList.length} episode(s)`;

  episodesElem.replaceChildren(...episodeList.map(createEpisodeCard));
}

window.onload = setup;

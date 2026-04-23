function setup() {
  const allEpisodes = getAllEpisodes();
  renderEpisodes(allEpisodes);
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
      <p class="episode-numbers">Season ${episode.season} • Episode ${episode.number}</p>
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

  totalElem.textContent = `${episodeList.length} Episode(s)`;
  countElem.textContent = `Displaying ${episodeList.length} episode(s)`;

  episodesElem.replaceChildren(...episodeList.map(createEpisodeCard));
}

window.onload = setup;

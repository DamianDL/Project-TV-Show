//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Create header with episode count
  const header = document.createElement("h1");
  header.textContent = `${episodeList.length} Episode(s)`;
  rootElem.appendChild(header);

  // Create episode container
  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";

  // Create episode cards
  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    const episodeCode = createEpisodeCode(episode.season, episode.number);

    card.innerHTML = `
      <div class="episode-header">
        <h2>${episodeCode}</h2>
      </div>
      <div class="episode-image">
        <img src="${episode.image.medium}" alt="${episode.name}">
      </div>
      <div class="episode-name">
        <h3>${episode.name}</h3>
      </div>
      <div class="episode-summary">
        ${episode.summary || "<p>No summary available.</p>"}
      </div>
      <div class="episode-link">
        <a href="${episode.url}" target="_blank">View on TVMaze</a>
      </div>
    `;

    episodesContainer.appendChild(card);
  });

  rootElem.appendChild(episodesContainer);

  // Add TVMaze attribution footer
  const footer = document.createElement("footer");
  footer.className = "attribution";
  footer.innerHTML = `
    <p>Data sourced from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>. See <a href="https://www.tvmaze.com/api#licensing" target="_blank">licensing</a>.</p>
  `;
  rootElem.appendChild(footer);
}

window.onload = setup;

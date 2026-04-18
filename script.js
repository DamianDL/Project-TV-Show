//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
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
        <p class="episode-numbers">Season ${episode.season} • Episode ${episode.number}</p>
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
  const countElem = document.createElement("p");
  countElem.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(countElem);

  const episodeContainer = document.createElement("div");
  episodeContainer.classList.add("episode-container");

  episodeList.forEach((episode) => {
    const episodeElem = document.createElement("article");
    episodeElem.classList.add("episode-card");

    const titleElem = document.createElement("h2");
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    titleElem.textContent = `${episode.name} (${episodeCode})`;

    const imageElem = document.createElement("img");
    imageElem.src = episode.image ? episode.image.medium : "";
    imageElem.alt = `Image for ${episode.name}`;

    const summaryElem = document.createElement("div");
    summaryElem.innerHTML = episode.summary || "No summary available.";

    const linkElem = document.createElement("a");
    linkElem.href = episode.url;
    linkElem.target = "_blank";
    linkElem.rel = "noopener noreferrer";
    linkElem.textContent = "View on TVMaze";

    episodeElem.appendChild(titleElem);
    episodeElem.appendChild(imageElem);
    episodeElem.appendChild(summaryElem);
    episodeElem.appendChild(linkElem);
    episodeContainer.appendChild(episodeElem);
  });

  rootElem.appendChild(episodeContainer);

  const creditElem = document.createElement("p");
  creditElem.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(creditElem);
}

window.onload = setup;

/*All episodes must be shown
2. For each episode, _at least_ following must be displayed:
   1. The name of the episode-name
   2. The season number-season
   3. The episode number-number
   4. The medium-sized image for the episode-image {medium}
   5. The summary text of the episode-summary
3. Combine season number and episode number into an **episode code**:
   1. Each part should be zero-padded to two digits.
   2. Example: `S02E07` would be the code for the 7th episode of the 2nd season. `S2E7` would be incorrect.
4. Your page should state somewhere that the data has (originally) come from [TVMaze.com](https://tvmaze.com/), and link back to that site (or the specific episode on that site). See [tvmaze.com/api#licensing](https://www.tvmaze.com/api#licensing).
*/

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

  function applyFilters() {
    const searchTerm = filterInput.value.toLowerCase();
    const selectedId = episodeSelect.value;

    const filtered = allEpisodes.filter((ep) => {
      const matchesSearch =
        ep.name.toLowerCase().includes(searchTerm) ||
        (ep.summary || "").toLowerCase().includes(searchTerm);

      const matchesSelection = !selectedId || String(ep.id) === selectedId;
      return matchesSearch && matchesSelection;
    });

    renderEpisodes(filtered);
  }

  //  Search input event listener
  filterInput.addEventListener("input", () => {
    if (filterInput.value.trim() === "") {
      episodeSelect.value = "";
      renderEpisodes(allEpisodes);
      return;
    }

    applyFilters();
  });

  // Dropdown select event listener
  episodeSelect.addEventListener("change", applyFilters);
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
  card.classList.add("episode-card");

  const header = document.createElement("div");
  header.classList.add("episode-header");

  const title = document.createElement("h2");
  title.textContent = createEpisodeCode(episode.season, episode.number);

  const numbers = document.createElement("p");
  numbers.classList.add("episode-numbers");
  numbers.textContent = `Season ${episode.season} • Episode ${episode.number}`;

  header.appendChild(title);
  header.appendChild(numbers);

  const imageWrap = document.createElement("div");
  imageWrap.classList.add("episode-image");

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = `Image for ${episode.name}`;
  imageWrap.appendChild(image);

  const nameWrap = document.createElement("div");
  nameWrap.classList.add("episode-name");
  const name = document.createElement("h3");
  name.textContent = episode.name;
  nameWrap.appendChild(name);

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = episode.summary || "<p>No summary available.</p>";

  const linkWrap = document.createElement("div");
  linkWrap.classList.add("episode-link");
  const link = document.createElement("a");
  link.href = episode.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View episode on TVMaze";
  linkWrap.appendChild(link);

  card.appendChild(header);
  card.appendChild(imageWrap);
  card.appendChild(nameWrap);
  card.appendChild(summary);
  card.appendChild(linkWrap);

  return card;
}

window.onload = setup;

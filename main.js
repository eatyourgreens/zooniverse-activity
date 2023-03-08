async function loadProjects() {
  let response = await fetch('https://notifications.zooniverse.org/presence');
  const counts = await response.json();
  const projectIDs = counts.map(({ channel }) => channel.replace('project-', ''));
  const query = `/projects?cards=true&id=${projectIDs}&page_size=${projectIDs.length}`;
  response = await fetch(`https://www.zooniverse.org/api${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json; version=1'
    }
  });
  const projectData = await response.json();
  return {
    counts,
    projectCards: projectData.projects
  };
}

function appendCard(project) {
  const projectTile = `
  <div id="project-${project.id}" class="project title">
    <img width=100 height=100 class="avatar" alt="${project.display_name}" src="${project.avatar_src}" />
    <span class="count">loading</span>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeEnd', projectTile);
}

function showCount(count) {
  try {
    const tile = document.querySelector(`#${count.channel} .count`);
    tile.innerText = count.count
  } catch (e) {
    console.log({ count })
    console.error(e)
  }
}

async function buildPage() {
  const { counts, projectCards } = await loadProjects();
  projectCards.forEach(appendCard);
  counts.forEach(showCount)
}

buildPage();

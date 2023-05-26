async function loadProjects() {
  let response = await fetch('https://notifications.zooniverse.org/presence');
  const counts = await response.json();
  return counts;
}

function appendCard(project) {
  const projectTile = `
  <div id="project-${project.id}" class="project tile">
    <a href="https://www.zooniverse.org/projects/${project.slug}">
      <img width=100 height=100 class="avatar" alt="${project.display_name}" src="${project.avatar_src}" />
      <span class="count">loading</span>
    </a>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeEnd', projectTile);
}

async function buildProjectTile({ channel, count }) {
  const projectID = channel.replace('project-', '');
  const query = `/projects?cards=true&id=${projectID}`;
  const response = await fetch(`https://www.zooniverse.org/api${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json; version=1'
    }
  });
  if (response.ok) {
    const body = await response.json();
    const [ project ] = body.projects;
    appendCard(project);
    showCount({ channel, count });
  }
}

function showCount({ channel, count }) {
  try {
    const tile = document.querySelector(`#${channel} .count`);
    tile.innerText = count;
  } catch (e) {
    console.log({ channel, count });
    console.error(e);
  }
}

async function buildPage() {
  const counts  = await loadProjects();
  counts.forEach(buildProjectTile);
  let total = 0;
  counts.forEach(({ channel, count }) => {
    total = total + count;
  })
  const countHTML = `<p>There are ${total} active volunteer sessions.</p>`;
  document.body.insertAdjacentHTML('beforeBegin', countHTML);
}

buildPage();

const projects = document.getElementById("projects");

const MAX_TRIES = 5;
const DELAY = 5000;

function fetchWithDelay(url, options, delay = DELAY) {
  return new Promise(function (resolve, reject) {
    setTimeout(async function () {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          resolve(response);
        } else {
          if (response.status !== 404) {
            const error = new Error(`HTTP error: ${response.status}`);
            reject(error);
          }
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

async function fetchWithRetry(url, options = {}, retryCount = 0, delay = 0) {
  try {
    if (retryCount > 0) {
      console.log(`retrying ${url}}, attempt: ${retryCount}`);
    }
    const response = await fetchWithDelay(url, options, delay);
    return response;
  } catch (error) {
    if (retryCount < MAX_TRIES) {
      return fetchWithRetry(url, options, retryCount + 1, DELAY);
    }
    throw error;
  }
}

async function loadProjects() {
  let response = await fetchWithRetry("https://notifications.zooniverse.org/presence");
  const counts = await response.json();
  return counts;
}

function appendCard(project, channel) {
  const projectTile = `
    <a href="https://www.zooniverse.org/projects/${project.slug}">
      <img width=100 height=100 class="avatar" alt="${project.display_name}" src="${project.avatar_src}" />
      <span class="count">loading</span>
    </a>
  `;
  document.getElementById(channel).innerHTML = projectTile;
}

async function buildProjectTile({ channel, count }) {
  const projectID = channel.replace("project-", "");
  const query = `/projects?cards=true&id=${projectID}`;
  const projectTile = `
    <li id="${channel}" class="project tile">
    </li>
  `;
  projects.querySelector('ul').insertAdjacentHTML("beforeEnd", projectTile);
  const response = await fetchWithRetry(`https://www.zooniverse.org/api${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.api+json; version=1",
    },
  });
  if (response.ok) {
    const body = await response.json();
    const [project] = body.projects;
    appendCard(project, channel);
    showCount({ channel, count });
  }
  if (response.status === 404) {
    const projectTile = document.getElementById(channel);
    projectTile.parentNode.removeChild(projectTile);
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
  projects.innerHTML = "<ul role='list'></ul>";
  const counts = await loadProjects();
  counts
    .sort((a, b) => b.count - a.count)
    .forEach(buildProjectTile);
  let total = 0;
  counts.forEach(({ channel, count }) => {
    total = total + count;
  });
  const countHTML = `<p>There are ${total} active volunteer sessions.</p>`;
  projects.insertAdjacentHTML("afterBegin", countHTML);
}

buildPage();

async function loadProjects() {
  const response = await fetch('https://notifications.zooniverse.org/presence');
  const data = await response.json();
  console.log(data);
}

loadProjects();

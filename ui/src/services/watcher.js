function getWatcherIcon() {
  return "mdi-update";
}

async function getAllWatchers() {
  const response = await fetch("/api/watchers");
  return response.json();
}

export { getWatcherIcon, getAllWatchers };

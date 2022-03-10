function getStoreIcon() {
  return "mdi-file-multiple";
}

async function getStore() {
  const response = await fetch("/api/store");
  return response.json();
}

export { getStoreIcon, getStore };

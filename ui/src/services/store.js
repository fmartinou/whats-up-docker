function getStoreIcon() {
  return "mdi-content-save";
}

async function getStore() {
  const response = await fetch("/api/store");
  return response.json();
}

export { getStoreIcon, getStore };

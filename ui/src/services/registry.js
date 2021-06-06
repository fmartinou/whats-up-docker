function getRegistryIcon() {
  return "mdi-database-search";
}

async function getAllRegistries() {
  const response = await fetch("/api/registries");
  return response.json();
}

export { getRegistryIcon, getAllRegistries };

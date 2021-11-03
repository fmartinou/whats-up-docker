/**
 * Get registry component icon.
 * @returns {string}
 */
function getRegistryIcon() {
  return "mdi-database-search";
}

/**
 * Get registry provider icon (acr, ecr...).
 * @param provider
 * @returns {string}
 */
function getRegistryProviderIcon(provider) {
  let icon = "mdi-help";
  switch (provider) {
    case "acr":
      icon = "mdi-microsoft-azure";
      break;
    case "ecr":
      icon = "mdi-aws";
      break;
    case "ghcr":
      icon = "mdi-github";
      break;
    case "gcr":
      icon = "mdi-google-cloud";
      break;
    case "hub":
      icon = "mdi-docker";
      break;
    case "quay":
      icon = "mdi-redhat";
      break;
  }
  return icon;
}

/**
 * get all registries.
 * @returns {Promise<any>}
 */
async function getAllRegistries() {
  const response = await fetch("/api/registries");
  return response.json();
}

export { getRegistryIcon, getRegistryProviderIcon, getAllRegistries };

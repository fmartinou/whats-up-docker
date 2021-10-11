function getContainerIcon() {
  return "mdi-docker";
}

async function getAllContainers() {
  const response = await fetch("/api/containers");
  return response.json();
}

async function refreshAllContainers() {
  const response = await fetch(`/api/containers/watch`, {
    method: "POST",
  });
  return response.json();
}

async function refreshContainer(containerId) {
  const response = await fetch(`/api/containers/${containerId}/watch`, {
    method: "POST",
  });
  if (response.status === 404) {
    return undefined;
  }
  return response.json();
}

async function deleteContainer(containerId) {
  return fetch(`/api/containers/${containerId}`, { method: "DELETE" });
}

export {
  getContainerIcon,
  getAllContainers,
  refreshAllContainers,
  refreshContainer,
  deleteContainer,
};

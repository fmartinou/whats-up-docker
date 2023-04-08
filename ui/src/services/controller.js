function getControllerIcon() {
  return "mdi-update";
}

async function getAllControllers() {
  const response = await fetch("/api/controllers");
  return response.json();
}

export { getControllerIcon, getAllControllers };

function getTriggerIcon() {
  return "mdi-bell-ring";
}

async function getAllTriggers() {
  const response = await fetch("/api/triggers");
  return response.json();
}

export { getTriggerIcon, getAllTriggers };

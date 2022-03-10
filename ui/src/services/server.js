function getServerIcon() {
  return "mdi-connection";
}

async function getServer() {
  const response = await fetch("/api/server");
  return response.json();
}

export { getServerIcon, getServer };

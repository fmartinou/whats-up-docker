async function getAppInfos() {
  const response = await fetch("/api/app");
  return response.json();
}

export { getAppInfos };

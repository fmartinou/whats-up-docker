function getAuthenticationIcon() {
  return "mdi-lock";
}

async function getAllAuthentications() {
  const response = await fetch("/api/authentications");
  return response.json();
}

export { getAuthenticationIcon, getAllAuthentications };

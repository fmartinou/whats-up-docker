/**
 * Authentication service.
 */

// Current logged user
let user = undefined;

/**
 * Get auth strategies.
 * @returns {Promise<any>}
 */
async function getStrategies() {
  const response = await fetch("/auth/strategies");
  return response.json();
}

/**
 * Get current user.
 * @returns {Promise<*>}
 */
async function getUser() {
  if (user) {
    return user;
  }
  try {
    const response = await fetch("/auth/user", {
      redirect: "manual",
    });
    user = await response.json();
    return user;
  } catch (e) {
    user = undefined;
  }
}

/**
 * Perform auth Basic.
 * @param username
 * @param password
 * @returns {Promise<*>}
 */
async function loginBasic(username, password) {
  const base64 = btoa(`${username}:${password}`);
  const response = await fetch(`/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64}`,
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  user = await response.json();
  return user;
}

/**
 * Get Oidc redirection url.
 * @returns {Promise<*>}
 */
async function getOidcRedirection(name) {
  const response = await fetch(`/auth/oidc/${name}/redirect`);
  user = await response.json();
  return user;
}

/**
 * Logout current user.
 * @returns {Promise<any>}
 */
async function logout() {
  const response = await fetch(`/auth/logout`, {
    method: "POST",
    redirect: "manual",
  });
  user = undefined;
  return response.json();
}

export { getStrategies, getUser, loginBasic, getOidcRedirection, logout };

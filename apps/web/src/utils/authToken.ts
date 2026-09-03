export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem('authToken');
    return;
  }

  localStorage.setItem('authToken', token);
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function clearAuth() {
  localStorage.removeItem('authToken');
}

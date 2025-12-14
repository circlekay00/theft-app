export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("userData"));
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUser()?.role === "admin";
}

export function isEditor() {
  return getUser()?.role === "editor";
}

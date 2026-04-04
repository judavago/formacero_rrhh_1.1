const API = "http://localhost:3001/api";

export const fetchWithAuth = async (endpoint, options = {}) => {

  const token = localStorage.getItem("token");

  return fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...options.headers
    }
  });
};
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);
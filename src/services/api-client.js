// ======== || API CLIENT || ======= //
import axios from "axios";

axios.defaults.withCredentials = true;

const api_client = axios.create({
  baseURL: process.env.BACKEND_API_URL,
  withCredentials: true,
});

api_client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      toast.info("Session expired, logging out...");
      // Clear local user state
      localStorage.removeItem("authenticated-data-storage");
      // Redirect to login
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api_client;

import axios from "axios";

// Base URL from environment variables
const baseURL = process.env.REACT_APP_API_BASE_URL; // Make sure your .env file is correctly set

// Create instances with consistent base URLs for each service
const login = axios.create({
    baseURL: `${baseURL}/auth`, // Ensure this is the correct endpoint for login
  });
  const signup = axios.create({
    baseURL: `${baseURL}/auth`,
  });
const kyc = axios.create({
  baseURL: `${baseURL}/kyc`, // Ensure this is the correct endpoint for login
});
const users = axios.create({
    baseURL: `${baseURL}/users`, // Ensure this is the correct endpoint for login
  });
  const account = axios.create({
    baseURL: `${baseURL}/account`, // Ensure this is the correct endpoint for login
  });
// Generic request interceptor for all instances
const requestInterceptor = (req) => {
  // Optionally add authorization headers or custom logic
  // req.headers.Authorization = `Bearer ${localStorage.getItem("token") || ""}`;
  return req;
};

const errorInterceptor = (err) => {
  console.error("Request failed:", err);
  return Promise.reject(err);
};

// Apply interceptors for each axios instance
signup.interceptors.request.use(requestInterceptor, errorInterceptor);
login.interceptors.request.use(requestInterceptor, errorInterceptor);
kyc.interceptors.request.use(requestInterceptor, errorInterceptor);
users.interceptors.request.use(requestInterceptor, errorInterceptor);
account.interceptors.request.use(requestInterceptor, errorInterceptor);

export { signup, login, kyc, users, account };

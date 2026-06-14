// src/axiosConfig.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://api-admin.technivor.com/api", // Replace with your backend URL https://api.technivor.net/api
  withCredentials: true,
});

export default instance;

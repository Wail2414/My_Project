// src/axiosConfig.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Replace with your backend URL https://api.technivor.net/api
  withCredentials: true,
});

export default instance;

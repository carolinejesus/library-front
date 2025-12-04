import axios from "axios";

export const api = axios.create({
    baseURL: "https://library-system-back-3.onrender.com",
});
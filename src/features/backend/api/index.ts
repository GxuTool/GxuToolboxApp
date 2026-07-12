import axios from "axios";

export const backendHttp = axios.create({
    baseURL: "http://api.tool.gxutech.xyz",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

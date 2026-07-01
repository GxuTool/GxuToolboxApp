import axios from "axios";

export const backendHttp = axios.create({
    baseURL: "http://api.tool.gxutech.xyz",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

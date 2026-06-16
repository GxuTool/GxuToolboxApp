import axios  from "axios";

export const FEEDBACK_BASE_URL = "http://api.tool.gxutech.xyz";

export const feedbackHttp=axios.create({
    baseURL:FEEDBACK_BASE_URL,
    headers:{
        "Content-Type":"application/json",
    },
    timeout:10000,
});

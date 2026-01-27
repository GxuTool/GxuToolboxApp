import axios, {AxiosError, AxiosRequestConfig} from "axios";
import {userMgr} from "../js/mgr/user.ts";
import {ToastAndroid} from "react-native";
import moment from "moment/moment";

// 默认导出实例
export const http = axios.create({
    baseURL: "https://jwxt2018.gxu.edu.cn/jwglxt",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    withCredentials: true,
    maxRedirects: 0,
});

const requestStartTimes = new Map<AxiosRequestConfig, number>();

http.interceptors.request.use(config => {
    userMgr.jw
        .getAccount()
        .then(data => {
            if (!data.username || !data.password) {
                ToastAndroid.show("未正确设置账号，请前往设置设置账号", ToastAndroid.SHORT);
            }
        })
        .catch(() => {
            ToastAndroid.show("未正确设置账号，请前往设置设置账号", ToastAndroid.SHORT);
        });

    // 在请求发送前记录开始时间
    requestStartTimes.set(config, Date.now());
    // 只打印简洁的请求信息
    console.log(`[HTTP] --> ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

http.interceptors.response.use(
    response => {
        const startTime = requestStartTimes.get(response.config);
        const duration = startTime ? Date.now() - startTime : "N/A";
        requestStartTimes.delete(response.config); // 清理 Map

        const { method, url } = response.config;
        const { status, statusText } = response;

        // 使用 console.groupCollapsed 创建一个默认折叠的组
        console.groupCollapsed(
            `%c[HTTP] <-- ${method?.toUpperCase()} ${url} (${status} ${statusText}) - ${duration}ms`,
            "color: #2ecc71; font-weight: bold;", // 绿色表示成功
        );

        console.log("Request Payload:", response.config.data);
        console.log("Response Data:", response.data);
        console.groupEnd();

        return response;
    },
    (error: AxiosError) => {
        const config = error.config!;
        const startTime = requestStartTimes.get(config);
        const duration = startTime ? Date.now() - startTime : "N/A";
        requestStartTimes.delete(config); // 清理 Map

        const { method, url } = config;
        const status = error.response?.status || "N/A";
        const statusText = error.response?.statusText || error.message;

        // 错误日志默认展开，以便立即看到
        console.group(
            `%c[HTTP] <-- ${method?.toUpperCase()} ${url} (${status} ${statusText}) - ${duration}ms`,
            "color: #e74c3c; font-weight: bold;", // 红色表示失败
        );

        console.log("Error:", error.message);
        console.log("Request Payload:", config.data);
        console.log("Response Data:", error.response?.data);
        console.groupEnd();

        // 关键：必须返回一个 rejected Promise，以便调用方可以 catch 错误
        return Promise.reject(error);
    },
);

export function urlWithParams(url: string, params: Record<string, any> = {}): string {
    Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
            delete params[key];
        }
    });
    return (
        url +
        "?" +
        Object.keys(params)
            .map(key => key + "=" + encodeURIComponent(params[key]))
            .join("&")
    );
}

export function objectToFormUrlEncoded(obj: any): string {
    const parts: string[] = [];

    const buildParams = (prefix: string, value: any) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((v, i) => {
                buildParams(`${prefix}[${i}]`, v);
            });
        } else if (typeof value === "object") {
            Object.keys(value).forEach(key => {
                const newPrefix = prefix ? `${prefix}.${key}` : key;
                buildParams(newPrefix, value[key]);
            });
        } else {
            parts.push(`${prefix}=${encodeURIComponent(value)}`);
        }
    };

    Object.keys(obj).forEach(key => {
        buildParams(key, obj[key]);
    });

    return parts.join("&");
}

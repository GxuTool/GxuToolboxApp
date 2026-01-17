import axios from "axios";
import {userMgr} from "./mgr/user.ts";
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
    console.log(
        `%c[${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}] %c${config.method?.toUpperCase()} %c->%c ${
            config.url
        }`,
        "color: lightblue",
        "color: mediumorchid",
        "color: indianred",
        "color: unset",
    );
    console.groupCollapsed("request config");
    console.log(config);
    console.groupEnd();
    return config;
});

http.interceptors.response.use(
    response => {
        console.log(
            `%c[${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}] %c${
                response.status
            } %c<- %c${response.config.method?.toUpperCase()}%c ${response.config.url}`,
            "color: lightblue",
            "color: mediumturquoise",
            "color: lightgreen",
            "color: mediumorchid",
            "color: unset",
        );
        console.groupCollapsed("response");
        console.log(response.data);
        console.groupEnd();
        return response;
    },
    error => {
        console.error(error);
        return error;
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

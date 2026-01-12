import {http, urlWithParams} from "@/js/http.ts";
import {getEncryptedPassword} from "@/js/rasPassword";
import CookieManager from "@react-native-cookies/cookies";
import {AxiosResponse} from "axios";
import {userMgr} from "@/js/mgr/user.ts";
import {SchoolTerms} from "@/type/global.ts";
import {ToastAndroid} from "react-native";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {store} from "@/js/store.ts";
import moment from "moment/moment";

export const jwxt = {
    getPublicKey: (): Promise<{modulus: string; exponent: string}> => {
        return new Promise(async resolve => {
            await CookieManager.clearAll();
            const res = await http.get(
                urlWithParams("/xtgl/login_getPublicKey.html", {
                    time: Date.now(),
                }),
            );
            resolve(res.data);
        });
    },

    login: async (
        username: string,
        password: string,
        public_key: string,
        public_length: string,
    ): Promise<AxiosResponse> => {
        return new Promise(resolve => {
            http.post(
                urlWithParams("/xtgl/login_slogin.html", {
                    time: Date.now(),
                }),
                {
                    language: "zh_CN",
                    yhm: username,
                    mm: getEncryptedPassword(password, public_key, public_length),
                    yzm: "",
                },
            ).then(res => {
                resolve(res);
            });
        });
    },

    refreshToken: async (): Promise<AxiosResponse | void> => {
        const {username, password} = await userMgr.getJWAccount();
        userMgr.storeJWAccount(username, password);
        const keys = await jwxt.getPublicKey();
        if (keys.exponent) {
            return await jwxt.login(username, password, keys.modulus, keys.exponent);
        }
    },

    testToken: async (autoRefresh = true): Promise<boolean> => {
        const res = await http.post("/kbcx/xskbcx_cxXsgrkb.html", {
            xnm: "2021",
            xqm: SchoolTerms[0][0],
        });
        if (typeof res.data === "object") {
            jwxt.getInfo();
            return true;
        } else {
            if (autoRefresh) {
                // 自动刷新逻辑
                await jwxt.refreshToken();
                if (await jwxt.testToken(false)) {
                    jwxt.getInfo();
                    return true;
                } else {
                    ToastAndroid.show("自动刷新Token失败，请检查账号设置", ToastAndroid.SHORT);
                    return false;
                }
            } else {
                return false;
            }
        }
    },

    getInfo: async (): Promise<UserInfo | undefined> => {
        const res = await http.post("/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801");
        if (typeof res.data === "string") {
            const html = res.data;
            const getInfo = (id: string) => {
                const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                // 匹配整个 div 内容
                const divRegex = new RegExp(`<div[^>]*id=['"]${escapedId}['"][^>]*>(.*?)<\\/div>`, "s");

                const divMatch = html.match(divRegex);
                if (!divMatch) return null;

                // 从 div 内容中提取 p 标签文本
                const pRegex = /<p[^>]*>(.*?)<\/p>/s;
                const pMatch = divMatch[1].match(pRegex);

                return pMatch ? pMatch[1].trim() : null;
            };

            const info = {
                name: getInfo("col_xm"),
                school: getInfo("col_jg_id"),
                grade: +(getInfo("col_njdm_id") ?? moment().year()),
                class: getInfo("col_bh_id"),
                subject: getInfo("col_zyh_id")?.replace(/\(\d+\)/, ""),
                subject_id: getInfo("col_zyh_id")?.match(/(?<=\()\d+(?=\))/)![0],
            } as UserInfo;
            store.save({
                key: "userInfo",
                data: info,
            });
            return info;
        }
        return;
    },
    getReschedulingNews: async (isRead = 1): Promise<AxiosResponse> => {
        const res = await http.post("/xtgl/index_cxDbsy.html?doType=query", {
            sfyy: isRead,
            flag: 1,
            _search: false,
            "queryModel.showCount": 150,
            "queryModel.currentPage": 1,
        });
        return res;
    },
};

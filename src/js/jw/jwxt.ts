import {http, urlWithParams} from "@/core/http.ts";
import {getEncryptedPassword} from "@/shared/rasPassword";
import CookieManager from "@react-native-cookies/cookies";
import {AxiosResponse} from "axios";
import {userMgr} from "@/js/mgr/user.ts";
import {SchoolTerms} from "@/type/global.ts";
import {ToastAndroid} from "react-native";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {store} from "@/core/store.ts";
import {personalInfoParser} from "@/js/HTMLparser/personalInfoParser.ts";
import {UnToastRef} from "@/components/un-ui/UnToast.tsx";

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

    login: async (username: string, password: string): Promise<AxiosResponse> => {
        return new Promise(resolve => {
            http.post(
                urlWithParams("/xtgl/login_slogin.html", {
                    time: Date.now(),
                }),
                {
                    language: "zh_CN",
                    yhm: username,
                    mm: password,
                    yzm: "",
                },
            ).then(res => {
                resolve(res);
            });
        });
    },
    loginWithRSA: async (
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

    unifiedLogin: async (username: string, password: string): Promise<boolean> => {
        const keys = await jwxt.getPublicKey();
        if (!keys) return false;
        if (keys.modulus && keys.exponent) {
            await jwxt.loginWithRSA(username, password, keys.modulus, keys.exponent);
            if (await jwxt.testToken(false)) {
                return true;
            }
        }

        await jwxt.login(username, password);
        return await jwxt.testToken(false);
    },

    refreshToken: async (): Promise<boolean> => {
        const account = await userMgr.jw.getAccount();
        if (!account) {
            ToastAndroid.show("请更新账号信息", ToastAndroid.SHORT);
            return false;
        }
        const {username, password} = account;
        return jwxt.unifiedLogin(username, password);
    },

    testToken: async (autoRefresh = true, toastRef?: UnToastRef): Promise<boolean> => {
        const res = await http.post("/kbcx/xskbcx_cxXsgrkb.html", {
            xnm: "2021",
            xqm: SchoolTerms[0][0],
        });
        if (typeof res.data === "object") {
            jwxt.getInfo();
            return true;
        } else {
            if (autoRefresh) {
                if (toastRef) toastRef.setContent("尝试重新登录获取Token");
                if (await jwxt.refreshToken()) {
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
            const i = personalInfoParser(html);
            const pick = (l: string) => i.find((it: {label: string}) => it.label === l)?.value ?? "";

            const info = {
                name: pick("姓名"),
                school: pick("学院名称"),
                grade: Number(pick("年级")),
                class: pick("班级名称"),
                subject: pick("专业名称")?.replace(/\(\d+\)/, ""),
                subject_id: pick("专业名称")?.match(/(?<=\()\d+(?=\))/)![0],
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
        return await http.post("/xtgl/index_cxDbsy.html?doType=query", {
            sfyy: isRead,
            flag: 1,
            _search: false,
            "queryModel.showCount": 150,
            "queryModel.currentPage": 1,
        });
    },
};

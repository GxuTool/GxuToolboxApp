import CookieManager from "@react-native-cookies/cookies";
import {http, urlWithParams} from "@/core/http.ts";
import {AxiosResponse} from "axios";
import {getEncryptedPassword} from "@/shared/rasPassword";
import {SchoolTerms} from "@/type/global.ts";

export const JwClient = {
    async getPublicKey(): Promise<{modulus: string; exponent: string}> {
        await CookieManager.clearAll();
        const res = await http.get(urlWithParams("/xtgl/login_getPublicKey.html", {time: Date.now()}));
        return res.data;
    },
    async loginNormal(username: string, password: string): Promise<AxiosResponse> {
        return http.post(
            urlWithParams("/xtgl/login_slogin.html", {
                time: Date.now(),
            }),
            {
                language: "zh_CN",
                yhm: username,
                mm: password,
                yzm: "",
            },
        );
    },
    async loginWithRSA(
        username: string,
        password: string,
        public_key: string,
        public_length: string,
    ): Promise<AxiosResponse> {
        return http.post(
            urlWithParams("/xtgl/login_slogin.html", {
                time: Date.now(),
            }),
            {
                language: "zh_CN",
                yhm: username,
                mm: getEncryptedPassword(password, public_key, public_length),
                yzm: "",
            },
        );
    },
    async testToken(): Promise<boolean> {
        const res = await http.post("/kbcx/xskbcx_cxXsgrkb.html", {
            xnm: "2021",
            xqm: SchoolTerms[0][0],
        });
        return typeof res.data === "object";
    },
};

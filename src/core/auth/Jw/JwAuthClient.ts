import {http, urlWithParams} from "@/core/http.ts";
import {AxiosResponse} from "axios";
import {getEncryptedPassword} from "@/shared/rasPassword";
import {SchoolTerms} from "@/type/global.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {personalInfoParser} from "@/js/HTMLparser/personalInfoParser.ts";
import CookieManager from "@preeternal/react-native-cookie-manager";

export const JwAuthClient = {
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
    async testTokenRaw(): Promise<boolean> {
        const res = await http.post("/kbcx/xskbcx_cxXsgrkb.html", {
            xnm: "2021",
            xqm: SchoolTerms[0][0],
        });
        return typeof res.data === "object";
    },
    async getUserInfo(): Promise<UserInfo> {
        const res = await http.post("/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801");
        const html = res.data;
        const i = personalInfoParser(html);
        const pick = (l: string) => i.find((it: {label: string}) => it.label === l)?.value ?? "";

        return {
            name: pick("姓名"),
            school: pick("学院名称"),
            grade: Number(pick("年级")),
            class: pick("班级名称"),
            subject: pick("专业名称")?.replace(/\(\d+\)/, ""),
            subject_id: pick("专业名称")?.match(/(?<=\()\d+(?=\))/)![0],
        } as UserInfo;
    },
};

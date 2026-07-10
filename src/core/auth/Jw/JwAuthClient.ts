import {http, urlWithParams} from "@/core/http.ts";
import {AxiosResponse} from "axios";
import {getEncryptedPassword} from "@/shared/rasPassword";
import {SchoolTerms} from "@/type/global.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {personalInfoParser} from "@/js/HTMLparser/personalInfoParser.ts";
import CookieManager from "@preeternal/react-native-cookie-manager";
import {runJw} from "@/core/gateway/jw/run.ts";
import {backendHttp} from "@/features/backend/api";

async function local(username: string, password: string): Promise<boolean> {
    await JwAuthClient.clearSession();
    const keys = await JwAuthClient.getPublicKey();

    let ok = false;

    if (keys.modulus && keys.exponent) {
        await JwAuthClient.loginWithRSA(username, password, keys.modulus, keys.exponent);
        ok = await JwAuthClient.testTokenRaw();
    }

    if (!ok) {
        await JwAuthClient.loginNormal(username, password);
        ok = await JwAuthClient.testTokenRaw();
    }

    const urls = [
        "https://jwxt2018.gxu.edu.cn",
        "https://jwxt2018.gxu.edu.cn/jwglxt",
        "https://jwxt2018.gxu.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html",
    ];

    for (const url of urls) {
        const cookies = await CookieManager.get(url);
        console.log(url, cookies);
    }

    return ok;
}

async function remote(username: string, password: string): Promise<boolean> {
    const JW_COOKIE_URL = "https://jwxt2018.gxu.edu.cn/jwglxt";

    await CookieManager.clearAll();

    const res = await backendHttp.post("/jw/login", {username, password});
    const header = readHeader(res.headers["set-cookie"]);

    const session = pick(header, "JSESSIONID");
    const route = pick(header, "route");

    if (!session || !route) {
        throw new Error("missing jw cookies");
    }

    await CookieManager.set(JW_COOKIE_URL, {
        name: "JSESSIONID",
        value: session,
    });

    await CookieManager.set(JW_COOKIE_URL, {
        name: "route",
        value: route,
    });

    const saved = await CookieManager.get(JW_COOKIE_URL);

    return Boolean(saved.JSESSIONID?.value && saved.route?.value);
}

export const JwAuthClient = {
    async login(username: string, password: string): Promise<boolean> {
        return runJw(
            () => remote(username, password),
            () => local(username, password),
        );
    },

    async getPublicKey(): Promise<{modulus: string; exponent: string}> {
        // await CookieManager.clearAll();
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
    async clearSession() {
        await CookieManager.clearAll();
    },
};

function readHeader(value: unknown): string {
    if (Array.isArray(value)) return value.join("; ");
    if (typeof value === "string") return value;
    return "";
}

function pick(header: string, name: string): string | null {
    const pattern = new RegExp(`(?:^|[;,]\\s*)${name}=([^;,]+)`);
    return header.match(pattern)?.[1] ?? null;
}

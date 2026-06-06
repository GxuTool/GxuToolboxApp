import axios from "axios";
import cheerio from "react-native-cheerio";
import iconv from "iconv-lite";
import {Buffer} from "buffer";
import {userMgr} from "@/js/mgr/user.ts";

export const wjxtHttp = axios.create({
    baseURL: "https://wjxt.gxu.edu.cn/",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
});

//处理编码字符串
function htmlParser(data: ArrayBuffer): string {
    return iconv.decode(Buffer.from(data), "gb2312");
}

export const wjxt = {
    /**
     * 登录，初始密码身份证前四位+后四位
     * */
    login: async (username: string, password: string) => {
        const res = await wjxtHttp.post("", {
            __VIEWSTATE: "/wEPDwUKMTY5ODE4NTcwM2RkIBnlIHU+BoqNJr+gDM0LFVpP7SfKuRBHRBLFK+Xqy3o=",
            __VIEWSTATEGENERATOR: "C2EE9ABB",
            __SCROLLPOSITIONX: "0",
            __SCROLLPOSITIONY: "0",
            userIdCard: username,
            userPwd: password,
            loginsubmit: "%B5%C7+%C2%BC",
            myteip: "172.30.135.20--2",
        });
        const cookie = res.headers["set-cookie"];
        await userMgr.wjxt.storeLoginRes(cookie);
        const response = await wjxtHttp.post(
            "https://wjxt.gxu.edu.cn/Wjxt_UI/qstwj.aspx",
            {},
            {
                responseType: "arraybuffer",
                headers: {
                    Cookie: cookie,
                },
            },
        );
        const htmlString = htmlParser(response.data);
        return !htmlString.includes("alert");
    },

    testCookie: async (loginRes: string[] | null) => {
        if (!loginRes) return;
        const response = await wjxtHttp.post(
            "https://wjxt.gxu.edu.cn/Wjxt_UI/qstwj.aspx",
            {},
            {
                responseType: "arraybuffer",
                headers: {
                    Cookie: loginRes || "",
                },
            },
        );
        const htmlString = htmlParser(response.data);
        return !htmlString.includes("alert");
    },

    /**
     * 未读文件标题
     */
    getPendingTitles: async (): Promise<string[]> => {
        const response = await wjxtHttp.post("Wjxt_UI/qstwj.aspx", {}, {responseType: "arraybuffer"});
        const $ = cheerio.load(htmlParser(response.data));
        const items = $("span")
            .map((_, el) => $(el).text().trim())
            .get();
        const list = items.filter((item: string) => item.length > 0);
        let res = [];
        for (let i = 0; i < list.length; i += 3) {
            res.push(list.slice(i, i + 3).join("-"));
        }
        return res;
    },
};

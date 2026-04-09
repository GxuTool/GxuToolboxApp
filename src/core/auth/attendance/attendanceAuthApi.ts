import {http} from "@/core/http.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import CryptoJS from "crypto-js";
import {attendanceApi} from "@/features/attendance/api";

const BASE_URL = "https://yktuipweb.gxu.edu.cn";

// ─── 登录相关 ───

async function getCaptchaCode(): Promise<{uri: string; code: string}> {
    const res = await http.post("https://gxutool.unde.site/api/atd/mirror", {
        id: 1,
        method: "GET",
        target: `https://yktuipweb.gxu.edu.cn/api/account/getVerify?num=${Date.now()}`,
        params: {},
        data: {},
        responseType: "arraybuffer",
    });

    const dataUri = `data:image/jpeg;base64,${res.data.data}`;

    let code = "";
    await http
        .post("https://gxutool.unde.site/api/atd/captcha", {image_base64: dataUri})
        .then(res2 => {
            if (res2.data.data?.code) code = res2.data.data.code;
        })
        .catch(() => {});

    return {uri: dataUri, code};
}

async function login(username: string, password: string, captchaCode: string): Promise<AST.ResRoot<AST.LoginData>> {
    const key = CryptoJS.enc.Utf8.parse("k;)*(+nmjdsf$#@d");
    const encodePwd = CryptoJS.enc.Utf8.parse(password);
    const encryptedPwd = CryptoJS.AES.encrypt(encodePwd, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

    const data = {
        client: "web_atd",
        loginName: username,
        pwd: encryptedPwd,
        type: "1",
        verificationCode: captchaCode,
    };

    const res = await http.post<AST.ResRoot<AST.LoginData>>(`${BASE_URL}/api/account/loginCheck`, data, {
        headers: {"Content-Type": "application/json;charset=UTF-8"},
    });

    await userMgr.attendanceSystem.storeLoginRes(res.data);
    if (res.data.code === 600) {
        await attendanceApi.getMenuData();
    }
    return res.data;
}

// ─── Token 检测 ───

async function testToken(): Promise<boolean> {
    try {
        const res = await attendanceApi.getMenuData();
        return res?.code === 600;
    } catch {
        return false;
    }
}

export const attendanceAuthApi = {
    login,
    getCaptchaImage: getCaptchaCode,
    testToken,
};

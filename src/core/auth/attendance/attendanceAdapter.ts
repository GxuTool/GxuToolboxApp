import {AuthAdapter} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {authApi} from "@/js/auth/auth.ts";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";

export const attendanceAdapter: AuthAdapter<Account> = {
    async loadAccount() {
        const account = await userMgr.attendanceSystem.getAccount();
        if (!account?.username || !account?.password) return null;
        return {username: account.username, password: account.password};
    },
    async saveAccount(account: Account) {
        return userMgr.attendanceSystem.storeAccount(account.username, account.password);
    },
    async clearAccount() {
        return userMgr.attendanceSystem.storeAccount("", "");
    },
    async testToken() {
        return attendanceSystemApi.testTokenExpired();
    },
    async loginWithAccount(account: Account) {
        // TODO: 集成 OCR 服务获取 captchaCode
        // 目前考勤系统登录需要验证码，暂时无法全自动登录
        // 后续接入 OCR 后，流程为：
        // 1. 获取验证码图片
        // 2. OCR 识别
        // 3. 调用 authApi.loginAttendanceSystem(username, password, captchaCode)
        // 4. 检查返回 code === 600
        throw new Error("考勤系统登录需要验证码，请使用 AttendanceQuickLogin 组件");
    },
};

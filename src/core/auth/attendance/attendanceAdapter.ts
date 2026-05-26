import {AuthAdapter} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {attendanceAuthApi} from "@/core/auth/attendance/attendanceAuthApi.ts";

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
        return attendanceAuthApi.testToken();
    },
    async loginWithAccount(_account: Account): Promise<boolean> {
        throw new Error("考勤系统需要手动输入验证码，请在设置中手动登录");
    },
};

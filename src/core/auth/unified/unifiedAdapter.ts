import {AuthAdapter} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {authApi} from "@/js/auth/auth.ts";

const unifiedAdapter: AuthAdapter<Account> = {
    clearAccount(): Promise<unknown> {
        return Promise.resolve(undefined);
    },
    async loginWithAccount(account: Account): Promise<boolean> {
        const {username, password} = account;

        // 清理旧的 Cookie
        await authApi.logout();

        const keys = await authApi.getPublicKey();

        let res;

        if (keys.modulus && keys.exponent) {
            await authApi.login(username, password, keys.modulus, keys.exponent);
            res = await authApi.testToken();
        }
        return res;
    },
    async testToken(): Promise<boolean> {
        return await authApi.testToken();
    },
    async loadAccount() {
        return userMgr.auth.getAccount();
    },
    async saveAccount(account: Account) {
        return userMgr.auth.storeAccount(account.username, account.password);
    },
};

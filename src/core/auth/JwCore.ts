import {userMgr} from "@/js/mgr/user.ts";
import {jwxt} from "@/js/jw/jwxt.ts";
import {JwClient} from "@/core/auth/JwClient.ts";

type JwAccount = {
    username: string;
    password: string;
};

interface JwCore {
    loadAccount(): Promise<JwAccount | null>;

    saveAccount(account: JwAccount): Promise<void>;

    clearAccount(): Promise<void>;

    getAuthState(): JwAuthState;

    // getUserInfo(): any;

    loginWithAccount(account: JwAccount): Promise<JwAuthState>;

    loginWithStoredAccount(): Promise<JwAuthState>;

    // unifiedLogin(username: string, password: string): Promise<boolean>;
}

let currentState: JwAuthState = {status: "no_account"};

export const JwCore: JwCore = {
    getAuthState(): JwAuthState {
        return currentState;
    },

    async loadAccount(): Promise<JwAccount | null> {
        return userMgr.jw.getAccount();
    },

    async saveAccount(account: JwAccount): Promise<void> {
        return userMgr.jw.storeAccount(account.username, account.password);
    },

    async clearAccount(): Promise<void> {
        return userMgr.jw.storeAccount("", "");
    },

    async loginWithAccount(account: JwAccount): Promise<JwAuthState> {
        const {username, password} = account;
        const keys = await JwClient.getPublicKey();

        let res;

        if (keys.modulus && keys.exponent) {
            await JwClient.loginWithRSA(username, password, keys.modulus, keys.exponent);
            res = await JwClient.testToken();
            if (!res) {
                await JwClient.loginNormal(username, password);
                res = await JwClient.testToken();
            }
        }

        if (res) {
            const i: JwAuthState = {
                status: "authenticated",
                account,
                lastAuthTime: Date.now(),
            };
            currentState = i;
            return i;
        } else {
            const i: JwAuthState = {
                status: "has_account_not_authenticated",
                account,
            };
            currentState = i;
            return i;
        }
    },

    async loginWithStoredAccount(): Promise<JwAuthState> {
        const account = await this.loadAccount();
        if (!account) {
            currentState = {status: "no_account"};
            return currentState;
        }
        return await this.loginWithAccount(account);
    },
};

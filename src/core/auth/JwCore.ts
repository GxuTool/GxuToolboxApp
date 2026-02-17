import {userMgr} from "@/js/mgr/user.ts";
import {jwxt} from "@/js/jw/jwxt.ts";

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

const JwCore: JwCore = {
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
        const res = await jwxt.unifiedLogin(account.username, account.password);

        if (res) {
            currentState.status = "authenticated";
            return {
                status: "authenticated",
                account: account,
                lastAuthTime: Date.now(),
            };
        }
        currentState.status = "has_account_not_authenticated";
        return {
            status: "has_account_not_authenticated",
            account: account,
        };
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

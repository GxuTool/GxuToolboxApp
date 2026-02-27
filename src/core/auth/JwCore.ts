import {userMgr} from "@/js/mgr/user.ts";
import {JwClient} from "@/core/auth/JwClient.ts";
import {JwAccount, JwAuthState, JwAuthStateMap} from "@/core/auth/JwAuth.ts";

let currentState: JwAuthState = {status: JwAuthStateMap.NoAccount};

export const JwCore = {
    async refreshToken() {
        const account = await this.loadAccount();
        if (!account) {
            currentState = {status: JwAuthStateMap.NoAccount};
            return currentState;
        }

        let ok = await JwClient.testTokenRaw();
        if (ok) {
            currentState = {
                status: JwAuthStateMap.Authenticated,
                account,
            };
        } else {
            await this.loginWithStoredAccount();
            ok = await JwClient.testTokenRaw();
            if (ok) {
                currentState = {
                    status: JwAuthStateMap.Authenticated,
                    account,
                };
            } else {
                currentState = {
                    status: JwAuthStateMap.HasAccountNotAuthenticated,
                    account,
                };
            }
        }
        return currentState;
    },

    getAuthState() {
        return currentState;
    },

    async loadAccount() {
        return userMgr.jw.getAccount();
    },

    async saveAccount(account: JwAccount) {
        return userMgr.jw.storeAccount(account.username, account.password);
    },

    async clearAccount() {
        return userMgr.jw.storeAccount("", "");
    },

    async loginWithAccount(account: JwAccount) {
        const {username, password} = account;
        const keys = await JwClient.getPublicKey();

        let res;

        if (keys.modulus && keys.exponent) {
            await JwClient.loginWithRSA(username, password, keys.modulus, keys.exponent);
            res = await JwClient.testTokenRaw();
            if (!res) {
                await JwClient.loginNormal(username, password);
                res = await JwClient.testTokenRaw();
            }
        }

        if (res) {
            const i: JwAuthState = {
                status: JwAuthStateMap.Authenticated,
                account,
            };
            currentState = i;
            return i;
        } else {
            const i: JwAuthState = {
                status: JwAuthStateMap.HasAccountNotAuthenticated,
                account,
            };
            currentState = i;
            return i;
        }
    },

    async loginWithStoredAccount(): Promise<JwAuthState> {
        const account = await this.loadAccount();
        if (!account) {
            currentState = {status: JwAuthStateMap.NoAccount};
            return currentState;
        }
        return await this.loginWithAccount(account);
    },
};

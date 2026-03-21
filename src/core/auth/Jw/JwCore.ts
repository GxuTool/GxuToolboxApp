import {userMgr} from "@/js/mgr/user.ts";
import {JwAuthClient} from "@/core/auth/Jw/JwAuthClient.ts";
import {Account, AuthState, AuthStateMap} from "@/core/auth/auth.type.ts";

let currentState: AuthState = {status: AuthStateMap.NoAccount};

export const JwCore = {
    async refreshToken() {
        const account = await this.loadAccount();
        if (!account) {
            currentState = {status: AuthStateMap.NoAccount};
            return currentState;
        }

        let ok = await JwAuthClient.testTokenRaw();
        if (ok) {
            currentState = {
                status: AuthStateMap.Authenticated,
                account,
            };
        } else {
            await this.loginWithStoredAccount();
            ok = await JwAuthClient.testTokenRaw();
            if (ok) {
                currentState = {
                    status: AuthStateMap.Authenticated,
                    account,
                };
            } else {
                currentState = {
                    status: AuthStateMap.HasAccountNotAuthenticated,
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

    async saveAccount(account: Account) {
        return userMgr.jw.storeAccount(account.username, account.password);
    },

    async clearAccount() {
        return userMgr.jw.storeAccount("", "");
    },

    async loginWithAccount(account: Account) {
        const {username, password} = account;
        const keys = await JwAuthClient.getPublicKey();

        let res;

        if (keys.modulus && keys.exponent) {
            await JwAuthClient.loginWithRSA(username, password, keys.modulus, keys.exponent);
            res = await JwAuthClient.testTokenRaw();
            if (!res) {
                await JwAuthClient.loginNormal(username, password);
                res = await JwAuthClient.testTokenRaw();
            }
        }

        if (res) {
            const i: AuthState = {
                status: AuthStateMap.Authenticated,
                account,
            };
            currentState = i;
            return i;
        } else {
            const i: AuthState = {
                status: AuthStateMap.HasAccountNotAuthenticated,
                account,
            };
            currentState = i;
            return i;
        }
    },

    async loginWithStoredAccount(): Promise<AuthState> {
        const account = await this.loadAccount();
        if (!account) {
            currentState = {status: AuthStateMap.NoAccount};
            return currentState;
        }
        return await this.loginWithAccount(account);
    },
};

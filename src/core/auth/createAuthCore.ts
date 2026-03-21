export type AuthState<A> =
    | {status: "no_account"}
    | {status: "has_account_not_authenticated"; account: A}
    | {status: "authenticated"; account: A};

export interface AuthAdapter<A> {
    loadAccount: () => Promise<A | null>;
    saveAccount: (account: A) => Promise<unknown>;
    clearAccount: () => Promise<unknown>;
    testToken: () => Promise<boolean>;
    loginWithAccount: (account: A) => Promise<boolean>;
}

export interface AuthMachine<A> {
    refreshToken: () => Promise<AuthState<A>>;
    getState: () => AuthState<A>;
    loadAccount: () => Promise<A | null>;
    saveAccount: (account: A) => Promise<unknown>;
    clearAccount: () => Promise<unknown>;
    loginWithAccount: (account: A) => Promise<AuthState<A>>;
    loginWithStoredAccount: () => Promise<AuthState<A>>;
}

export function createAuthCore<A>(adapter: AuthAdapter<A>): AuthMachine<A> {
    let currentState: AuthState<A> = {status: "no_account"};

    async function refreshToken() {
        const account = await adapter.loadAccount();
        if (!account) {
            currentState = {status: "no_account"};
            return currentState;
        }

        const ok = await adapter.testToken();
        if (ok) {
            currentState = {status: "authenticated", account};
            return currentState;
        }

        const reLoginOk = await adapter.loginWithAccount(account);
        if (reLoginOk) {
            currentState = {status: "authenticated", account};
            return currentState;
        }

        currentState = {status: "has_account_not_authenticated", account};
        return currentState;
    }

    function getState() {
        return currentState;
    }

    async function loadAccount() {
        return adapter.loadAccount();
    }

    async function saveAccount(account: A) {
        return adapter.saveAccount(account);
    }

    async function clearAccount() {
        return adapter.clearAccount();
    }

    async function loginWithAccount(account: A) {
        const ok = await adapter.loginWithAccount(account);
        currentState = ok
            ? {status: "authenticated", account}
            : {status: "has_account_not_authenticated", account};
        return currentState;
    }

    async function loginWithStoredAccount() {
        const account = await adapter.loadAccount();
        if (!account) {
            currentState = {status: "no_account"};
            return currentState;
        }
        return loginWithAccount(account);
    }

    return {
        refreshToken,
        getState,
        loadAccount,
        saveAccount,
        clearAccount,
        loginWithAccount,
        loginWithStoredAccount,
    };
}

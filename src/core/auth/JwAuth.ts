interface NoAccount {
    status: "no_account";
}

interface HasAccountNotAuthenticated {
    status: "has_account_not_authenticated";
    account: {
        username: string;
        password: string;
    };
}

interface Authenticated {
    status: "authenticated";
    account: {
        username: string;
        password: string;
    };
    lastAuthTime: number;
}

type JwAuthState =
    | NoAccount
    | HasAccountNotAuthenticated
    | Authenticated;

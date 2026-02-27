export enum JwAuthStateMap {
    NoAccount = "no_account",
    HasAccountNotAuthenticated = "has_account_not_authenticated",
    Authenticated = "authenticated",
}

export type JwAccount = {
    username: string;
    password: string;
};

export type JwAuthState =
    | {
          status: JwAuthStateMap.NoAccount;
      }
    | {
          status: JwAuthStateMap.Authenticated | JwAuthStateMap.HasAccountNotAuthenticated;
          account: JwAccount;
      };

export enum AuthStateMap {
    NoAccount = "no_account",
    HasAccountNotAuthenticated = "has_account_not_authenticated",
    Authenticated = "authenticated",
}

export type Account = {
    username: string;
    password: string;
};

export type AuthState =
    | {
          status: AuthStateMap.NoAccount;
      }
    | {
          status: AuthStateMap.Authenticated | AuthStateMap.HasAccountNotAuthenticated;
          account: Account;
      };

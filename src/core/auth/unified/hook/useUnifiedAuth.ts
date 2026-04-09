import {useCallback, useEffect, useRef, useState} from "react";
import {Account} from "@/core/auth/auth.type.ts";
import {unifiedMachine} from "@/core/auth/unified/unifiedMachine.ts";
import {AuthState} from "@/core/auth/createAuthCore.ts";

export function useUnifiedAuth() {
    const [authState, setAuthState] = useState<AuthState<Account>>(unifiedMachine.getState());
    const [loading, setLoading] = useState(false);
    const inFlightRef = useRef(false);

    useEffect(() => {
        unifiedMachine.refreshToken().then(setAuthState).catch(() => {});
    }, []);

    const refreshState = useCallback(async () => {
        const state = await unifiedMachine.refreshToken();
        setAuthState(state);
        return state;
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setLoading(true);
        try {
            await unifiedMachine.saveAccount({username, password});
            const state = await unifiedMachine.loginWithAccount({username, password});
            setAuthState(state);
            return state;
        } finally {
            inFlightRef.current = false;
            setLoading(false);
        }
    }, []);

    return {authState, loading, login, refreshState, setAuthState};
}

import {useCallback, useEffect, useRef, useState} from "react";
import {Account} from "@/core/auth/auth.type.ts";
import {attendanceMachine} from "@/core/auth/attendance/attendanceMachine.ts";
import {AuthState} from "@/core/auth/createAuthCore.ts";
import {attendanceAuthApi} from "@/core/auth/attendance/attendanceAuthApi.ts";

export function useAttendanceAuth() {
    const [authState, setAuthState] = useState<AuthState<Account>>(attendanceMachine.getState());
    const [loading, setLoading] = useState(false);
    const inFlightRef = useRef(false);

    useEffect(() => {
        attendanceMachine
            .refreshToken()
            .then(setAuthState)
            .catch(() => {});
    }, []);

    const refreshState = useCallback(async () => {
        const state = await attendanceMachine.refreshToken();
        setAuthState(state);
        return state;
    }, []);

    const login = useCallback(async (username: string, password: string, captchaCode: string) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setLoading(true);
        try {
            await attendanceMachine.saveAccount({username, password});
            const res = await attendanceAuthApi.login(username, password, captchaCode);
            const state = await attendanceMachine.refreshToken();
            setAuthState(state);
            return {state, loginRes: res};
        } finally {
            inFlightRef.current = false;
            setLoading(false);
        }
    }, []);

    return {authState, loading, login, refreshState, setAuthState};
}

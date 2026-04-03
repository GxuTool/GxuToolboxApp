import {useCallback, useEffect, useRef, useState} from "react";
import {attendanceMachine} from "@/core/auth/attendance/attendanceMachine.ts";

export function useAttendanceAccount() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hydrating, setHydrating] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        (async () => {
            try {
                const account = await attendanceMachine.loadAccount();
                if (!mountedRef.current) return;
                if (account) {
                    setUsername(account.username ?? "");
                    setPassword(account.password ?? "");
                }
            } finally {
                if (mountedRef.current) setHydrating(false);
            }
        })();
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const saveAccount = useCallback(
        async (u?: string, p?: string) => {
            const nextUsername = (u ?? username).trim();
            const nextPassword = (p ?? password).trim();
            await attendanceMachine.saveAccount({username: nextUsername, password: nextPassword});
            setUsername(nextUsername);
            setPassword(nextPassword);
        },
        [username, password],
    );

    return {username, setUsername, password, setPassword, hydrating, saveAccount};
}

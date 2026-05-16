import {useCallback, useEffect, useRef, useState} from "react";
import {JwMachine} from "@/core/auth/Jw/JwMachine.ts";

export function useJwAccount() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hydrating, setHydrating] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        (async () => {
            try {
                const account = await JwMachine.loadAccount();
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
            await JwMachine.saveAccount({username: nextUsername, password: nextPassword});
            setUsername(nextUsername);
            setPassword(nextPassword);
        },
        [username, password],
    );

    return {
        username,
        setUsername,
        password,
        setPassword,
        hydrating,
        saveAccount,
    };
}

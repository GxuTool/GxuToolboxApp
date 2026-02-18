import {useCallback, useRef, useState} from "react";
import {JwCore} from "@/core/auth/JwCore";

type UiResult = {
    kind: "idle" | "success" | "error";
    title: string;
    message?: string;
};

export function useJwAuth() {
    const [authState, setAuthState] = useState<JwAuthState>(JwCore.getAuthState());
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UiResult>({kind: "idle", title: ""});

    const inFlightRef = useRef(false);
    const lastStartAtRef = useRef<number>(0);

    const clearResult = useCallback(() => {
        setResult({kind: "idle", title: ""});
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const u = username.trim();
        const p = password.trim();

        if (!u || !p) {
            setResult({kind: "error", title: "输入无效", message: "账号或密码为空"});
            return {ok: false as const, state: JwCore.getAuthState()};
        }

        const now = Date.now();

        // 防抖：800ms 内重复触发直接忽略
        if (now - lastStartAtRef.current < 800) {
            return {ok: false as const, state: authState};
        }

        // 并发锁：登录中禁止再发起
        if (inFlightRef.current) {
            return {ok: false as const, state: authState};
        }

        inFlightRef.current = true;
        lastStartAtRef.current = now;
        setLoading(true);
        clearResult();

        try {
            const state = await JwCore.loginWithAccount({username: u, password: p});
            setAuthState(state);

            if (state.status === "authenticated") {
                setResult({kind: "success", title: "登录成功", message: ""});
                return {ok: true as const, state};
            }

            setResult({
                kind: "error",
                title: "登录失败",
                message: "请检查账号密码或网络环境",
            });
            return {ok: false as const, state};
        } catch (e: any) {
            setResult({
                kind: "error",
                title: "发生异常",
                message: e?.message ? String(e.message) : "未知错误",
            });
            const state = JwCore.getAuthState();
            setAuthState(state);
            return {ok: false as const, state};
        } finally {
            inFlightRef.current = false;
            setLoading(false);
        }
    }, [authState, clearResult]);

    return {
        authState,
        loading,
        result,
        clearResult,
        login,
        setAuthState,
    };
}

import {ActivityIndicator, StyleSheet, ToastAndroid, View} from "react-native";
import {Button, Input, Text} from "@rneui/themed";
import {useEffect, useMemo, useState} from "react";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {UnPressable} from "@/components/un-ui";
import {unifiedMachine} from "@/core/auth/unified/unifiedMachine.ts";
import {Account, AuthStateMap} from "@/core/auth/auth.type.ts";
import {AuthState} from "@/core/auth/createAuthCore.ts";
import {useUnifiedAccount} from "@/core/auth/unified/hook/useUnifiedAccount.ts";

function statusMeta(state: AuthState<Account>) {
    switch (state.status) {
        case AuthStateMap.NoAccount:
            return {label: "未配置账号", color: "#9CA3AF"};
        case AuthStateMap.HasAccountNotAuthenticated:
            return {label: "已保存账号（未登录/已失效）", color: "#F59E0B"};
        case AuthStateMap.Authenticated:
            return {label: "已登录", color: "#10B981"};
        default:
            return {label: "未知状态", color: "#EF4444"};
    }
}

export function AuthAccountScreen() {
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authState, setAuthState] = useState<AuthState<Account>>(unifiedMachine.getState());
    const [result, setResult] = useState<{kind: "idle" | "success" | "error"; title: string; message?: string}>({
        kind: "idle",
        title: "",
    });

    const {username, setUsername, password, setPassword, hydrating, saveAccount} = useUnifiedAccount();

    const meta = useMemo(() => statusMeta(authState), [authState]);
    const busy = hydrating || loading;

    useEffect(() => {
        (async () => {
            try {
                const account = await unifiedMachine.loadAccount();
                if (account) {
                    setUsername(account.username);
                    setPassword(account.password);
                }
            } finally {
            }
        })();
    }, []);

    async function handleLogin() {
        const u = username.trim();
        const p = password.trim();
        if (!u || !p) {
            setResult({kind: "error", title: "输入无效", message: "账号或密码为空"});
            return;
        }

        setLoading(true);
        setResult({kind: "idle", title: ""});

        try {
            await saveAccount(u, p);
            const state = await unifiedMachine.loginWithAccount({username: u, password: p});
            setAuthState(state);

            if (state.status === AuthStateMap.Authenticated) {
                setResult({kind: "success", title: "登录成功"});
            } else {
                setResult({kind: "error", title: "登录失败", message: "请检查帐密是否正确或者检查是否连接校园网"});
            }
        } catch (e: any) {
            setResult({kind: "error", title: "发生异常", message: e?.message ? String(e.message) : "未知错误"});
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.cardTopRow}>
                    <View style={styles.statusDotWrap}>
                        <View style={[styles.statusDot, {backgroundColor: meta.color}]} />
                    </View>
                    <View style={styles.statusTextWrap}>
                        <Text style={styles.statusLabel}>当前状态</Text>
                        <Text style={[styles.statusValue, {color: meta.color}]}>{meta.label}</Text>
                    </View>
                    {busy && (
                        <View style={styles.spinnerWrap}>
                            <ActivityIndicator size="small" />
                        </View>
                    )}
                </View>

                {result.kind !== "idle" && (
                    <View
                        style={[styles.banner, result.kind === "success" ? styles.bannerSuccess : styles.bannerError]}>
                        <Text style={styles.bannerTitle}>{result.title}</Text>
                        {!!result.message && <Text style={styles.bannerMsg}>{result.message}</Text>}
                    </View>
                )}

                <Input
                    value={username}
                    onChangeText={v => setUsername(v)}
                    label="学号"
                    autoCapitalize="none"
                    autoCorrect={false}
                    disabled={busy}
                    inputStyle={styles.inputText}
                    labelStyle={styles.inputLabel}
                    containerStyle={styles.inputContainer}
                    leftIcon={<Icon type="fontawesome" name="user" size={16} style={styles.leftIcon} />}
                />

                <Input
                    value={password}
                    onChangeText={v => setPassword(v)}
                    label="密码"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPwd}
                    disabled={busy}
                    inputStyle={styles.inputText}
                    labelStyle={styles.inputLabel}
                    containerStyle={styles.inputContainer}
                    leftIcon={<Icon name="lock" size={16} style={styles.leftIcon} />}
                    rightIcon={
                        <UnPressable onPress={function() { return setShowPwd(function(s) { return !s; }); }} disabled={busy}>
                            <Icon
                                type="fontawesome"
                                name={showPwd ? "eye-slash" : "eye"}
                                size={18}
                                style={styles.rightIcon}
                            />
                        </UnPressable>
                    }
                />

                <View style={styles.actions}>
                    <Button onPress={handleLogin} disabled={busy} loading={busy}>
                        登录
                    </Button>
                </View>
                <Text style={styles.note}>仅用于工具通过统一认证系统获取西大其他网站信息{"\n"}凌晨请连接校园网</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: "5%",
    },
    card: {
        borderRadius: 16,
        padding: 14,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
        marginBottom: 10,
    },
    statusDotWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusTextWrap: {
        flex: 1,
    },
    statusLabel: {
        color: "#9CA3AF",
        fontSize: 12,
    },
    statusValue: {
        marginTop: 2,
        fontSize: 14,
        fontWeight: "700",
    },
    spinnerWrap: {
        width: 22,
        alignItems: "flex-end",
    },
    banner: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    bannerSuccess: {
        backgroundColor: "rgba(16,185,129,0.12)",
        borderColor: "rgba(16,185,129,0.35)",
    },
    bannerError: {
        backgroundColor: "rgba(239,68,68,0.12)",
        borderColor: "rgba(239,68,68,0.35)",
    },
    bannerTitle: {
        fontSize: 13,
        fontWeight: "800",
    },
    bannerMsg: {
        marginTop: 4,
        color: "#D1D5DB",
        fontSize: 12,
        lineHeight: 16,
    },
    inputContainer: {
        paddingHorizontal: 0,
        marginTop: 6,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    inputText: {
        height: 60,
        fontSize: 18,
    },
    leftIcon: {
        paddingHorizontal: 6,
        color: "#9CA3AF",
    },
    rightIcon: {
        paddingHorizontal: 6,
        color: "#9CA3AF",
    },
    actions: {
        marginTop: 8,
        gap: 10,
    },
    note: {
        marginVertical: 20,
        textAlign: "center",
        color: "gray",
        fontSize: 14,
    },
});

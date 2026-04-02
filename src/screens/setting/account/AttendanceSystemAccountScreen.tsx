import {ActivityIndicator, Pressable, StyleSheet, View} from "react-native";
import {Button, Image, Input, Text} from "@rneui/themed";
import React, {useEffect, useMemo, useState} from "react";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {attendanceAuthApi} from "@/core/auth/attendance/attendanceAuthApi.ts";
import {attendanceMachine} from "@/core/auth/attendance/attendanceMachine.ts";
import {Account, AuthStateMap} from "@/core/auth/auth.type.ts";
import {AuthState} from "@/core/auth/createAuthCore.ts";
import {useWebView} from "@/hooks/app.ts";

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

export function AttendanceSystemAccountScreen() {
    const {openInWeb} = useWebView();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captchaCode, setCaptchaCode] = useState("");
    const [captchaUri, setCaptchaUri] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hydrating, setHydrating] = useState(true);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [authState, setAuthState] = useState<AuthState<Account>>(attendanceMachine.getState());
    const [result, setResult] = useState<{kind: "idle" | "success" | "error"; title: string; message?: string}>({
        kind: "idle",
        title: "",
    });

    const meta = useMemo(() => statusMeta(authState), [authState]);
    const busy = hydrating || loading;

    async function refreshCaptcha() {
        setCaptchaLoading(true);
        try {
            const res = await attendanceAuthApi.getCaptchaImage();
            setCaptchaUri(res.uri);
            setCaptchaCode(res.code);
        } finally {
            setCaptchaLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const account = await attendanceMachine.loadAccount();
                if (account) {
                    setUsername(account.username);
                    setPassword(account.password);
                }
                await refreshCaptcha();
            } finally {
                setHydrating(false);
            }
        })();
    }, []);

    async function handleLogin() {
        const u = username.trim();
        const p = password.trim();
        const c = captchaCode.trim();
        if (!u || !p) {
            setResult({kind: "error", title: "输入无效", message: "账号或密码为空"});
            return;
        }
        if (!c || c.length !== 4) {
            setResult({kind: "error", title: "输入无效", message: "请输入4位验证码"});
            return;
        }

        setLoading(true);
        setResult({kind: "idle", title: ""});

        try {
            await attendanceMachine.saveAccount({username: u, password: p});
            const res = await attendanceAuthApi.login(u, p, c);

            if (res.code === 600) {
                setAuthState({status: AuthStateMap.Authenticated, account: {username: u, password: p}});
                setResult({kind: "success", title: "登录成功"});
            } else {
                setAuthState({status: AuthStateMap.HasAccountNotAuthenticated, account: {username: u, password: p}});
                setResult({kind: "error", title: "登录失败", message: res.msg || "请检查帐密或验证码"});
            }
        } catch (e: any) {
            setResult({kind: "error", title: "发生异常", message: e?.message ? String(e.message) : "未知错误"});
        } finally {
            setLoading(false);
            await refreshCaptcha();
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* ── 状态指示器 ── */}
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

                {/* ── 结果反馈 ── */}
                {result.kind !== "idle" && (
                    <View
                        style={[styles.banner, result.kind === "success" ? styles.bannerSuccess : styles.bannerError]}>
                        <Text style={styles.bannerTitle}>{result.title}</Text>
                        {!!result.message && <Text style={styles.bannerMsg}>{result.message}</Text>}
                    </View>
                )}

                {/* ── 学号 ── */}
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

                {/* ── 密码 ── */}
                <Input
                    value={password}
                    onChangeText={v => setPassword(v)}
                    label="密码"
                    placeholder="默认为身份证后6位"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPwd}
                    disabled={busy}
                    inputStyle={styles.inputText}
                    labelStyle={styles.inputLabel}
                    containerStyle={styles.inputContainer}
                    leftIcon={<Icon name="lock" size={16} style={styles.leftIcon} />}
                    rightIcon={
                        <Pressable onPress={() => setShowPwd(s => !s)} disabled={busy}>
                            <Icon
                                type="fontawesome"
                                name={showPwd ? "eye-slash" : "eye"}
                                size={18}
                                style={styles.rightIcon}
                            />
                        </Pressable>
                    }
                />

                {/* ── 验证码 ── */}
                <Input
                    value={captchaCode}
                    onChangeText={v => setCaptchaCode(v)}
                    label="验证码"
                    placeholder="4位验证码（自动OCR识别）"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={4}
                    disabled={busy}
                    inputStyle={styles.inputText}
                    labelStyle={styles.inputLabel}
                    containerStyle={styles.inputContainer}
                    leftIcon={<Icon name="shield-check-outline" size={16} style={styles.leftIcon} />}
                    rightIcon={
                        <Pressable onPress={refreshCaptcha} disabled={busy || captchaLoading}>
                            {captchaUri ? (
                                <Image
                                    style={styles.captchaImage}
                                    source={{uri: captchaUri}}
                                    PlaceholderContent={<ActivityIndicator />}
                                />
                            ) : (
                                <ActivityIndicator size="small" />
                            )}
                        </Pressable>
                    }
                />

                {/* ── 按钮区 ── */}
                <View style={styles.actions}>
                    <Button onPress={handleLogin} disabled={busy} loading={loading}>
                        登录
                    </Button>
                    <Button
                        type="outline"
                        onPress={() =>
                            openInWeb("考勤系统", {uri: "https://yktuipweb.gxu.edu.cn/#/StudentHome"})
                        }
                        disabled={busy}>
                        在浏览器打开考勤系统（全天需要校园网）
                    </Button>
                </View>

                <Text style={styles.note}>
                    仅用于工具获取考勤信息{"\n"}验证码已接入云端 OCR 服务自动识别{"\n"}识别失败时可手动修改
                </Text>
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
    captchaImage: {
        width: 95,
        height: 25,
        borderRadius: 4,
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

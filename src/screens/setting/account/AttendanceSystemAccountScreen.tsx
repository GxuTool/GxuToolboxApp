import {ActivityIndicator, Pressable, ScrollView, StyleSheet, ToastAndroid} from "react-native";
import {Button, Image, Input, Text} from "@rneui/themed";
import React, {useEffect, useState} from "react";
import {Icon} from "@/components/un-ui";
import {authApi} from "@/js/auth/auth.ts";
import {http} from "@/core/http.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {useWebView} from "@/hooks/app.ts";

export function AttendanceSystemAccountScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captchaCode, setCaptchaCode] = useState("");
    const [captchaCodeUri, setCaptchaCodeUri] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const {openInWeb} = useWebView();

    async function refreshCaptchaCode() {
        const res = await http.get("https://yktuipweb.gxu.edu.cn/api/account/getVerify?num=666", {
            responseType: "arraybuffer",
        });
        const base64 = btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ""));
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setCaptchaCodeUri(dataUri);
        return dataUri;
    }

    async function login(username: string, password: string, captchaCode: string) {
        await userMgr.attendanceSystem.storeAccount(username, password);
        ToastAndroid.show("开始尝试登录考勤系统", ToastAndroid.SHORT);
        // 尝试登录
        const res = await authApi.loginAttendanceSystem(username, password, captchaCode);
        if (res.code === 600) {
            ToastAndroid.show("登录成功", ToastAndroid.SHORT);
        } else {
            ToastAndroid.show("登录失败，" + res.msg, ToastAndroid.SHORT);
        }
        await refreshCaptchaCode();
    }

    async function init() {
        await refreshCaptchaCode();
        const account = await userMgr.attendanceSystem.getAccount();
        if (!account) return;
        setUsername(account.username);
        setPassword(account.password);
    }

    //从存储中读取数据
    useEffect(() => {
        init();
    }, []);
    return (
        <ScrollView contentContainerStyle={style.container}>
            <Text h2 style={style.title}>
                设置考勤系统帐密
            </Text>
            <Text style={style.note}>仅用于工具通过考勤系统系统获取考勤信息，凌晨请连接校园网</Text>
            <Input
                value={username}
                onChangeText={v => setUsername(v)}
                label="账号/学号"
                placeholder="工具绑定的考勤系统账号"
                style={style.input}
            />
            <Input
                value={password}
                onChangeText={v => setPassword(v)}
                label="密码"
                placeholder="对应账号的密码，默认为身份证后6位"
                secureTextEntry={!showPwd}
                rightIcon={
                    <Icon
                        type="fontawesome"
                        name={showPwd ? "eye-slash" : "eye"}
                        size={20}
                        style={style.showPwdIcon}
                        onPress={() => setShowPwd(!showPwd)}
                    />
                }
                style={style.input}
            />
            <Input
                value={captchaCode}
                onChangeText={v => setCaptchaCode(v)}
                label="验证码"
                placeholder="右侧验证码，看不清点击刷新"
                rightIcon={
                    <Pressable onPress={refreshCaptchaCode}>
                        <Image
                            style={style.image}
                            source={{uri: captchaCodeUri}}
                            PlaceholderContent={<ActivityIndicator />}
                        />
                    </Pressable>
                }
                style={style.input}
            />
            <Button onPress={() => login(username, password, captchaCode)}>登录考勤系统</Button>
            <Button
                containerStyle={{marginTop: 10}}
                onPress={() =>
                    openInWeb("考勤系统登录", {
                        uri: "https://yktuipweb.gxu.edu.cn/#/StudentHome",
                    })
                }>
                在浏览器打开考勤系统
            </Button>
            {/*<Button*/}
            {/*    containerStyle={{marginTop: 10}}*/}
            {/*    onPress={() => {*/}
            {/*        openInJw("/xtgl/login_slogin.html")*/}
            {/*    }}>*/}
            {/*    打开教务登录页*/}
            {/*</Button>*/}
            <Text style={style.note}>验证码需要手动输入，默认记忆帐密，登录成功后，可以在工具里使用快速登录的功能</Text>
        </ScrollView>
    );
}

const style = StyleSheet.create({
    container: {
        padding: "5%",
    },
    title: {
        textAlign: "center",
    },
    note: {
        marginVertical: 20,
        textAlign: "center",
        color: "gray",
        fontSize: 14,
    },
    showPwdIcon: {
        paddingHorizontal: 5,
        cursor: "pointer",
    },
    input: {
        height: 40,
    },
    image: {
        width: 95,
        height: 25,
    },
});

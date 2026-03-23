import {StyleSheet, ToastAndroid, View} from "react-native";
import {Button, Input, Text} from "@rneui/themed";
import {useEffect, useState} from "react";
import {userMgr} from "@/js/mgr/user.ts";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {unifiedMachine} from "@/core/auth/unified/unifiedMachine.ts";
import {AuthStateMap} from "@/core/auth/auth.type.ts";

async function getToken(username: string, password: string) {
    await unifiedMachine.saveAccount({username, password});
    ToastAndroid.show("开始尝试登录统一认证系统", ToastAndroid.SHORT);
    const state = await unifiedMachine.loginWithAccount({username, password});
    if (state.status === AuthStateMap.Authenticated) {
        ToastAndroid.show("登录成功", ToastAndroid.SHORT);
    } else {
        ToastAndroid.show("登录失败，请检查帐密是否正确或者检查是否连接校园网", ToastAndroid.SHORT);
    }
}

export function AuthAccountScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    async function init() {
        const account = await unifiedMachine.loadAccount();
        if (!account) return;
        setUsername(account.username);
        setPassword(account.password);
    }

    //从存储中读取数据
    useEffect(() => {
        init();
    }, []);
    return (
        <View style={style.container}>
            <Text h2 style={style.title}>
                设置统一认证帐密
            </Text>
            <Text style={style.note}>仅用于工具通过统一认证系统获取西大其他网站信息，凌晨请连接校园网</Text>
            <Input
                value={username}
                onChangeText={v => setUsername(v)}
                label="账号/学号"
                placeholder="工具绑定的统一认证系统账号"
                style={style.input}
            />
            <Input
                value={password}
                onChangeText={v => setPassword(v)}
                label="密码"
                placeholder="对应账号的密码"
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
            <Button onPress={() => getToken(username, password)}>登录统一认证系统</Button>
        </View>
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
        height: 60,
    },
});

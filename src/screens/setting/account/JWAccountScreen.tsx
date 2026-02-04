import {StyleSheet, ToastAndroid, View} from "react-native";
import {Button, Input, Text} from "@rneui/themed";
import {useEffect, useState} from "react";
import {jwxt} from "@/js/jw/jwxt.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {beQuery} from "@/js/be/log.ts";
import {useWebView} from "@/hooks/app.ts";

async function getToken(username: string, password: string) {
    await userMgr.jw.storeAccount(username, password);
    ToastAndroid.show("开始尝试登录", ToastAndroid.SHORT);
    if (username && password) {
        // 尝试登录
        await jwxt.unifiedLogin(username, password);
        // 检验Token
        if (await jwxt.testToken(false)) {
            ToastAndroid.show("获取成功，尝试获取用户基础信息", ToastAndroid.SHORT);
            if ((await jwxt.getInfo()) !== undefined) {
                ToastAndroid.show("获取基础信息成功", ToastAndroid.SHORT);
            } else {
                ToastAndroid.show("获取基础信息失败", ToastAndroid.SHORT);
            }
        } else {
            ToastAndroid.show("获取失败，请检查帐密是否正确或者检查是否连接校园网", ToastAndroid.SHORT);
        }
    }
}

export function JWAccountScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const {openInJw} = useWebView();

    async function init() {
        const account = await userMgr.jw.getAccount();
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
                设置教务帐密
            </Text>
            <Text style={style.note}>仅用于工具从教务系统获取信息，凌晨请连接校园网</Text>
            <Input
                value={username}
                onChangeText={v => setUsername(v)}
                label="账号/学号"
                placeholder="工具绑定的教务系统账号"
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
            <Button onPress={() => getToken(username, password)}>登录</Button>
            <Button
                containerStyle={{marginTop: 10}}
                onPress={() => {
                    openInJw("/xtgl/login_slogin.html");
                }}>
                打开教务登录页
            </Button>
            <Text style={style.note}>提示获取成功后，回到课表页进行测试，若无法正常获取课表，可能为密码错误</Text>
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

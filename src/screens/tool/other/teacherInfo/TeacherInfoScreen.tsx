import React, {useState} from "react";
import {Pressable, ScrollView, ToastAndroid, View} from "react-native";
import {Flex, UnText} from "@/components/un-ui";
import {Button, Divider, Image, Input, useTheme} from "@rneui/themed";
import {teacherInfoApi} from "@/js/info/teacherInfo.ts";
import {SimpleTeacherInfo} from "@/type/api/teacherInfo/info.ts";
import {Color} from "@/shared/color.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {DetailInfoScreen} from "@/screens/tool/other/teacherInfo/DetailInfoScreen.tsx";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useNavigation} from "@react-navigation/native";

type ItemProps = {
    item: SimpleTeacherInfo;
};

export function QueryInfoItem(props: ItemProps) {
    const iconUrl = "https://prof.gxu.edu.cn/images/icon-teacher.jpg";

    const {theme} = useTheme();
    const {store} = useUserConfig();

    const navigation = useNavigation();

    return (
        <Pressable
            android_ripple={store(s => s.theme.ripple)}
            style={{
                backgroundColor: Color(theme.colors.primary).setAlpha(0.2).rgbaString,
                width: "100%",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Color(theme.colors.primary).setAlpha(0.6).rgbaString,
            }}
            onPress={() => {
                // @ts-ignore
                navigation.navigate("DetailInfo", {teacher: props.item});
            }}>
            <Flex gap={12}>
                <View>
                    <Image
                        source={{uri: props.item.pic ? props.item.pic : iconUrl}}
                        style={{width: 60, height: 60, borderRadius: 4}}
                    />
                </View>
                <Divider orientation={"vertical"} />
                <View style={{flexDirection: "column", gap: 6, flex: 1}}>
                    <UnText size={16}>{props.item.XM}</UnText>
                    <UnText size={12}>{props.item.dwmc}</UnText>
                </View>
            </Flex>
        </Pressable>
    );
}

export function InfoQueryScreen() {
    const [teacherInfoList, setTeacherInfoList] = useState([]);
    const [name, setName] = useState();

    async function getInfo() {
        if (!name) {
            ToastAndroid.show("请先输入教师姓名", 100);
            return;
        }
        const res = await teacherInfoApi.getBaseInfo(name);
        // @ts-ignore
        if (res.resData.list) {
            const infoList = res.resData.list;
            setTeacherInfoList(infoList);
            ToastAndroid.show("查询成功, 正在加载", 100);
        } else {
            ToastAndroid.show("查询失败", 100);
        }
    }
    return (
        <ScrollView
            contentContainerStyle={{
                padding: "5%",
            }}>
            <UnText>教师姓名查询</UnText>
            <Input placeholder="输入教师姓名" value={name} onChangeText={(inputName: string) => setName(inputName)} />
            <Button onPress={() => getInfo()}>查询</Button>

            <View style={{marginVertical: 10}}>
                <View style={{flexDirection: "row", alignItems: "flex-end", gap: 4}}>
                    <UnText size={24}>查询结果</UnText>
                    <UnText>当前共有 {teacherInfoList.length ?? 0} 个结果</UnText>
                </View>
            </View>

            {teacherInfoList.length ? (
                <>
                    <Flex direction={"column"} gap={12}>
                        {teacherInfoList.map(info => (
                            <QueryInfoItem item={info} />
                        ))}
                    </Flex>
                </>
            ) : (
                <>
                    <View style={{alignItems: "center", marginTop: 200}}>
                        <UnText size={16}>当前暂无信息</UnText>
                    </View>
                </>
            )}
        </ScrollView>
    );
}

export function TeacherQueryInfoScreen() {

    const Stack = createNativeStackNavigator();

    // @ts-ignore
    return (
        <>
            <Stack.Navigator screenOptions={{headerShown: false, animation: "fade"}}>
                <Stack.Screen name={"QueryInfo"} component={InfoQueryScreen} options={{title: "查询"}} />
                <Stack.Screen name={"DetailInfo"} component={DetailInfoScreen} options={{title: "信息"}} />
            </Stack.Navigator>
        </>
    );
}

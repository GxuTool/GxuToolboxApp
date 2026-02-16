import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Color} from "@/shared/color.ts";
import {Button, useTheme} from "@rneui/themed";
import {HomeScreen} from "@/screens/HomeScreen.tsx";
import {ScheduleEdit} from "@/screens/home/schedule/ScheduleEdit.tsx";
import {useUserConfig, useWebView} from "@/hooks/app.ts";

const Stack = createNativeStackNavigator();

export function HomeStack() {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const {openInJw} = useWebView();
    const headerRightEle = () => {
        return (
            <Button
                type="clear"
                containerStyle={{marginRight: 10}}
                onPress={() => {
                    openInJw("/xtgl/index_initMenu.html");
                }}>
                打开教务
            </Button>
        );
    };
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: Color(theme.colors.background).setAlpha(
                        ((theme.mode === "dark" ? 0.7 : 0.9) * userConfig.theme.bgOpacity) / 100,
                    ).rgbaString,
                },
                contentStyle: {
                    backgroundColor: Color(theme.colors.background).setAlpha(
                        ((theme.mode === "dark" ? 0.5 : 0.6) * userConfig.theme.bgOpacity) / 100,
                    ).rgbaString,
                },
                animation: "fade",
                animationDuration: 100,
                headerRight: headerRightEle,
            }}>
            <Stack.Screen
                name="HomeScreen"
                options={{
                    title: "首页",
                }}
                component={HomeScreen}
            />
            <Stack.Screen
                name="ScheduleEdit"
                component={ScheduleEdit}
                options={{
                    title: "日程编辑",
                    headerStyle: {
                        backgroundColor: Color(theme.colors.background).setAlpha(
                            ((theme.mode === "dark" ? 0.5 : 0.4) * userConfig.theme.bgOpacity) / 100,
                        ).rgbaString,
                    },
                    contentStyle: {
                        backgroundColor: "transparent",
                    },
                }}
            />
        </Stack.Navigator>
    );
}

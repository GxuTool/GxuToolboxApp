import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import {HomeScreen} from "@/screens/HomeScreen.tsx";
import {ScheduleEdit} from "@/screens/home/schedule/ScheduleEdit.tsx";
import {useUserConfig} from "@/hooks/useUserConfig.ts";

const Stack = createNativeStackNavigator();

export function HomeStack() {
    const {theme} = useTheme();
    const {store} = useUserConfig();
    const bgOpacity = store(s => s.theme.bgOpacity);
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: Color(theme.colors.background).setAlpha(
                        ((theme.mode === "dark" ? 0.7 : 0.9) * bgOpacity) / 100,
                    ).rgbaString,
                },
                contentStyle: {
                    backgroundColor: Color(theme.colors.background).setAlpha(
                        ((theme.mode === "dark" ? 0.5 : 0.6) * bgOpacity) / 100,
                    ).rgbaString,
                },
                animation: "fade",
                animationDuration: 100,
            }}>
            <Stack.Screen
                name="HomeScreen"
                options={{
                    headerShown: false,
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
                            ((theme.mode === "dark" ? 0.5 : 0.4) * bgOpacity) / 100,
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

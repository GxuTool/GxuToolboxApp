import {ImageBackground, StatusBar, StyleSheet, useColorScheme, View, ViewProps} from "react-native";
import {DarkTheme, DefaultTheme, NavigationContainer} from "@react-navigation/native";
import {RootStack} from "@/route/RootStack.tsx";
import React, {useCallback, useEffect, useMemo} from "react";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {useCourse} from "@/hooks/useCourse.ts";
import {useTheme} from "@rneui/themed";
import {useUserConfig} from "@/hooks/app.ts";
import {UnToastContextProvider} from "@/components/un-ui/UnToast.tsx";
import {MapPickerHost} from "@/components/map/MapPickerHost.tsx";

export function Root(props: ViewProps) {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();
    const colorScheme = useColorScheme();
    const {store, courseScheduleStyle, init} = useCourse();

    useEffect(() => {
        init();
    }, [init]);

    const courseScheduleData = store(s => ({
        courseInfoVisible: s.courseInfoVisible,
        startDay: s.startDay,
        randomColor: s.randomColor,
        weekdayList: s.weekdayList,
        timeSpanList: s.timeSpanList,
    }));

    const updateCourseScheduleData = useCallback(
        (data: Partial<typeof courseScheduleData>) => {
            for (const [k, v] of Object.entries(data)) {
                store.getState().update(k as keyof typeof courseScheduleData, v);
            }
        },
        [store],
    );

    // 使用 useMemo 包装 Context value 以避免不必要的重渲染
    const contextValue = useMemo(
        () => ({
            courseScheduleData,
            courseScheduleStyle,
            updateCourseScheduleData,
        }),
        [courseScheduleData, courseScheduleStyle, updateCourseScheduleData],
    );

    const style = StyleSheet.create({
        backgroundStyle: {
            flex: 1,
            backgroundColor: theme.colors.grey5,
        },
        bg: {
            width: "100%",
            height: "100%",
            flex: 1,
        },
    });

    const currentDefaultNavTheme = colorScheme === "light" ? DefaultTheme : DarkTheme;
    const navigationTheme = {
        ...currentDefaultNavTheme,
        dark: colorScheme === "dark",
        colors: {
            ...currentDefaultNavTheme.colors,
            ...theme.colors,
            background: "transparent",
        },
    };
    return (
        <CourseScheduleContext.Provider value={contextValue}>
            <UnToastContextProvider>
                <View {...props} style={[style.backgroundStyle, props.style]}>
                    <ImageBackground
                        style={style.bg}
                        source={{uri: userConfig.theme.bgUrl}}
                        loadingIndicatorSource={{uri: userConfig.theme.bgUrl}}
                        resizeMode="cover">
                        <StatusBar barStyle={colorScheme === "light" ? "dark-content" : "light-content"} />
                        <NavigationContainer theme={navigationTheme}>
                            <RootStack />
                        </NavigationContainer>
                        <MapPickerHost />
                    </ImageBackground>
                </View>
            </UnToastContextProvider>
        </CourseScheduleContext.Provider>
    );
}

import {Pressable, PressableAndroidRippleConfig, ScrollView, StyleSheet, View} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import {Color} from "@/js/color.ts";
import {useNavigation} from "@react-navigation/native";
import {Icon} from "@/components/un-ui/Icon.tsx";
import React, {useContext} from "react";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {Flex} from "@/components/un-ui";
import {useWebView} from "@/hooks/app.ts";

interface settingSection {
    title: string;
    data: ToolboxItem[];
}

type ToolboxItem =
    | {
          label: string;
          icon?: React.ReactNode;
          type?: "navigation";
          navigation: string;
      }
    | {
          label: string;
          icon?: React.ReactNode;
          type?: "callback";
          onClick: () => void;
      };

const iconSize = 25;

export function ToolboxIndex() {
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {openInWeb} = useWebView();
    const {userConfig} = useContext(UserConfigContext);

    const toolList = [
        {
            title: "信息查询",
            data: [
                {
                    label: "课表",
                    icon: <Icon name="calendar-month" size={iconSize} />,
                    type: "navigation",
                    navigation: "courseScheduleQuery",
                },
                {
                    label: "班级课表",
                    icon: <Icon name="calendar-month-outline" size={iconSize} />,
                    type: "navigation",
                    navigation: "classCourseSchedule",
                },
                {
                    label: "考试信息",
                    icon: <Icon name="information-box-outline" size={iconSize} />,
                    type: "navigation",
                    navigation: "examInfo",
                },
                {
                    label: "考试成绩",
                    icon: <Icon name="chart-box" size={iconSize} />,
                    type: "navigation",
                    navigation: "examScore",
                },
                {
                    label: "考勤信息",
                    icon: <Icon name="clock" size={iconSize} />,
                    type: "navigation",
                    navigation: "AttendanceInfoQueryScreen",
                },
                {
                    label: "选课课程列表",
                    icon: <Icon name="list-box" size={iconSize} />,
                    type: "navigation",
                    navigation: "courseSelectionList",
                },
                // {
                //     label: "自主选课",
                //     icon: <Icon name="barschart" size={iconSize} />,
                //     navigation: "SelfSelectedCourse",
                // },
            ],
        },
        {
            title: "实践课",
            data: [
                {
                    label: "物理实验课",
                    icon: <Icon name="flask" size={iconSize} />,
                    type: "navigation",
                    navigation: "phyExpScreen",
                },
                {
                    label: "金工实训",
                    icon: <Icon name="tools" size={iconSize} />,
                    type: "navigation",
                    navigation: "engTrainingScheduleScreen",
                },
            ],
        },
        {
            title: "通知",
            data: [
                {
                    label: "调课信息",
                    icon: <Icon name="clock-star-four-points-outline" size={iconSize} />,
                    type: "navigation",
                    navigation: "reschedulingNews",
                },
                {
                    label: "调休信息",
                    icon: <Icon name="calendar-clock" size={iconSize} />,
                    type: "navigation",
                    navigation: "timeShiftScreen",
                },
            ],
        },
        {
            title: "教学评价",
            data: [
                {
                    label: "期末学生评价",
                    icon: <Icon name="invoice-text-edit" size={iconSize} />,
                    type: "navigation",
                    navigation: "EvaluationOverview",
                },
            ],
        },
        {
            title: "其他",
            data: [
                {
                    label: "地图导航",
                    icon: <Icon name="map" size={iconSize} />,
                    type: "navigation",
                    navigation: "PositionListScreen",
                },
                {
                    label: "小部件预览",
                    icon: <Icon name="widgets" size={iconSize} />,
                    type: "navigation",
                    navigation: "WidgetPreviewScreen",
                },
                {
                    label: "校园网充值",
                    icon: <Icon name="wifi" size={iconSize} />,
                    type: "callback",
                    onClick: () => {
                        openInWeb("校园网充值", {
                            uri: "https://xywjf.gxu.edu.cn/WebPay/toRecharge",
                        });
                    },
                },
            ],
        },
    ] as settingSection[];
    const data = {
        style: {
            cardBg: Color(theme.mode === "light" ? theme.colors.background : theme.colors.grey5).setAlpha(
                0.1 + ((theme.mode === "light" ? 0.7 : 0.1) * userConfig.theme.bgOpacity) / 100,
            ).rgbaString,
            settingItemRipple: {
                color: theme.colors.grey4,
            } as PressableAndroidRippleConfig,
        },
    };

    const style = StyleSheet.create({
        settingContainer: {
            padding: "5%",
        },
        settingSectionContainer: {
            paddingHorizontal: "3%",
            paddingTop: "2%",
            paddingBottom: "5%",
            borderRadius: 16,
            backgroundColor: data.style.cardBg,
            marginBottom: 10,
        },
        toolListContainer: {
            flexWrap: "wrap",
            width: "100%",
            paddingTop: 10,
        },
        settingItem: {
            width: "33%",
            borderRadius: 8,
            paddingVertical: 10,
        },
        toolIcon: {
            marginVertical: 10,
        },
        toolLabel: {
            fontSize: 14,
            textAlign: "center",
        },
    });

    function itemClick(item: ToolboxItem) {
        switch (item.type) {
            case "navigation":
                navigation.navigate(item.navigation);
                return;
            case "callback":
                item.onClick();
        }
    }

    return (
        <ScrollView contentContainerStyle={style.settingContainer}>
            {toolList.map(section => (
                <View style={style.settingSectionContainer} key={`tool-${section.title}`}>
                    <Text h4>{section.title}</Text>
                    <Flex style={style.toolListContainer}>
                        {section.data.map(tool => (
                            <Pressable
                                key={`tool-${section.title}-${tool.label}`}
                                style={style.settingItem}
                                android_ripple={userConfig.theme.ripple}
                                onPress={() => itemClick(tool)}>
                                <Flex direction="column" inline>
                                    <View style={style.toolIcon}>{tool.icon}</View>
                                    <Text style={style.toolLabel}>{tool.label}</Text>
                                </Flex>
                            </Pressable>
                        ))}
                    </Flex>
                </View>
            ))}
        </ScrollView>
    );
}

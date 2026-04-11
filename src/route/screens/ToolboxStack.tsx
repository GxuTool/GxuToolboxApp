import React, {lazy} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ToolboxIndex} from "@/screens/tool/ToolboxIndex.tsx";
import {ExamInfo} from "@/features/examInfo/screens/ExamInfo.tsx";
import {ExamScore} from "@/features/examScore/screen/ExamScore.tsx";
import {Color} from "@/shared/color.ts";
import {ClassCourseSchedule} from "@/screens/tool/jw/infoQuery/courseSchedule/ClassCourseSchedule.tsx";
import {EvaluationOverview} from "@/features/evaluation/screens/EvaluationOverview.tsx";
import {EvaluationDetail} from "@/features/evaluation/screens/EvaluationDetail.tsx";
import {Button, useTheme} from "@rneui/themed";
import {EvaluationComment} from "@/features/evaluation/screens/EvaluationComment.tsx";
import {BuildingListScreen} from "@/screens/tool/other/mapNavigation/BuildingListScreen.tsx";
import {CourseScheduleQuery} from "@/screens/tool/jw/infoQuery/courseSchedule/CourseScheduleQuery.tsx";
import {WidgetPreviewScreen} from "@/screens/tool/other/widgetPreview/WidgetPreviewScreen.tsx";
import {PhyExpScreen} from "@/screens/tool/jw/infoQuery/praticalCourse/PhyExpScreen.tsx";
import {EngTrainingScheduleScreen} from "@/screens/tool/jw/infoQuery/praticalCourse/EngTrainingScheduleScreen.tsx";
import {SelfCourseSelection} from "@/screens/tool/jw/courseSelection/SelfCourseSelection.tsx";
import {GPAcalculator} from "@/screens/tool/jw/GPAcalculator/GPAcalculator.tsx";
// import {RescheduleNotificationScreen} from "@/features/notification/screen/RescheduleNotificationScreen.tsx";
import {TimeShiftScreen} from "@/screens/tool/jw/notification/TimeShiftScreen.tsx";
import AttendanceInfoQueryScreen from "@/screens/tool/auth/attendanceSystem/AttendanceInfoQueryScreen.tsx";
import WebViewScreen from "@/screens/WebViewScreen.tsx";
import {useUserConfig, useWebView} from "@/hooks/app.ts";
import {EvaluationTemplate} from "@/features/evaluation/screens/EvaluationTemplate.tsx";
import {HolidayScreen} from "@/features/holidays/screen/HolidayScreen.tsx";
import {TeachBuildingListScreen} from "@/screens/tool/other/TeachingBuildingMap/TeachBuildingListScreen.tsx";
import {FloorlistScreen} from "@/screens/tool/other/TeachingBuildingMap/FloorlistScreen.tsx";
import {FloorMapScreen} from "@/screens/tool/other/TeachingBuildingMap/FloorMapScreen.tsx";
import {TeacherQueryInfoScreen} from "@/screens/tool/other/teacherInfo/TeacherInfoScreen.tsx";
import {RescheduleNotificationScreen} from "@/features/notification/screen/RescheduleNotificationScreen.tsx";
import {TestPage} from "@/features/TestPage.tsx";
import {FullCourseScreen} from "@/features/fullClassCourse/screens/FullCourseScreen.tsx";

const Stack = createNativeStackNavigator();

export function ToolboxStack() {
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
            initialRouteName="toolboxIndex"
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
                name="toolboxIndex"
                component={ToolboxIndex}
                options={{
                    title: "工具箱",
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

            {/*  工具  */}
            <Stack.Screen name="courseScheduleQuery" component={CourseScheduleQuery} options={{title: "课表查询"}} />
            <Stack.Screen
                name="classCourseSchedule"
                component={ClassCourseSchedule}
                options={{title: "班级课表查询"}}
            />
            <Stack.Screen
                name="AttendanceInfoQueryScreen"
                component={AttendanceInfoQueryScreen}
                options={{title: "考勤信息查询"}}
            />

            <Stack.Screen name="examInfo" component={ExamInfo} options={{title: "考试信息查询"}} />
            <Stack.Screen name="examScore" component={ExamScore} options={{title: "考试成绩查询"}} />
            <Stack.Screen name="gpaCalculator" component={GPAcalculator} options={{title: "GPA计算器"}} />
            <Stack.Screen name="SelfSelectedCourse" component={SelfCourseSelection} options={{title: "自主选课"}} />
            <Stack.Screen
                name="courseSelectionList"
                component={lazy(() => import("@/screens/tool/jw/courseSelection/CourseSelectionList.tsx"))}
                options={{title: "选课课程列表查询"}}
            />
            <Stack.Screen
                name="ElectiveStrategy"
                component={lazy(() => import("@/features/electiveStrategy/screen/ElectiveStrategy"))}
                options={{title: "校选课查漏"}}
            />
            <Stack.Screen
                name="TeacherQueryInfoScreen"
                component={TeacherQueryInfoScreen}
                options={{title: "教师信息查询"}}
            />

            <Stack.Screen name="phyExpScreen" component={PhyExpScreen} options={{title: "物理实验课查询"}} />
            <Stack.Screen
                name="engTrainingScheduleScreen"
                component={EngTrainingScheduleScreen}
                options={{title: "金工实训查询"}}
            />

            {/*<Stack.Screen*/}
            {/*    name="reschedulingNews"*/}
            {/*    component={RescheduleNotificationScreen}*/}
            {/*    options={{title: "调课信息查询"}}*/}
            {/*/>*/}
            <Stack.Screen name="timeShiftScreen" component={TimeShiftScreen} options={{title: "调休信息查询"}} />
            <Stack.Screen name="HolidayScreen" component={HolidayScreen} options={{title: "假期安排"}} />

            <Stack.Screen name="EvaluationOverview" component={EvaluationOverview} options={{title: "期末学生评价"}} />
            <Stack.Screen name="EvaluationDetail" component={EvaluationDetail} options={{title: "学生评价细节"}} />
            <Stack.Screen name="EvaluationComment" component={EvaluationComment} options={{title: "填写评语"}} />
            <Stack.Screen name="EvaluationTemplate" component={EvaluationTemplate} options={{title: "评价模板"}} />

            <Stack.Screen name="TestPage" component={TestPage} options={{title: "测试页"}} />
            <Stack.Screen name="FullCourseScreen" component={FullCourseScreen} options={{title: "全校实时课表"}} />

            <Stack.Screen name="PositionListScreen" component={BuildingListScreen} options={{title: "地图导航"}} />
            <Stack.Screen name="WidgetPreviewScreen" component={WidgetPreviewScreen} options={{title: "小部件预览"}} />
            <Stack.Screen name="EduRechargeScreen" component={WebViewScreen} options={{title: "校园网充值"}} />
            <Stack.Screen name="TeachBuildingListScreen" component={TeachBuildingListScreen} options={{title: "教学楼平面图"}}/>
            <Stack.Screen name="FloorListScreen"component={FloorlistScreen} options={{title: "楼层列表"}}/>
            <Stack.Screen name="FloorMapScreen"component={FloorMapScreen} options={{title: "楼层平面图"}}/>
        </Stack.Navigator>
    );
}

import React from "react";
import {FlexWidget, TextWidget} from "react-native-android-widget";
import {CourseItem} from "@/widget/CourseItem.tsx";
import moment from "moment/moment";

interface CourseScheduleWidgetProps {
    todayCourse?: {
        name: string;
        beginTime: string;
        endTime: string;
        room: string;
    }[];
    tomorrowCourse?: {
        name: string;
        beginTime: string;
        endTime: string;
        room: string;
    }[];
    lastUpdated?: string;
    theme: "light" | "dark";
}

// 辅助函数，获取周几
const getDayOfWeek = (offset = 0) => {
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return days[date.getDay()];
};

/**
 * @description 课程表小部件
 * @param todayCourse
 * @param tomorrowCourse
 * @param lastUpdated
 * @param theme
 * @constructor
 * @description
 * 状态：
 * - 今日有课：显示今日课表，标题：今天 / 周X；如果多于4节课的，仅展示前4节课，并且提示后面还有几节课
 * - 今日无课，但明日有课，显示明日课表，标题：明日课程预告 / 周X（明天）
 * - 今日无课，明日无课，显示“今明两日无课”，标题：今日 / 周X
 */
export function CourseScheduleWidget({
    todayCourse = [],
    tomorrowCourse = [],
    lastUpdated,
    theme,
}: CourseScheduleWidgetProps) {
    let displayTitle = `今天 / ${getDayOfWeek()}`;
    let coursesToDisplay = [];
    let moreCoursesCount = 0;
    let noCourseMessage = "";

    const isDark = theme === "dark";

    const hasTodayCourse = todayCourse && todayCourse.length > 0;
    const hasTomorrowCourse = tomorrowCourse && tomorrowCourse.length > 0;

    if (hasTodayCourse) {
        // 状态1: 今日有课
        coursesToDisplay = todayCourse.slice(0, 4); // 最多只取前4节课
        if (todayCourse.length > 4) {
            moreCoursesCount = todayCourse.length - 4;
        }
    } else if (hasTomorrowCourse) {
        // 状态2: 今日无课，但明日有课
        displayTitle = `明日课程预告 / ${getDayOfWeek(1)}`;
        coursesToDisplay = tomorrowCourse.slice(0, 4);
        if (tomorrowCourse.length > 4) {
            moreCoursesCount = tomorrowCourse.length - 4;
        }
    } else {
        // 状态3: 今明两日都无课
        noCourseMessage = "今明两日无课";
    }
    // 使用传入的时间戳
    const updatedTime = lastUpdated || moment().format("MM-DD HH:mm");

    return (
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                padding: 16,
                backgroundColor: isDark ? "#2d2d2f" : "#f4f8ff",
                borderRadius: 16,
                flexDirection: "column",
            }}>
            {/* 标题和刷新按钮容器 */}
            <FlexWidget
                style={{
                    width: "match_parent",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}>
                <FlexWidget>
                    <TextWidget
                        text={displayTitle}
                        style={{
                            fontSize: 17,
                            fontWeight: "bold",
                            fontFamily: "Inter-SemiBold",
                            color: isDark ? "#cfcfcf" : "#333333",
                        }}
                    />
                    <TextWidget
                        text={`更新于 ${updatedTime}`}
                        style={{
                            fontSize: 15,
                            fontFamily: "Inter-SemiBold",
                            color: isDark ? "#cfcfcf" : "#333333",
                        }}
                    />
                </FlexWidget>
                <FlexWidget
                    clickAction="REFRESH_SCHEDULE"
                    style={{padding: 4}} // 增加点击区域
                >
                    <TextWidget
                        text="↻" // 刷新图标
                        style={{
                            fontSize: 22,
                            color: isDark ? "#acacac" : "#555555",
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            {/* 课程列表 或 无课提示 */}
            {coursesToDisplay.length > 0 ? (
                <FlexWidget
                    style={{
                        flexDirection: "column",
                        width: "match_parent",
                    }}>
                    {coursesToDisplay.map((item, index) => {
                        return <CourseItem theme={theme} key={index} course={item} />;
                    })}

                    {/* “还有更多课程”的提示 */}
                    {moreCoursesCount > 0 && (
                        <TextWidget
                            text={`...还有 ${moreCoursesCount} 节课`}
                            style={{
                                fontSize: 12,
                                color: isDark ? "#aaaaaa" : "#888888",
                                marginTop: 6,
                            }}
                        />
                    )}
                </FlexWidget>
            ) : (
                // ==========================================================
                // --- 无课时渲染提示信息 ---
                <FlexWidget style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <TextWidget
                        text={noCourseMessage}
                        style={{
                            fontSize: 16,
                            color: isDark ? "#aaaaaa" : "#888888",
                        }}
                    />
                </FlexWidget>
            )}
        </FlexWidget>
    );
}

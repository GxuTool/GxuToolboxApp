import React from "react";
import type {WidgetTaskHandlerProps} from "react-native-android-widget";
import {CourseScheduleWidget} from "./CourseScheduleWidget.tsx";
import {nextCourses} from "@/js/nextCourses.ts";

const nameToWidget = {
    CourseScheduleWidgetProvider: CourseScheduleWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    try {
        console.log(`[widgetTaskHandler] SYNC execution started. Action: ${props.widgetAction}`);

        const widgetInfo = props.widgetInfo;
        const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

        if (!Widget) {
            console.error(`[widgetTaskHandler] Widget component not found for name: ${widgetInfo.widgetName}`);
            return;
        }

        switch (props.widgetAction) {
            case "WIDGET_ADDED":
            case "WIDGET_UPDATE":
            case "WIDGET_RESIZED":
                const {today: initialToday = [], tomorrow: initialTomorrow = []} = (await nextCourses()) ?? {};
                const initialTimestamp = new Date().toLocaleTimeString();
                props.renderWidget({
                    light: (
                        <Widget
                            theme="light"
                            todayCourse={initialToday}
                            tomorrowCourse={initialTomorrow}
                            lastUpdated={initialTimestamp}
                        />
                    ),
                    dark: (
                        <Widget
                            theme="dark"
                            todayCourse={initialToday}
                            tomorrowCourse={initialTomorrow}
                            lastUpdated={initialTimestamp}
                        />
                    ),
                });
                break;

            case "WIDGET_DELETED":
                // Not needed for now
                break;

            case "WIDGET_CLICK":
                if (props.clickAction === "REFRESH_SCHEDULE") {
                    // Fetch fresh data ONLY on refresh click
                    console.log("refresh");
                    const {today = [], tomorrow = []} = (await nextCourses()) ?? {};
                    const refreshTimestamp = new Date().toLocaleTimeString();
                    props.renderWidget({
                        light: (
                            <Widget
                                theme="light"
                                todayCourse={today}
                                tomorrowCourse={tomorrow}
                                lastUpdated={refreshTimestamp}
                            />
                        ),
                        dark: (
                            <Widget
                                theme="dark"
                                todayCourse={today}
                                tomorrowCourse={tomorrow}
                                lastUpdated={refreshTimestamp}
                            />
                        ),
                    });
                }
                break;

            default:
                break;
        }
    } catch (e) {
        // 如果这里崩溃了，说明问题比想象的更严重。
        console.error("[widgetTaskHandler] SYNC function crashed:", e);
    }
}

// import React from "react";
// import type {WidgetTaskHandlerProps} from "react-native-android-widget";
// import {CourseScheduleWidget} from "./CourseScheduleWidget.tsx";
// import {getWidgetData} from "@/widget/widgetData.ts";
// import {store} from "@/js/store.ts";
// import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
//
// const nameToWidget = {
//     CourseScheduleWidgetProvider: CourseScheduleWidget,
// };
//
// export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
//     const widgetInfo = props.widgetInfo;
//     const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
//     const userConfig = await store.load<any>({key: "userConfig"});
//     const courseList = await store.load<CourseScheduleQueryRes>({key: "courseRes"}).catch(e => {
//         console.warn(e);
//         return null;
//     });
//
//     if (1) {
//         // 如果没有数据，可以渲染一个空状态或者错误提示
//         props.renderWidget(<Widget todayCourse={[]} tomorrowCourse={[]} />);
//         return;
//     }
//
//     const {today = [], tomorrow = []} = getWidgetData(courseList, userConfig) ?? {};
//
//     switch (props.widgetAction) {
//         case "WIDGET_ADDED":
//         case "WIDGET_UPDATE":
//             props.renderWidget(<Widget todayCourse={today} tomorrowCourse={tomorrow} />);
//             break;
//
//         case "WIDGET_RESIZED":
//             // Not needed for now
//             break;
//
//         case "WIDGET_DELETED":
//             // Not needed for now
//             break;
//
//         case "WIDGET_CLICK":
//             // Not needed for now
//             break;
//
//         default:
//             break;
//     }
// }

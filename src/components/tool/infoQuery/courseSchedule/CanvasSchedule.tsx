import React, {useEffect, useState} from "react";
import {Dimensions, StyleSheet, View} from "react-native";
import Canvas, {CanvasRenderingContext2D} from "react-native-canvas";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import {CourseScheduleData} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {CourseScheduleClass, CourseClass} from "@/class/jw/course.ts";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {store} from "@/core/store.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {useCourseData} from "@/hooks/useCourseData.ts";
import {useShift} from "@/features/courseSchedule/hooks/detail/useShift.ts";

type Props = {
    week: number;
    canvasRef: React.RefObject<Canvas | null>;
};

export function CanvasSchedule(props: Props) {
    const {theme} = useTheme();
    const {store: ucStore} = useUserConfig();
    const {store: courseDataStore, courseScheduleStyle} = useCourseData();
    const timeSpanHeight = courseDataStore(s => s.theme.timeSpanHeight);
    const courseItemMargin = courseDataStore(s => s.theme.courseItemMargin);
    const timeSpanList = courseDataStore(s => s.timeSpanList);
    const {store: shiftStore, init: initShift} = useShift();
    const timeShift = shiftStore(s => s.shiftRules);

    const [courseSchedule, setCourseSchedule] = useState<CourseScheduleClass>();

    const {width: screenWidth} = Dimensions.get("window");
    const startDay = moment(ucStore(s => s.jw.startDay));
    const currentWeek = props.week;
    const styles = StyleSheet.create({
        container: {
            display: "flex",
            gap: 10,
            alignItems: "center",
        },
        canvas: {
            width: screenWidth * 0.9,
            height:
                timeSpanHeight > 40
                    ? timeSpanHeight * 14 + 49
                    : timeSpanHeight * 2 * 8 + 34,
            backgroundColor: theme.colors.background,
        },
        button: {
            display: "flex",
            flex: 1,
        },
    });

    const stringLineHeight = courseScheduleStyle.timeSpanText.fontSize; //行高
    const canvasCssWidth = styles.canvas.width;
    const spanWidth = (canvasCssWidth - 21) / 8;
    const spanHeight = timeSpanHeight; //一个元素高度

    /**
     * 从内存获取当前周课表
     */
    async function getCoursesData() {
        const courseData = await store.load<CourseScheduleQueryRes>({key: "originalCourseList"}).catch(e => {
            console.warn("内存获取课表失败", e);
            return null;
        });
        if (courseData?.kbList) {
            setCourseSchedule(new CourseScheduleClass(courseData));
        }
    }

    useEffect(() => {
        getCoursesData();
        initShift();
    }, [timeSpanHeight]);

    /**
     * 通用字体样式和画布字体配置
     */
    function fontStyle(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = `${stringLineHeight}px sans-serif`;
        ctx.fillStyle = courseScheduleStyle.timeSpanText.color;
    }

    /**
     * 绘制日期矩形
     */
    function drawDateSchedule(ctx: CanvasRenderingContext2D, course?: CourseScheduleClass) {
        const courseList = course?.getCourseListByWeek(currentWeek); //当前周的课表
        const weekSpanY =
            spanHeight > 40 ? (spanHeight - stringLineHeight * 2) / 2 : (spanHeight * 2 - stringLineHeight * 2) / 2;
        courseList?.forEach((_, index) => {
            const currentDay = startDay.clone().add({
                week: currentWeek - 1,
                day: index,
            });
            const isTimeShift =
                timeShift && timeShift.findIndex(item => moment(item[0], "YYYY-MM-DD").isSame(currentDay, "day")) > -1;
            ctx.fillText(
                `${CourseScheduleData.weekdayList[index]}${isTimeShift ? "(调)" : ""}`,
                (spanWidth / 2) * (2 * (index + 1) + 1) + 3 * (index + 1),
                weekSpanY,
                150,
            );
            ctx.fillText(
                `${currentDay.month() + 1}-${currentDay.date()}`,
                (spanWidth / 2) * (2 * (index + 1) + 1) + 3 * (index + 1),
                weekSpanY + stringLineHeight + 3,
                150,
            );
            ctx.beginPath();
        });
    }

    /**
     * 绘制周数矩形
     * @param ctx
     */
    function drawWeekHeader(ctx: CanvasRenderingContext2D) {
        const weekStringY =
            spanHeight > 40 ? (spanHeight - stringLineHeight) / 2 : (spanHeight * 2 - stringLineHeight) / 2;
        ctx.fillText(`${currentWeek}周`, spanWidth / 2, weekStringY, 150);
    }

    /**
     * 绘制时间段矩形
     * @param ctx
     */
    function drawTimeSpansRects(ctx: CanvasRenderingContext2D) {
        if (spanHeight > 40) {
            timeSpanList.forEach((timeSpan, index) => {
                const spanList = timeSpan.split("\n");
                const timeSpanY = spanHeight * (index + 1) + (spanHeight - stringLineHeight * 3) / 2 + 3 * (index + 1);
                ctx.fillText(String(index + 1), spanWidth / 2, timeSpanY, 150);
                spanList.forEach((time, timeSpanIndex) => {
                    ctx.fillText(time, spanWidth / 2, timeSpanY + stringLineHeight * (timeSpanIndex + 1), 150);
                });
            });
        } else {
            const shortTimeSpanList: [string, string, string][] = Array(
                Math.ceil(timeSpanList.length / 2),
            )
                .fill(0)
                .map((_, index) =>
                    timeSpanList[index * 2 + 1] !== undefined
                        ? [
                              `${index * 2 + 1} - ${index * 2 + 2}`,
                              timeSpanList[index * 2].split("\n")[0],
                              timeSpanList[index * 2 + 1].split("\n")[1],
                          ]
                        : [
                              `${index * 2 + 1}`,
                              timeSpanList[index * 2].split("\n")[0],
                              timeSpanList[index * 2].split("\n")[1],
                          ],
                );
            shortTimeSpanList.forEach((timeSpan, index) => {
                const timeSpanY =
                    spanHeight * 2 * (index + 1) + (spanHeight * 2 - stringLineHeight * 3) / 2 + 3 * (index + 1);
                timeSpan.forEach((time, timeSpanIndex) => {
                    ctx.fillText(time, spanWidth / 2, timeSpanY + stringLineHeight * timeSpanIndex, 140);
                });
            });
        }
    }

    /**
     * 课表课程绘制
     * @param ctx
     * @param course
     */
    function drawCourse(ctx: CanvasRenderingContext2D, course: CourseScheduleClass) {
        const courseList = course?.getCourseListByWeek(currentWeek); //当前周的课表
        const topCourseSpanY = spanHeight > 40 ? spanHeight + 3 : spanHeight * 2 + 3;
        courseList?.forEach((dailyCourseList, index) => {
            dailyCourseList.forEach(item => {
                const classPeriod = item.periodCount.split("-").map(span => +span);
                const radius = 5;
                const span = classPeriod[1] - classPeriod[0] + 1;
                const courseSpanX = spanWidth * (index + 1) + 3 * (index + 1); //矩形左上角x
                const courseSpanY =
                    spanHeight > 40
                        ? topCourseSpanY + spanHeight * (classPeriod[0] - 1) + 3 * (classPeriod[0] - 1) + courseItemMargin
                        : topCourseSpanY +
                          (spanHeight * 2 + 3) * Math.floor((classPeriod[0] - 1) / 2) +
                          courseItemMargin; //上边y
                const courseSpanHeight =
                    spanHeight > 40
                        ? spanHeight * span - courseItemMargin * 2
                        : (spanHeight * 2 + 3) * (Math.floor((classPeriod[1] - 1) / 2) - Math.floor((classPeriod[0] - 1) / 2) + 1) -
                          3 -
                          courseItemMargin * 2;
                ctx.beginPath();
                //左上角起点
                ctx.moveTo(courseSpanX + radius, courseSpanY);
                //上边
                ctx.lineTo(courseSpanX + spanWidth - radius, courseSpanY);
                //右上弧
                ctx.arcTo(courseSpanX + spanWidth, courseSpanY, courseSpanX + spanWidth, courseSpanY + radius, radius);
                //右边
                ctx.lineTo(courseSpanX + spanWidth, courseSpanY + courseSpanHeight - radius);
                //右下弧
                ctx.arcTo(
                    courseSpanX + spanWidth,
                    courseSpanY + courseSpanHeight,
                    courseSpanX + spanWidth - radius,
                    courseSpanY + courseSpanHeight,
                    radius,
                );
                //下边
                ctx.lineTo(courseSpanX + radius, courseSpanY + courseSpanHeight);
                //左下弧
                ctx.arcTo(
                    courseSpanX,
                    courseSpanY + courseSpanHeight,
                    courseSpanX,
                    courseSpanY + courseSpanHeight - radius,
                    radius,
                );
                //左边
                ctx.lineTo(courseSpanX, courseSpanY + radius);
                //左上弧
                ctx.arcTo(courseSpanX, courseSpanY, courseSpanX + radius, courseSpanY, radius);

                ctx.closePath();
                ctx.fillStyle = Color(item.backgroundColor ?? theme.colors.primary).rgbaString;
                ctx.globalAlpha = theme.mode === "light" ? 0.3 : 0.1;
                ctx.fill();

                function crateSpan(text: string): string[] {
                    const list: string[] = [];
                    if (text.includes(",")) {
                        return text.split(","); //可用于包含多个姓名的字符串的分割
                    } else {
                        for (let i = 0; i <= text.length; i += 3) {
                            list.push(text.slice(i, i + 3)); //三个字符一个元素
                        }
                    }
                    if (list[list.length - 1] === "" && list.length > 1) {
                        list.pop();
                    }
                    return list;
                }

                function handleInfo(course: CourseClass): string[] {
                    const locationList = crateSpan(course.venueName);
                    const nameList = crateSpan(course.name);
                    return locationList.concat(nameList);
                }

                const spanList: string[] = crateSpan(item.courseName);
                const infoSpanList: string[] = handleInfo(item);
                const courseSpanList = spanList.concat(infoSpanList);
                const minRows = Math.floor(
                    (courseSpanHeight - courseItemMargin * 2) / stringLineHeight,
                );
                ctx.globalAlpha = 1;
                ctx.fillStyle =
                    theme.mode === "dark"
                        ? Color(item.backgroundColor ?? theme.colors.primary).rgbaString
                        : courseScheduleStyle.timeSpanText.color;
                courseSpanList.forEach((span, spanIndex) => {
                    ctx.fillText(
                        spanIndex < minRows ? span : "",
                        spanWidth * (index + 1) + spanWidth / 2 + 3 * (index + 1),
                        courseSpanY +
                            stringLineHeight * (spanIndex > spanList.length - 1 ? spanIndex + 1 : spanIndex + 0.5),
                        150,
                    );
                });
            });
        });
    }

    const handleCanvas = (canvas: Canvas | null) => {
        props.canvasRef.current = canvas;
    };

    /**
     * 绘制主函数
     */
    const drawSchedule = () => {
        const canvas = props.canvasRef.current;
        if (!canvas) return;
        canvas.width = styles.canvas.width;
        canvas.height = styles.canvas.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = theme.colors.background;
        ctx.fillRect(0, 0, 10000, 10000);
        fontStyle(ctx);
        drawWeekHeader(ctx);
        drawTimeSpansRects(ctx);
        drawDateSchedule(ctx, courseSchedule);
        drawCourse(ctx, courseSchedule!);
    };

    useEffect(() => {
        drawSchedule();
    }, [courseSchedule, timeSpanHeight]);
    return (
        <View style={styles.container}>
            <Canvas ref={handleCanvas} style={styles.canvas} />
        </View>
    );
}

import React, {useContext, useEffect, useState} from "react";
import {Dimensions, StyleSheet,View} from "react-native";
import Canvas, {CanvasRenderingContext2D} from "react-native-canvas";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {CourseScheduleContext, CourseScheduleData} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {CourseScheduleClass} from "@/class/jw/course.ts";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {store} from "@/core/store.ts";
import {http} from "@/core/http.ts";

type Props = {
    week: number,
    canvasRef: React.RefObject<Canvas | null>,
}
export function CanvasSchedule(props: Props) {
    const {theme} = useTheme();
    const {userConfig} = useContext(UserConfigContext);
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const [courseSchedule, setCourseSchedule] = useState<CourseScheduleClass>();
    const [timeShift, setTimeShift] = useState<[string, string][]>([]);

    const {width: screenWidth} = Dimensions.get("window");
    const startDay = moment(userConfig.jw.startDay);
    const currentWeek = props.week;
    const styles = StyleSheet.create({
        container: {
            display: "flex",
            gap: 10,
        },
        canvas: {
            width: screenWidth * 0.9,
            height:
                userConfig.theme.course.timeSpanHeight > 40
                    ? userConfig.theme.course.timeSpanHeight * 14 + 49
                    : userConfig.theme.course.timeSpanHeight * 2 * 8 + 34,
            backgroundColor: theme.colors.background,
        },
        button: {
            display: "flex",
            flex: 1,
        },
    });

    const stringLineHeight = courseScheduleStyle.timeSpanText.fontSize * 1.2;
    const canvasCssWidth = styles.canvas.width;
    const spanWidth = (canvasCssWidth - 21) / 8;
    const spanHeight = userConfig.theme.course.timeSpanHeight;

    /**
     * 从内存获取当前周课表
     */
    async function getCoursesData() {
        const courseData: CourseScheduleQueryRes = await store.load({key: "courseRes"}).catch(e => {
            console.warn("内存获取课表失败", e);
            return {};
        });
        if (courseData.kbList) {
            setCourseSchedule(new CourseScheduleClass(courseData));
        }
    }

    /**
     * 调课信息
     */
    async function getTimeShift() {
        const {data} = await http.get("https://file.unde.site/GxuToolApp/data.json");
        if (data) setTimeShift(data.timeShift);
    }

    useEffect(() => {
        getCoursesData();
        getTimeShift();
    }, [userConfig.theme.course.timeSpanHeight]);

    /**
     * 通用字体样式和画布字体配置
     */
    function fontStyle(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = `${courseScheduleStyle.timeSpanText.fontSize}px sans-serif`;
        ctx.fillStyle =  courseScheduleStyle.timeSpanText.color;
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
            courseScheduleData.timeSpanList.forEach((timeSpan, index) => {
                const spanList = timeSpan.split("\n");
                const timeSpanY = spanHeight * (index + 1) + (spanHeight - stringLineHeight * 3) / 2 + 4 * (index + 1);
                ctx.fillText(String(index + 1), spanWidth / 2, timeSpanY, 150);
                spanList.forEach((time, timeSpanIndex) => {
                    ctx.fillText(time, spanWidth / 2, timeSpanY + stringLineHeight * (timeSpanIndex + 1), 150);
                });
            });
        } else {
            const shortTimeSpanList: [string, string, string][] = Array(
                Math.ceil(courseScheduleData.timeSpanList.length / 2),
            )
                .fill(0)
                .map((_, index) =>
                    courseScheduleData.timeSpanList[index * 2 + 1] !== undefined
                        ? [
                              `${index * 2 + 1} - ${index * 2 + 2}`,
                              courseScheduleData.timeSpanList[index * 2].split("\n")[0],
                              courseScheduleData.timeSpanList[index * 2 + 1].split("\n")[1],
                          ]
                        : [
                              `${index * 2 + 1}`,
                              courseScheduleData.timeSpanList[index * 2].split("\n")[0],
                              courseScheduleData.timeSpanList[index * 2].split("\n")[1],
                          ],
                );
            shortTimeSpanList.forEach((timeSpan, index) => {
                console.log(timeSpan);
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
        const topCourseSpanY = spanHeight > 40 ? spanHeight + 3 : spanHeight * 2 + 4;
        courseList?.forEach((dailyCourseList, index) => {
            dailyCourseList.forEach(item => {
                const classPeriod = item.jcs.split("-").map(span => +span);
                ctx.fillStyle = Color(item.backgroundColor ?? theme.colors.primary).rgbaString;
                ctx.globalAlpha = theme.mode === "light" ? 0.3 : 0.1;
                ctx.fillRect(
                    spanWidth * (index + 1) + 3 * (index + 1),
                    spanHeight > 40
                        ? topCourseSpanY + spanHeight * (classPeriod[0] - 1) + 3 * classPeriod[0]
                        : topCourseSpanY +
                              spanHeight * 2 * Math.floor(classPeriod[0] / 2) +
                              4 * Math.floor(classPeriod[0] / 2),
                    spanWidth,
                    spanHeight > 40
                        ? spanHeight * classPeriod.length + 3 * (classPeriod.length - 1)
                        : spanHeight * 2 * (classPeriod.length / 2) + 4 * (classPeriod.length / 2 - 1),
                );

                function crateSpan(text: string): string[] {
                    const list: string[] = [];
                    for (let i = 0; i <= text.length; i += 3) {
                        list.push(text.slice(i, i + 3));
                    }
                    if (list[list.length - 1] === "" && list.length > 1) {
                        list.pop();
                    }
                    return list;
                }

                const spanList: string[] = crateSpan(item.kcmc);
                const locationSpanList: string[] = crateSpan(item.cdmc);
                ctx.globalAlpha = 1;
                ctx.fillStyle =
                    theme.mode === "dark"
                        ? Color(item.backgroundColor ?? theme.colors.primary).rgbaString
                        : courseScheduleStyle.timeSpanText.color;
                spanList.forEach((span, spanIndex) => {
                    if (spanHeight > 40 && spanIndex < 3) {
                        ctx.fillText(
                            span,
                            spanWidth * (index + 1) + spanWidth / 2 + 3 * (index + 1),
                            topCourseSpanY +
                                spanHeight * (classPeriod[0] - 1) +
                                stringLineHeight * (spanIndex + 0.5) +
                                3 * (classPeriod[0] - 1),
                            150,
                        );
                    } else if (spanHeight <= 40 && spanIndex < 2) {
                        ctx.fillText(
                            span,
                            spanWidth * (index + 1) + spanWidth / 2 + 3 * (index + 1),
                            topCourseSpanY +
                                spanHeight * 2 * Math.floor(classPeriod[0] / 2) +
                                stringLineHeight * (spanIndex + 0.5) +
                                4 * Math.floor(classPeriod[0] / 2),
                            150,
                        );
                    }
                    spanIndex++;
                });
                locationSpanList.forEach((locationSpan, spanIndex) => {
                    if (spanHeight >= 46 && spanIndex < 3) {
                        ctx.fillText(
                            locationSpan,
                            spanWidth * (index + 1) + spanWidth / 2 + 3 * (index + 1),
                            topCourseSpanY +
                                spanHeight * (classPeriod[0] - 1) +
                                stringLineHeight * (spanList.length > 3 ? 3 : spanList.length) +
                                stringLineHeight * (spanIndex + 1) +
                                3 * (classPeriod[0] - 1),
                            150,
                        );
                    }
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
        ctx.fillRect(0,0,10000,10000);
        fontStyle(ctx);
        drawWeekHeader(ctx);
        drawTimeSpansRects(ctx);
        drawDateSchedule(ctx, courseSchedule);
        drawCourse(ctx, courseSchedule!);
    };

    useEffect(() => {
        drawSchedule();
    }, [courseSchedule, userConfig.theme.course.timeSpanHeight]);
    return (
        <View style={styles.container}>
            <Canvas ref={handleCanvas} style={styles.canvas} />
        </View>
    );
}

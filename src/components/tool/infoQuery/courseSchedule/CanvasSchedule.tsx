import React, {useContext, useEffect, useRef, useState} from "react";
import {Dimensions, StyleSheet, ToastAndroid, View} from "react-native";
import Canvas, {CanvasRenderingContext2D} from "react-native-canvas";
import {Color} from "@/js/color.ts";
import {Button, useTheme} from "@rneui/themed";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {CourseScheduleContext, CourseScheduleData} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {CourseScheduleClass} from "@/class/jw/course.ts";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {store} from "@/js/store.ts";
import {http} from "@/js/http.ts";
import {Flex} from "@/components/un-ui";
import RNFS from "react-native-fs";
import Share, {ShareOptions} from "react-native-share";
import {CameraRoll} from "@react-native-camera-roll/camera-roll";

export function CanvasSchedule() {
    const {theme} = useTheme();
    const {userConfig} = useContext(UserConfigContext);
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const [courseSchedule, setCourseSchedule] = useState<CourseScheduleClass>();
    const [timeShift, setTimeShift] = useState<[string, string][]>([]);

    const {width: screenWidth} = Dimensions.get("window");
    const startDay = moment(userConfig.jw.startDay);
    const currentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());
    const styles = StyleSheet.create({
        container: {
            display: "flex",
            gap: 10,
        },
        canvas: {
            width: screenWidth,
            height:
                userConfig.theme.course.timeSpanHeight > 40
                    ? userConfig.theme.course.timeSpanHeight * 14 + 49
                    : userConfig.theme.course.timeSpanHeight * 2 * 8 + 34,
            backgroundColor: Color(theme.mode === "light" ? theme.colors.background : theme.colors.grey5).setAlpha(
                0.1 + ((theme.mode === "light" ? 0.7 : 0.1) * userConfig.theme.bgOpacity) / 100,
            ).rgbaString,
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

    const canvasRef = useRef<Canvas | null>(null);

    const handleCanvas = (canvas: Canvas | null) => {
        canvasRef.current = canvas;
    };

    /**
     * 绘制主函数
     */
    const drawSchedule = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = styles.canvas.width;
        canvas.height = styles.canvas.height;
        const ctx = canvas.getContext("2d");
        fontStyle(ctx);
        drawWeekHeader(ctx);
        drawTimeSpansRects(ctx);
        drawDateSchedule(ctx, courseSchedule);
        drawCourse(ctx, courseSchedule!);
    };

    useEffect(() => {
        drawSchedule();
    }, [courseSchedule, userConfig.theme.course.timeSpanHeight]);

    /**
     * 每次调用生成图片并写入临时目录，返回图片路径
     */
    const getImagePath = async (): Promise<string> => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        const base64 = await canvas.toDataURL();
        const fileName = `week_${currentWeek}_${moment().format("YYYY_MMDD_HHmmss_SSS")}_gxu_tool_app`;
        const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}.png`;
        //把base64字符串解码成二进制
        await RNFS.writeFile(
            filePath,
            base64.replace("data:image/png;base64,", ""),
            "base64"
        );
        return filePath;
    };

    /**
     * 生成png类型图片写入系统相册
     */
    const saveToLocal = async () => {
        try {
            const filePath = await getImagePath();
            await CameraRoll.saveToCameraRoll(filePath, "photo");
            ToastAndroid.show("已保存至相册", ToastAndroid.SHORT);
            await clearDebugImage();
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * 分享图片
     */
    const shareSchedule = async ()=>{
        const filePath = await getImagePath();
        const shareOptions:ShareOptions = {
            url: "file://" + filePath,
            type: "image/png",
            message: "分享课表",
        };
        await Share.open(shareOptions);
        ToastAndroid.show("已发送", ToastAndroid.SHORT);
    };

    /**
     * 清除临时目录的文件，可在调试用
     */
    const clearDebugImage = async ()=>{
        const filePath = await getImagePath();
        try {
            if (await RNFS.exists(filePath)){
                await RNFS.unlink(filePath);
                // ToastAndroid.show("已清除预览图", ToastAndroid.SHORT);
            }
        } catch (e){
            console.log(e);
        }
    };

    return (
        <View style={styles.container}>
            <Canvas ref={handleCanvas} style={styles.canvas} />
            <Flex gap={10} style={{marginHorizontal: 10}}>
                <Button
                    title="保存"
                    onPress={async ()=>{
                        try {
                            await saveToLocal();
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                    containerStyle={
                        styles.button
                    }
                />
                <Button
                    title="分享课表"
                    onPress={async ()=>{
                        try {
                            await shareSchedule();
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                    containerStyle={
                        styles.button
                    }
                />
            </Flex>
            <Flex style={{marginHorizontal: 10}}>
                <Button
                    title="刷新"
                    onPress={async ()=>{
                        try {
                            await getCoursesData();
                            ToastAndroid.show("刷新成功",ToastAndroid.SHORT);
                        } catch (e){
                            console.log(e);
                        }
                    }}
                    containerStyle={{
                        flex: 1,
                    }}
                />
            </Flex>
        </View>
    );
}

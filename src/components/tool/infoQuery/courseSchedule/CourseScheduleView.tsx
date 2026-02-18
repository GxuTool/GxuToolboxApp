import React, {ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {BottomSheet, Text, useTheme} from "@rneui/themed";
import {
    CourseScheduleTable,
    CourseScheduleTableProps,
} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {usePagerView} from "react-native-pager-view";
import moment from "moment/moment";
import {Course} from "@/type/infoQuery/course/course.ts";
import {CourseDetail} from "@/components/tool/infoQuery/courseSchedule/CourseDetail.tsx";
import {Color} from "@/shared/color.ts";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {CourseScheduleClass} from "@/class/jw/course.ts";
import {nextCourses} from "@/js/nextCourses.ts";
import {useUserConfig} from "@/hooks/app.ts";
import {UnCard} from "@/components/un-ui";

export interface CourseScheduleViewProps<T> extends CourseScheduleTableProps<T> {
    /** 横向滚动使用的PageView对象 */
    pageView: ReturnType<typeof usePagerView>;
    /** 进行解析的课表返回体 */
    courseSchedule?: CourseScheduleClass;
    /** 计算下一节课的回调 */
    onNextCourseCalculated?: (course?: Course) => void;

    /** 是否显示下一节课 */
    showNextCourse?: boolean;

    /** 自定义元素详情渲染函数 */
    itemDetailRender?: (item: T) => ReactNode;
}

export function CourseScheduleView<T = any>(props: CourseScheduleViewProps<T>) {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();
    const {AnimatedPagerView, ref, ...rest} = props.pageView;
    const startDay = props.startDay ?? userConfig.jw.startDay;
    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());
    const {courseScheduleData} = useContext(CourseScheduleContext)!;

    const [courseDetailVisible, setCourseDetailVisible] = useState(false);
    const [activeCourse, setActiveCourse] = useState<Course>({} as Course);

    const style = StyleSheet.create({
        pagerView: {
            width: "100%",
            height:
                userConfig.theme.course.timeSpanHeight * (userConfig.theme.course.timeSpanHeight <= 40 ? 14 : 13) +
                userConfig.theme.course.weekdayHeight +
                50,
        },
        bottomSheetContainer: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
            borderWidth: 1,
            padding: "2.5%",
        },
        nextCourse: {
            alignItems: "center",
            paddingVertical: 8,
            marginHorizontal: 8,
        },
    });

    function showCourseDetail(course: Course) {
        setActiveCourse(course);
        setCourseDetailVisible(true);
        props.onCoursePress?.(course);
    }

    const [itemDetailVisible, setItemDetailVisible] = useState(false);
    const [activeItem, setActiveItem] = useState<T>({} as T);

    function showItemDetail(item: T) {
        setActiveItem(item);
        setItemDetailVisible(true);
        props.onItemPress?.(item);
    }

    const isCurrentTerm = moment().isBetween(
        userConfig.jw.startDay,
        moment(userConfig.jw.startDay).add(20, "w"),
        "d",
        "[]",
    );

    // 计算下一节课
    const [nextCourse, setNextCourse] = useState<any>(null);
    useEffect(() => {
        nextCourses().then(res => {
            if (res?.next) {
                setNextCourse(res.next);
            }
        });
    }, [props.courseSchedule?.kbList, courseScheduleData.timeSpanList, userConfig.jw.startDay]);

    return (
        <View style={{width: "100%"}}>
            {nextCourse && props.showNextCourse && (
                <UnCard style={style.nextCourse}>
                    <Text style={{fontSize: 13}}>
                        下一节：{nextCourse.name} #{nextCourse.room}
                    </Text>
                </UnCard>
            )}
            <AnimatedPagerView
                ref={ref}
                style={style.pagerView}
                initialPage={realCurrentWeek - 1}
                layoutDirection="ltr"
                overdrag={rest.overdragEnabled}
                scrollEnabled={rest.scrollEnabled}
                pageMargin={10}
                onPageSelected={rest.onPageSelected}
                onPageScrollStateChanged={rest.onPageScrollStateChanged}
                offscreenPageLimit={2}
                overScrollMode="never"
                orientation="horizontal">
                {useMemo(
                    () =>
                        rest.pages.map((_, index) => (
                            <View key={index} collapsable={false}>
                                <CourseScheduleTable<T>
                                    {...props}
                                    onCoursePress={showCourseDetail}
                                    currentWeek={index + 1}
                                    onItemPress={showItemDetail}
                                />
                            </View>
                        )),
                    [rest.pages, realCurrentWeek, props.courseSchedule?.kbList, props.phyExpList],
                )}
            </AnimatedPagerView>
            {/* 课表课程信息 */}
            <BottomSheet isVisible={courseDetailVisible} onBackdropPress={() => setCourseDetailVisible(false)}>
                <View style={style.bottomSheetContainer}>
                    <CourseDetail course={activeCourse} />
                </View>
            </BottomSheet>
            {/* 自定义元素详情 */}
            <BottomSheet isVisible={itemDetailVisible} onBackdropPress={() => setItemDetailVisible(false)}>
                <View style={style.bottomSheetContainer}>{props.itemDetailRender?.(activeItem)}</View>
            </BottomSheet>
        </View>
    );
}

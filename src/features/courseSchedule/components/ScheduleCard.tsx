import {BottomSheet, Divider, Text, useTheme} from "@rneui/themed";
import {StyleSheet, View} from "react-native";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import moment from "moment";
import {SchoolTermValue} from "@/type/global.ts";
import {Color} from "@/shared/color.ts";
import {usePagerView} from "react-native-pager-view";
import {CourseCardSetting} from "@/components/tool/infoQuery/courseSchedule/CourseCardSetting.tsx";
import {useNavigation} from "@react-navigation/native";
import {ScheduleShareSheet} from "@/components/tool/infoQuery/courseSchedule/ScheduleShareSheet.tsx";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {UnJsonEditor, UnPressable, UnText} from "@/components/un-ui";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {ScheduleTableItem, TimeScheduleItemData} from "@/features/courseSchedule/type/schedule.ts";
import {useCourse} from "@/features/courseSchedule/hooks/detail/useCourse.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import {useExam} from "@/features/courseSchedule/hooks/detail/useExam.ts";
import {useNextCourse} from "@/features/courseSchedule/hooks/detail/useNextCourse.ts";
import {usePractice} from "@/features/courseSchedule/hooks/detail/usePractice.ts";
import {PracticalCourseList} from "@/features/courseSchedule/components/PracticalCourseList.tsx";
import {CourseDetail} from "@/features/courseSchedule/components/CourseDetail.tsx";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useHoliday} from "@/features/courseSchedule/hooks/detail/useHoliday.ts";
import {defaultItems} from "@/features/courseSchedule/utils/defaultItems.ts";
import {useJwAuth} from "@/core/auth/Jw/hooks/useJwAuth.ts";
import {AuthStatusSection} from "@/features/courseSchedule/components/AuthStatusSection.tsx";
import {useUnifiedAuth} from "@/core/auth/unified/hook/useUnifiedAuth.ts";
import {useAttendanceAuth} from "@/core/auth/attendance/hooks/useAttendanceAuth.ts";
import {NewCourseItem} from "@/features/courseSchedule/components/NewCourseItem.tsx";
import {NewExamItem} from "@/features/courseSchedule/components/NewExamItem.tsx";
import {HolidayItem} from "@/features/courseSchedule/components/HolidayItem.tsx";
import {Course} from "@/type/infoQuery/course/course.ts";
import {CourseClass} from "@/class/jw/course.ts";
import {StackCourseItem} from "@/features/courseSchedule/components/StackCourseItem.tsx";
import {useConflictCourseStore} from "@/features/courseSchedule/stores/useConflictCourseStore.ts";
import {ConflictCourseList} from "@/features/courseSchedule/components/ConflictCourseList.tsx";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import {ExamInfoClass} from "@/class/jw/exam.ts";
import {ExamDetail} from "@/components/tool/infoQuery/examInfo/ExamDetail.tsx";

// 菜单的类型
type SheetState =
    | {type: "closed"}
    | {type: "menu"}
    | {type: "setting"}
    | {type: "share"}
    | {type: "itemDetail"; item: ScheduleTableItem; day: moment.Moment}
    | {type: "courseConflict"; courses: CourseClass[]; day: moment.Moment};

/**
 * 课表
 * @constructor
 */
export function ScheduleCard() {
    const {store: ucStore} = useUserConfig();
    const devMode = ucStore(s => s.devMode);
    const navigation = useNavigation();
    const {theme} = useTheme();
    const pagerView = usePagerView({pagesAmount: 20});
    const {...rest} = pagerView;

    const {store: conflictStore} = useConflictCourseStore();

    const {init: initPhyExp, patchItem, patchCourse} = usePhyExp();

    const {authState: JWauthState} = useJwAuth();
    const {authState: unifiedAuthState} = useUnifiedAuth();
    const {authState: attendanceAuthState} = useAttendanceAuth();

    const [year, setYear] = useState(+ucStore(s => s.jw.year));
    const [term, setTerm] = useState<SchoolTermValue>(ucStore(s => s.jw.term));
    const startDay = useStartDay(year, term);

    const {items: courseItems = [], refresh: refreshCourse} = useCourse(year, term);
    const {store: examStore, init: initExam} = useExam();
    const examItems = examStore(s => s.examList) || [];
    const holidayItems = useHoliday(year, term) ?? [];
    const {items: practiceItems = [], refresh: refreshPractice} = usePractice(year, term);

    useEffect(() => {
        initExam(year, term, startDay);
        initPhyExp();
    }, [year, term]);

    const defaultItem: ScheduleTableItem[] = useMemo(
        () => (JWauthState.status !== "no_account" ? [] : defaultItems),
        [JWauthState.status],
    );

    const rawItems: ScheduleTableItem[] = useMemo(
        () => [...courseItems, ...examItems, ...holidayItems, ...defaultItem],
        [courseItems, examItems, holidayItems, defaultItem],
    );
    const nextCourse = useNextCourse(rawItems, startDay);

    const [sheet, setSheet] = useState<SheetState>({type: "closed"});

    const onItemPress = useCallback(
        (item: ScheduleTableItem, day: moment.Moment) => setSheet({type: "itemDetail", item, day}),
        [],
    );

    const scheduleItems: TimeScheduleItemData[] = useMemo(
        () =>
            [
                {
                    data: courseItems,
                    itemRender: (item, day) => (
                        <NewCourseItem item={patchItem(item, day)} onPress={() => onItemPress(item, day)} />
                    ),
                    isItemStack: (a, b) => a.begin <= b.end && b.begin <= a.end,
                    stackRender: (items, day, _week, timeRange) => {
                        const courses = items.map(i => patchCourse(new CourseClass(i.raw), day)).filter(Boolean);
                        if (courses.length === 0) return null;
                        const courseClasses = courses;
                        const courseCodes = courseClasses.map(c => c.transformed.courseCode).sort();
                        const storedActive = conflictStore.getState().getActive(courseCodes);
                        const activeCourse = storedActive ?? courseClasses[0]?.transformed.courseCode;
                        return (
                            <StackCourseItem
                                course={courseClasses}
                                activeCourse={activeCourse}
                                timeRange={timeRange}
                                onPress={c => setSheet({type: "courseConflict", courses: c, day})}
                            />
                        );
                    },
                } as TimeScheduleItemData<ScheduleTableItem<Course>>,
                {
                    data: examItems,
                    itemRender: (item, day) => <NewExamItem item={item} onPress={() => onItemPress(item, day)} />,
                } as TimeScheduleItemData<ScheduleTableItem<ExamInfo>>,
                {
                    data: holidayItems,
                    needShift: false,
                    itemRender: (item, day) => <HolidayItem item={item} onPress={() => onItemPress(item, day)} />,
                },
                {
                    data: defaultItem,
                    itemRender: (item, day) => <NewCourseItem item={item} onPress={() => onItemPress(item, day)} />,
                },
            ]
                .filter(td => td.data.length > 0)
                .map(td => ({
                    ...td,
                    isItemShow: (item: ScheduleTableItem, day: moment.Moment, week: number) => {
                        return item.week === week && item.day === day.isoWeekday();
                    },
                })),
        [courseItems, examItems, holidayItems, defaultItem, onItemPress],
    );
    useEffect(() => {
        console.log("refreshed");
    }, [scheduleItems]);

    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refreshCourse(), initExam(year, term, startDay)]);
        } finally {
            setRefreshing(false);
        }
    }, [refreshCourse, initExam, year, term, startDay]);

    const baseColor = theme.colors.primary;
    const backgroundColor = Color(baseColor).setAlpha(theme.mode === "light" ? 0.3 : 0.1).rgbaString;
    const textColor = Color.mix(baseColor, theme.colors.black, 0.5).rgbaString;

    const style = useMemo(
        () =>
            StyleSheet.create({
                bottomSheetContainer: {
                    backgroundColor: theme.colors.background,
                    padding: "5%",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
                    borderWidth: 1,
                },
                cardTitle: {
                    paddingHorizontal: 12,
                },
                menuItem: {
                    flexDirection: "row",
                    gap: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    alignItems: "center",
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.greyOutline,
                },
                nextCourse: {
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginHorizontal: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: backgroundColor,
                },
            }),
        [theme],
    );

    return (
        <View>
            <Flex justify="space-between" style={style.cardTitle}>
                <Flex direction="row" align="center" gap={8}>
                    <Text h4>日程表</Text>
                    <UnPressable
                        onPress={function () {
                            return setSheet({type: "menu"});
                        }}
                        style={{flexDirection: "row", alignItems: "center", gap: 8}}>
                        {[JWauthState, unifiedAuthState, attendanceAuthState].map((i, idx) =>
                            i?.status !== "authenticated" ? (
                                <Icon
                                    key={idx}
                                    name="account-network-off-outline"
                                    size={24}
                                    color={theme.colors.error}
                                />
                            ) : (
                                <Icon key={idx} name="account-network-outline" size={24} color={theme.colors.success} />
                            ),
                        )}
                    </UnPressable>
                </Flex>
                <Flex gap={15} justify="flex-end">
                    <UnPressable onPress={handleRefresh} disabled={refreshing}>
                        <Icon
                            name={refreshing ? "loading" : "refresh"}
                            size={24}
                            style={refreshing ? {opacity: 0.5} : undefined}
                        />
                    </UnPressable>
                    {rest.activePage + 1 !== realCurrentWeek && (
                        <UnPressable
                            onPress={function () {
                                return rest.setPage(realCurrentWeek - 1);
                            }}>
                            <Icon name="history" size={24} />
                        </UnPressable>
                    )}
                    <UnPressable
                        onPress={function () {
                            return setSheet({type: "menu"});
                        }}>
                        <Icon name="menu" size={24} />
                    </UnPressable>
                </Flex>
            </Flex>
            <Divider />
            {nextCourse !== null ? (
                <View style={style.nextCourse}>
                    <Text style={{fontSize: 18, color: textColor}}>
                        下一节课：{nextCourse.item.title}
                        {nextCourse.item.location ? ` · ${nextCourse.item.location}` : ""}
                    </Text>
                </View>
            ) : (
                <View style={style.nextCourse}>
                    <Text style={{fontSize: 18, color: textColor}}>下一节课：高等数学{` · 6A-102`}（示例）</Text>
                </View>
            )}
            <TimeScheduleView
                showDate
                showTimeSpanHighlight
                showDayHighlight
                startDay={startDay}
                pageView={pagerView}
                scheduleItems={scheduleItems}
            />
            <Divider />
            <PracticalCourseList courseList={practiceItems} />
            {devMode && (
                <Flex gap={8} style={{paddingHorizontal: 12}} direction="column">
                    <ScheduleDataDebugCard label="查看课程数据" data={rawItems} />
                    <ScheduleDataDebugCard label="查看实践课数据" data={practiceItems} />
                </Flex>
            )}
            <BottomSheet isVisible={sheet.type !== "closed"} onBackdropPress={() => setSheet({type: "closed"})}>
                <View style={style.bottomSheetContainer}>
                    {sheet.type === "menu" && (
                        <>
                            <AuthStatusSection
                                jwAuth={JWauthState}
                                unifiedAuth={unifiedAuthState}
                                attendanceAuth={attendanceAuthState}
                                menuItemStyle={style.menuItem}
                            />
                            <UnPressable
                                onPress={function () {
                                    setSheet({type: "closed"});
                                    navigation.navigate("ScheduleEdit");
                                }}>
                                <View style={style.menuItem}>
                                    <Icon name="table-edit" size={22} />
                                    <UnText>事件编辑</UnText>
                                </View>
                            </UnPressable>
                            <UnPressable
                                onPress={function () {
                                    return setSheet({type: "share"});
                                }}>
                                <View style={style.menuItem}>
                                    <Icon type="antdesign" name="share-alt" size={22} />
                                    <UnText>分享课表</UnText>
                                </View>
                            </UnPressable>
                            <UnPressable
                                onPress={function () {
                                    return setSheet({type: "setting"});
                                }}>
                                <View style={style.menuItem}>
                                    <Icon name="cog" size={22} />
                                    <UnText>课表设置</UnText>
                                </View>
                            </UnPressable>
                        </>
                    )}
                    {sheet.type === "setting" && (
                        <CourseCardSetting
                            year={year}
                            term={term}
                            pageViewRest={rest}
                            onYearChange={setYear}
                            onTermChange={setTerm}
                        />
                    )}
                    {sheet.type === "itemDetail" && sheet.item.kind === "exam" && sheet.item.raw && (
                        <ExamDetail examInfo={new ExamInfoClass(sheet.item.raw as ExamInfo)} />
                    )}
                    {sheet.type === "itemDetail" &&
                        sheet.item?.raw &&
                        sheet.item.kind !== "exam" &&
                        (() => {
                            const course = patchCourse(new CourseClass(sheet.item.raw), sheet.day);
                            const courseName = course.transformed.courseName;
                            const matchedExam = examItems
                                .filter(e => e.raw?.kcmc === courseName)
                                ?.map(e => new ExamInfoClass(e.raw as ExamInfo));
                            return <CourseDetail course={course} examInfo={matchedExam} />;
                        })()}
                    {sheet.type === "share" && (
                        <ScheduleShareSheet week={rest.activePage + 1} onClose={() => setSheet({type: "closed"})} />
                    )}
                    {sheet.type === "courseConflict" &&
                        (() => {
                            const courseCodes = sheet.courses.map(x => x.transformed.courseCode).sort();
                            const storedActive = conflictStore.getState().getActive(courseCodes);
                            const activeCourseCode = storedActive ?? sheet.courses[0]?.transformed.courseCode;
                            return (
                                <ConflictCourseList
                                    courses={sheet.courses}
                                    activeCourseCode={activeCourseCode}
                                    onSelect={course => {
                                        conflictStore.getState().setActive(courseCodes, course.transformed.courseCode);
                                        setSheet({type: "closed"});
                                    }}
                                    onPressActiveCourse={course => {
                                        setSheet({
                                            type: "itemDetail",
                                            day: sheet.day,
                                            item: {
                                                id: course.transformed.courseCode,
                                                week: 0,
                                                day: 1 as ScheduleTableItem["day"],
                                                begin: 1 as ScheduleTableItem["begin"],
                                                end: 1 as ScheduleTableItem["begin"],
                                                title: course.transformed.courseName,
                                                location: course.transformed.venueName,
                                                teacher: course.transformed.name,
                                                raw: course,
                                            },
                                        });
                                    }}
                                />
                            );
                        })()}
                </View>
            </BottomSheet>
        </View>
    );
}

function ScheduleDataDebugCard({label, data}: {label: string; data: any}) {
    const {theme} = useTheme();
    const [modalOpen, setModalOpen] = useState(false);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(theme.colors.error).setAlpha(theme.mode === "light" ? 0.5 : 0.3).rgbaString,
        },
    });
    return (
        <Flex>
            <UnPressable onPress={() => setModalOpen(true)}>
                <Flex style={styles.card} justify="flex-start" gap={4}>
                    <Icon name="console" size={16} inline />
                    <UnText weight="bold" size={16}>
                        {label}
                    </UnText>
                </Flex>
            </UnPressable>
            <UnJsonEditor.Modal readOnly visible={modalOpen} onClose={() => setModalOpen(false)} value={data} />
        </Flex>
    );
}

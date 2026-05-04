import {BottomSheet, Divider, Text, useTheme} from "@rneui/themed";
import {Pressable, StyleSheet, View} from "react-native";
import React, {useCallback, useMemo, useState} from "react";
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
import {UnText} from "@/components/un-ui";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {ScheduleTableItem, TimeScheduleItemData} from "@/features/courseSchedule/type/schedule.ts";
import {useCourse} from "@/features/courseSchedule/hooks/detail/useCourse.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import {useExam} from "@/features/courseSchedule/hooks/detail/useExam.ts";
import {useNextCourse} from "@/features/courseSchedule/hooks/detail/useNextCourse.ts";
import {usePractice} from "@/features/courseSchedule/hooks/detail/usePractice.ts";
import {PracticalCourseList} from "@/features/courseSchedule/components/PracticalCourseList.tsx";
import {CourseDetail} from "@/features/courseSchedule/components/CourseDetail.tsx";
import {useHoliday} from "@/features/courseSchedule/hooks/detail/useHoliday.ts";
import {defaultItems} from "@/features/courseSchedule/utils/defaultItems.ts";
import {useJwAuth} from "@/core/auth/Jw/hooks/useJwAuth.ts";
import {AuthStatusSection} from "@/features/courseSchedule/components/AuthStatusSection.tsx";
import {useUnifiedAuth} from "@/core/auth/unified/hook/useUnifiedAuth.ts";
import {useAttendanceAuth} from "@/core/auth/attendance/hooks/useAttendanceAuth.ts";
import {NewCourseItem} from "@/features/courseSchedule/components/NewCourseItem.tsx";
import {NewExamItem} from "@/features/courseSchedule/components/NewExamItem.tsx";
import {HolidayItem} from "@/features/courseSchedule/components/HolidayItem.tsx";

// 菜单的类型
type SheetState =
    | {type: "closed"}
    | {type: "menu"}
    | {type: "setting"}
    | {type: "share"}
    | {type: "itemDetail"; item: ScheduleTableItem};

/**
 * 课表
 * @constructor
 */
export function ScheduleCard() {
    const {store: ucStore} = useUserConfig();
    const navigation = useNavigation();
    const {theme} = useTheme();
    const pagerView = usePagerView({pagesAmount: 20});
    const {...rest} = pagerView;

    const {authState: JWauthState} = useJwAuth();
    const {authState: unifiedAuthState} = useUnifiedAuth();
    const {authState: attendanceAuthState} = useAttendanceAuth();

    const [year, setYear] = useState(+ucStore(s => s.jw.year));
    const [term, setTerm] = useState<SchoolTermValue>(ucStore(s => s.jw.term));
    const ripple = ucStore(s => s.theme.ripple);
    const startDay = useStartDay(year, term);

    const {items: courseItems = [], refresh: refreshCourse} = useCourse(year, term);
    const {items: examItems = [], refresh: refreshExam} = useExam(year, term);
    const holidayItems = useHoliday(year, term) ?? [];
    const {items: practiceItems = [], refresh: refreshPractice} = usePractice(year, term);

    let defaultItem: ScheduleTableItem[] = JWauthState.status !== "no_account" ? [] : defaultItems;

    const rawItems: ScheduleTableItem[] = useMemo(
        () => [...courseItems, ...examItems, ...holidayItems, ...defaultItem],
        [courseItems, examItems, holidayItems, defaultItem],
    );
    const nextCourse = useNextCourse(rawItems, startDay);

    const scheduleItems: TimeScheduleItemData[] = useMemo(
        () => [
            {data: courseItems, itemRender: (item, onPress) => <NewCourseItem item={item} onPress={onPress} />},
            {data: examItems, itemRender: (item, onPress) => <NewExamItem item={item} onPress={onPress} />},
            {data: holidayItems, itemRender: (item) => <HolidayItem item={item} />},
            {data: defaultItem, itemRender: (item, onPress) => <NewCourseItem item={item} onPress={onPress} />},
        ].filter(td => td.data.length > 0),
        [courseItems, examItems, holidayItems, defaultItem],
    );

    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());

    const [sheet, setSheet] = useState<SheetState>({type: "closed"});

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refreshCourse(), refreshExam()]);
        } finally {
            setRefreshing(false);
        }
    }, [refreshCourse, refreshExam]);

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

    const onItemPress = useCallback(
        (item: ScheduleTableItem) => setSheet({type: "itemDetail", item}),
        [], // setSheet 是稳定引用
    );

    return (
        <View>
            <Flex justify="space-between" style={style.cardTitle}>
                <Flex direction="row" align="center" gap={8}>
                    <Text h4>日程表</Text>
                    <Pressable
                        android_ripple={ucStore(s => s.theme.ripple)}
                        onPress={() => setSheet({type: "menu"})}
                        style={{flexDirection: "row", alignItems: "center", gap: 8}}>
                        {[JWauthState, unifiedAuthState, attendanceAuthState].map(i =>
                            i?.status !== "authenticated" ? (
                                <Icon name="account-network-off-outline" size={24} color={theme.colors.error} />
                            ) : (
                                <Icon name="account-network-outline" size={24} color={theme.colors.success} />
                            ),
                        )}
                    </Pressable>
                </Flex>
                <Flex gap={15} justify="flex-end">
                    <Pressable onPress={handleRefresh} disabled={refreshing}>
                        <Icon
                            name={refreshing ? "loading" : "refresh"}
                            size={24}
                            style={refreshing ? {opacity: 0.5} : undefined}
                        />
                    </Pressable>
                    {rest.activePage + 1 !== realCurrentWeek && (
                        <Pressable android_ripple={ripple} onPress={() => rest.setPage(realCurrentWeek - 1)}>
                            <Icon name="history" size={24} />
                        </Pressable>
                    )}
                    <Pressable android_ripple={ripple} onPress={() => setSheet({type: "menu"})}>
                        <Icon name="menu" size={24} />
                    </Pressable>
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
                onItemPress={onItemPress}
            />
            <Divider />
            <PracticalCourseList courseList={practiceItems} />
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
                            <Pressable
                                onPress={() => {
                                    setSheet({type: "closed"});
                                    navigation.navigate("ScheduleEdit");
                                }}>
                                <View style={style.menuItem}>
                                    <Icon name="table-edit" size={22} />
                                    <UnText>事件编辑</UnText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => setSheet({type: "share"})}>
                                <View style={style.menuItem}>
                                    <Icon type="antdesign" name="share-alt" size={22} />
                                    <UnText>分享课表</UnText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => setSheet({type: "setting"})}>
                                <View style={style.menuItem}>
                                    <Icon name="cog" size={22} />
                                    <UnText>课表设置</UnText>
                                </View>
                            </Pressable>
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
                    {sheet.type === "itemDetail" && sheet.item?.raw && <CourseDetail course={sheet.item.raw} />}
                    {sheet.type === "share" && (
                        <ScheduleShareSheet week={rest.activePage + 1} onClose={() => setSheet({type: "closed"})} />
                    )}
                </View>
            </BottomSheet>
        </View>
    );
}

import React, {useContext} from "react";
import {Pressable, StyleProp, View, ViewStyle} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {SchoolTermValue, SchoolYearValue} from "@/type/global.ts";
import {usePagerView} from "react-native-pager-view";
import {UnDateTimePicker} from "@/components/un-ui/UnDateTimePicker.tsx";
import moment from "moment/moment";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useUserConfig} from "@/hooks/app.ts";
import {useCourse} from "@/hooks/useCourse.ts";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";
import {ColorPalettes, PaletteName} from "@/features/courseSchedule/utils/colorPalette.ts";
import {Color} from "@/shared/color.ts";

interface Props {
    containerStyle?: StyleProp<ViewStyle>;
    year?: SchoolYearValue | number;
    term?: SchoolTermValue;
    onYearChange?: (year: number) => void;
    onTermChange?: (term: SchoolTermValue) => void;
    onPageChange?: (page: number) => void;
    pageViewRest: Omit<ReturnType<typeof usePagerView>, "AnimatedPagerView" | "ref">;
}

export function CourseCardSetting(props: Props) {
    const {theme} = useTheme();

    const {userConfig, updateUserConfig} = useUserConfig();
    const {store} = useCourse();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const {courseScheduleData, updateCourseScheduleData} = useContext(CourseScheduleContext)!;

    const infoVisibleOptions: Record<keyof typeof courseScheduleData.courseInfoVisible, string> = {
        name: "课程名称",
        position: "上课地点",
        teacher: "教师名称",
    };
    const changeCourseInfoVisible = (key: keyof typeof courseScheduleData.courseInfoVisible, v: boolean) => {
        const newCourseInfoVisible = {...courseScheduleData.courseInfoVisible};
        newCourseInfoVisible[key] = v;
        updateCourseScheduleData({
            ...courseScheduleData,
            courseInfoVisible: newCourseInfoVisible,
        });
    };

    const onYearChange = (v: number) => {
        userConfig.jw.year = (v + "") as SchoolYearValue;
        updateUserConfig(userConfig);
        props.onYearChange?.(v);
    };

    const onTermChange = (v: SchoolTermValue) => {
        userConfig.jw.term = v;
        updateUserConfig(userConfig);
        props.onTermChange?.(v);
    };

    const {getColor, setCustomColor, paletteName} = useBlocksColor();

    return (
        <View style={props.containerStyle}>
            {/* ── 显示内容 ── */}
            <Text style={{fontSize: 13, color: theme.colors.grey3, marginBottom: 4}}>显示内容</Text>
            <View style={{flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16}}>
                {(Object.keys(infoVisibleOptions) as (keyof typeof infoVisibleOptions)[]).map(key => {
                    const active = courseScheduleData.courseInfoVisible[key];
                    return (
                        <Pressable
                            key={key}
                            onPress={() => changeCourseInfoVisible(key, !active)}
                            style={{
                                paddingVertical: 6,
                                paddingHorizontal: 14,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: active ? theme.colors.primary : theme.colors.greyOutline,
                                backgroundColor: active
                                    ? Color(theme.colors.primary).setAlpha(0.1).rgbaString
                                    : "transparent",
                            }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: active ? theme.colors.primary : theme.colors.grey2,
                                }}>
                                {infoVisibleOptions[key]}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* ── 课程元素高度 ── */}
            <Flex justify="space-between" style={{marginBottom: 4}}>
                <Text style={{fontSize: 13, color: theme.colors.grey3}}>课程元素高度</Text>
                <Text style={{fontSize: 13, color: theme.colors.grey1}}>{timeSpanHeight}</Text>
            </Flex>
            <View style={{marginBottom: 16}}>
                <UnSlider
                    step={1}
                    minimumValue={5}
                    maximumValue={100}
                    allowTouchTrack
                    value={timeSpanHeight}
                    onValueChange={v => {
                        store.getState().update("theme", { ...store.getState().theme, timeSpanHeight: v });
                    }}
                />
            </View>

            {/* ── 学期设置 ── */}
            <Text style={{fontSize: 13, color: theme.colors.grey3, marginBottom: 4}}>学期设置</Text>
            <View style={{marginBottom: 16}}>
                <Flex gap={10} style={{marginBottom: 8}}>
                    <Text>学期</Text>
                    <View style={{flex: 1}}>
                        <UnTermSelector
                            thirdTerm
                            disableSelectAll
                            skipAndroidStatusBar
                            year={props.year}
                            term={props.term}
                            onChange={(year, term) => {
                                onYearChange(+year);
                                onTermChange(term);
                            }}
                        />
                    </View>
                </Flex>
                <Flex gap={10}>
                    <Text>起始日</Text>
                    <Flex justify="flex-end">
                        <UnDateTimePicker
                            value={moment(userConfig.jw.startDay).valueOf()}
                            onChange={v => {
                                const startDay = moment(v).format("YYYY-MM-DD");
                                updateCourseScheduleData({...courseScheduleData, startDay});
                                userConfig.jw.startDay = startDay;
                                updateUserConfig(userConfig);
                            }}
                            mode="single"
                            onlyDate
                        />
                    </Flex>
                </Flex>
            </View>

            {/* ── 课表周数 ── */}
            <Flex justify="space-between" style={{marginBottom: 4}}>
                <Text style={{fontSize: 13, color: theme.colors.grey3}}>当前周数</Text>
                <Text style={{fontSize: 13, color: theme.colors.grey1}}>第 {props.pageViewRest.activePage + 1} 周</Text>
            </Flex>
            <View style={{marginBottom: 16}}>
                <UnSlider
                    step={1}
                    minimumValue={1}
                    maximumValue={20}
                    allowTouchTrack
                    value={props.pageViewRest.activePage + 1}
                    onValueChange={v => props.pageViewRest.setPage(v - 1)}
                />
            </View>

            {/* ── 配色风格 ── */}
            <Text style={{fontSize: 13, color: theme.colors.grey3, marginBottom: 4}}>配色风格</Text>
            <View style={{flexDirection: "row", flexWrap: "wrap", gap: 10}}>
                {(Object.keys(ColorPalettes) as PaletteName[]).map(name => {
                    const isActive = name === paletteName;
                    const label: Record<PaletteName, string> = {
                        default: "经典",
                        macaron: "马卡龙",
                        morandi: "莫兰迪",
                        vivid: "鲜明",
                    };
                    return (
                        <Pressable
                            key={name}
                            onPress={() => {
                                store.getState().update("theme", { ...store.getState().theme, palette: name });
                            }}
                            style={{
                                flex: 1,
                                minWidth: "45%",
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: isActive ? 2 : 1,
                                borderColor: isActive ? theme.colors.primary : theme.colors.greyOutline,
                                backgroundColor: isActive
                                    ? Color(theme.colors.primary).setAlpha(0.08).rgbaString
                                    : "transparent",
                            }}>
                            <Text
                                style={{
                                    fontWeight: isActive ? "bold" : "normal",
                                    marginBottom: 6,
                                    color: isActive ? theme.colors.primary : theme.colors.grey0,
                                }}>
                                {label[name]}
                            </Text>
                            <View style={{flexDirection: "row", gap: 4, flexWrap: "wrap"}}>
                                {ColorPalettes[name].slice(0, 20).map((c, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 8,
                                            backgroundColor: c,
                                        }}
                                    />
                                ))}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

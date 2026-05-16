import React, {useMemo} from "react";
import {StyleSheet, View} from "react-native";
import {TimeSchedule, TimeScheduleProps} from "@/components/tool/infoQuery/courseSchedule/TimeSchedule.tsx";
import {usePagerView} from "react-native-pager-view";
import moment from "moment/moment";
import {useCourse} from "@/hooks/useCourse.ts";
import {buildColorMap, PaletteName} from "@/features/courseSchedule/utils/colorPalette.ts";
import {ColorMapContext} from "@/features/courseSchedule/hooks/useBlocksColor.ts";

export interface TimeScheduleViewProps extends TimeScheduleProps {
    pageView: ReturnType<typeof usePagerView>;
}

export function TimeScheduleView(props: TimeScheduleViewProps) {
    const {store} = useCourse();
    const {AnimatedPagerView, ref, ...rest} = props.pageView;
    const startDay = props.startDay ?? moment();
    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());

    const paletteName = (store(s => s.theme.palette) as PaletteName) || "macaron";
    const customColors = store(s => s.theme.customColors) || {};
    const flatItems = useMemo(
        () => (props.scheduleItems ?? []).flatMap(td => td.data),
        [props.scheduleItems],
    );
    const colorMap = useMemo(
        () => buildColorMap(flatItems, paletteName, customColors),
        [flatItems, paletteName, customColors],
    );

    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const style = useMemo(
        () =>
            StyleSheet.create({
                pagerView: {
                    width: "100%",
                    height:
                        timeSpanHeight * (timeSpanHeight <= 40 ? 14 : 13) +
                        weekdayHeight +
                        50,
                },
            }),
        [timeSpanHeight, weekdayHeight],
    );

    return (
        <ColorMapContext.Provider value={colorMap}>
            <View style={{width: "100%"}}>
                <AnimatedPagerView
                    ref={ref}
                    style={style.pagerView}
                    initialPage={realCurrentWeek - 1}
                    layoutDirection="ltr"
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
                                    <TimeSchedule {...props} currentWeek={index + 1} />
                                </View>
                            )),
                        [rest.pages.length, props.scheduleItems, props.startDay, props.onItemPress],
                    )}
                </AnimatedPagerView>
            </View>
        </ColorMapContext.Provider>
    );
}

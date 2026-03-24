import React, {useMemo} from "react";
import {StyleSheet, View} from "react-native";
import {useTheme} from "@rneui/themed";
import {TimeSchedule, TimeScheduleProps} from "@/components/tool/infoQuery/courseSchedule/TimeSchedule.tsx";
import {usePagerView} from "react-native-pager-view";
import moment from "moment/moment";
import {Color} from "@/shared/color.ts";
import {useUserConfig} from "@/hooks/app.ts";

export interface TimeScheduleViewProps extends TimeScheduleProps {
    /** 横向滚动使用的PageView对象 */
    pageView: ReturnType<typeof usePagerView>;
}

export function TimeScheduleView(props: TimeScheduleViewProps) {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const {AnimatedPagerView, ref, ...rest} = props.pageView;
    const startDay = props.startDay ?? moment();
    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());

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
    });

    return (
        <View style={{width: "100%"}}>
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
                                <TimeSchedule {...props} currentWeek={index + 1} itemList={props.itemList} />
                            </View>
                        )),
                    [rest.pages, realCurrentWeek, props.itemList, props],
                )}
            </AnimatedPagerView>
        </View>
    );
}

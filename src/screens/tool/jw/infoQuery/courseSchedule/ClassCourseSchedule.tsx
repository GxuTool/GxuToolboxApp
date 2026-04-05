import React from "react";
import {ActivityIndicator, ScrollView, StyleSheet, View} from "react-native";
import {Button, Card, Divider, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {Schools} from "@/type/global.ts";
import {usePagerView} from "react-native-pager-view";
import {PracticalCourseList} from "@/features/courseSchedule/components/PracticalCourseList.tsx";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {Picker} from "@react-native-picker/picker";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useSchoolTerm} from "@/hooks/jw.ts";
import {useWebView} from "@/hooks/app.ts";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {useFilter} from "@/features/classCourseSchedule/hooks/useFilter.ts";
import {useClassScheduleData} from "@/features/classCourseSchedule/hooks/useClassScheduleData.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";

export function ClassCourseSchedule() {
    const {openInJw} = useWebView();
    const {theme} = useTheme();

    const {
        school,
        changeSchool,
        subject,
        grade,
        classId,
        setClassId,
        classList,
        subjectList,
        changeGrade,
        changeSubject,
    } = useFilter();

    const pageView = usePagerView({pagesAmount: 20});
    const {year, term, setBoth} = useSchoolTerm();
    const {list, index, fetchList, theorySchedule, practicalSchedule, loading, fetchSchedule, setIndex} =
        useClassScheduleData(year, term, school, subject, grade, classId);

    const startDay = useStartDay(+year, term);

    return (
        <ScrollView>
            <View style={style.container}>
                <Text h4>查询参数</Text>
                <Flex gap={10} direction="column" align="flex-start">
                    <Flex gap={10}>
                        <Text style={style.label}>学期</Text>
                        <View style={{flex: 1}}>
                            <UnTermSelector year={year} term={term} onChange={setBoth} disableSelectAll />
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text style={style.label}>学院</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={school} onValueChange={changeSchool}>
                                {[["", "全部"], ...Schools].map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text style={style.label}>专业</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={subject} onValueChange={changeSubject}>
                                {[["", "全部"]].concat(subjectList ?? []).map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text style={style.label}>年级</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={grade} onValueChange={changeGrade}>
                                {[["", "全部"], ...Array(25).fill(0)].map((v, index, ori) => {
                                    if (v === 0) {
                                        const optionV = 2003 + (ori.length - index);
                                        return <Picker.Item value={optionV} label={optionV + ""} key={optionV} />;
                                    } else {
                                        return <Picker.Item value={v[0]} label={v[1]} key={v[0]} />;
                                    }
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text style={style.label}>班级</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={classId} onValueChange={setClassId}>
                                {[["", "全部"]].concat(classList ?? []).map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Button
                            containerStyle={{flex: 1}}
                            onPress={() => fetchList(year, term, school, subject, grade, classId)}>
                            查询课表
                        </Button>
                        <Button
                            onPress={() => openInJw("/kbdy/bjkbdy_cxBjkbdyIndex.html?gnmkdm=N214505&layout=default")}>
                            前往教务查询
                        </Button>
                    </Flex>
                </Flex>
                <Divider />
                <Text h4>课表查询结果</Text>
                {loading && <ActivityIndicator animating={loading} />}
                <Flex gap={10} direction="column" align="flex-start">
                    <Flex>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={index} onValueChange={setIndex}>
                                {[...list].map((value, index) => {
                                    return <Picker.Item value={index} label={value.tjkbmc} key={value.id} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <View style={{width: "100%"}}>
                        <Button onPress={() => fetchSchedule()}>查看课表</Button>
                    </View>
                </Flex>
                <Divider />
                {theorySchedule && (
                    <>
                        <Text h4>课表预览</Text>
                        <Divider />
                        <Text>课表周数</Text>
                        <Flex style={{padding: 10}}>
                            <UnSlider
                                step={1}
                                minimumValue={1}
                                maximumValue={20}
                                allowTouchTrack
                                value={pageView.activePage + 1}
                                onValueChange={v => pageView.setPage(v - 1)}
                            />
                        </Flex>
                        <TimeScheduleView startDay={startDay} pageView={pageView} scheduleItems={theorySchedule} />
                        {practicalSchedule && (
                            <>
                                <Card.Divider />
                                <PracticalCourseList courseList={practicalSchedule} />
                            </>
                        )}
                    </>
                )}
            </View>
            {/*<BottomSheet isVisible={itemDetailShow} onBackdropPress={() => setItemDetailShow(false)}>*/}
            {/*    <View*/}
            {/*        style={{*/}
            {/*            backgroundColor: theme.colors.background,*/}
            {/*            borderTopLeftRadius: 8,*/}
            {/*            borderTopRightRadius: 8,*/}
            {/*            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,*/}
            {/*            borderWidth: 1,*/}
            {/*            padding: "2.5%",*/}
            {/*        }}>*/}
            {/*        <CourseDetail course={itemDetail} />*/}
            {/*    </View>*/}
            {/*</BottomSheet>*/}
        </ScrollView>
    );
}

const style = StyleSheet.create({
    container: {padding: "5%"},
    label: {textAlign: "right"},
});

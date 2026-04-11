import {ScrollView, StyleSheet, Text, View} from "react-native";
import moment from "moment";
import {usePagerView} from "react-native-pager-view";
import {Button, Divider} from "@rneui/themed";
import React from "react";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {useFilter} from "@/features/classCourseSchedule/hooks/useFilter.ts";
import Flex from "../components/un-ui/Flex.tsx";
import {UnTermSelector} from "@/components/un-ui";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {Schools} from "@/type/global.ts";
import {Picker} from "@react-native-picker/picker";
import {useSchoolTerm} from "@/hooks/jw.ts";
import {useClassScheduleData} from "@/features/classCourseSchedule/hooks/useClassScheduleData.ts";

type DemoItem = {
    kind: "holiday";
    id: string;
    week: number;
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    title: string;
    detail?: string;
    color?: string;
};

export function TestPage() {
    const pageView = usePagerView({pagesAmount: 20});
    const startDay = moment("2026-03-02");

    const {year, term, setBoth} = useSchoolTerm();

    // const course = useCourse(2025, 12);
    // const examSchedule = useExam(2025, 12);

    // async function init() {
    //     const res = await axios.post(
    //         "https://gxutool.unde.site/api/atd/mirror",
    //         {
    //             id: 1,
    //             method: "GET",
    //             target: `https://yktuipweb.gxu.edu.cn/api/account/getVerify?num=${Date.now()}`,
    //             params: {},
    //             data: {},
    //             responseType: "arraybuffer"
    //         },
    //         {headers: {"Content-Type": "application/json"}},
    //     );
    //     if (res.data.msg === "代理成功") {
    //         const dataUri = `data:image/jpeg;base64,${res.data.data}`;
    //         setUri(dataUri);
    //     }
    //     http.post("https://gxutool.unde.site/api/atd/captcha", {image_base64: uri})
    //         .then(res2 => {
    //             if (res2.data.data?.code) {
    //                 console.log(res2.data.data.code);
    //             }
    //         })
    //         .catch(() => {});
    // }

    //
    // //从存储中读取数据
    // useEffect(() => {
    //     init();
    // }, []);

    const {
        userInfo,
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

    const {list, index, fetchList, scheduleRes, fetchSchedule, setIndex} = useClassScheduleData(
        year,
        term,
        school,
        subject,
        grade,
        classId,
    );

    const scheduleItems: ScheduleTableItem[] = [
        {
            id: "h1",
            week: 2,
            day: 7,
            begin: 1,
            end: 13,
            title: "清明节",
            subtitle: "放假",
            kind: "holiday",
        },
        {
            id: "h1",
            week: 2,
            day: 6,
            begin: 1,
            end: 13,
            title: "清明节",
            subtitle: "放假",
            kind: "holiday",
        },
    ];
    // const all = [...scheduleItems, ...(course || []), ...(examSchedule || [])];
    const pagerView = usePagerView({pagesAmount: 20});
    return (
        <ScrollView contentContainerStyle={{paddingVertical: 8}}>
            <Flex gap={10} direction="column" align="flex-start">
                <Flex gap={10}>
                    <Text>学期</Text>
                    <View style={{flex: 1}}>
                        <UnTermSelector year={year} term={term} onChange={setBoth} disableSelectAll />
                    </View>
                </Flex>
                <Flex gap={10}>
                    <Text>学院</Text>
                    <View style={{flex: 1}}>
                        <UnPicker selectedValue={school} onValueChange={changeSchool}>
                            {[["", "全部"], ...Schools].map(value => {
                                return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                            })}
                        </UnPicker>
                    </View>
                </Flex>
                <Flex gap={10}>
                    <Text>专业</Text>
                    <View style={{flex: 1}}>
                        <UnPicker selectedValue={subject} onValueChange={changeSubject}>
                            {[["", "全部"]].concat(subjectList ?? []).map(value => {
                                return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                            })}
                        </UnPicker>
                    </View>
                </Flex>
                <Flex gap={10}>
                    <Text>年级</Text>
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
                    <Text>班级</Text>
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
                    {/*<Button*/}
                    {/*    onPress={() => openInJw("/kbdy/bjkbdy_cxBjkbdyIndex.html?gnmkdm=N214505&layout=default")}>*/}
                    {/*    前往教务查询*/}
                    {/*</Button>*/}
                </Flex>
            </Flex>
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
            {/*<Text>{JSON.stringify({list}, null, 2)}</Text>*/}
            <TimeScheduleView startDay={startDay} pageView={pagerView} scheduleItems={scheduleRes} />
            <Divider />
            {/*<PracticalCourseList courseList={practiceItems} />*/}
        </ScrollView>
    );
}

const style = StyleSheet.create({
    container: {
        padding: "5%",
    },
    title: {
        textAlign: "center",
    },
    note: {
        marginVertical: 20,
        textAlign: "center",
        color: "gray",
        fontSize: 14,
    },
    captchaImage: {
        width: 95,
        height: 25,
        borderRadius: 4,
    },
    showPwdIcon: {
        paddingHorizontal: 5,
        cursor: "pointer",
    },
    input: {
        height: 70,
    },
    image: {
        width: 95,
        height: 25,
    },
});

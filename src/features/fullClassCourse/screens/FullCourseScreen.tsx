import {ActivityIndicator, SectionList, StyleSheet, View} from "react-native";
import {useEffect, useMemo, useState} from "react";
import {Schools, SchoolTermValue} from "@/type/global.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {useClassScheduleData} from "@/features/classCourseSchedule/hooks/useClassScheduleData.ts";
import {Button, Divider, Text} from "@rneui/themed";
import {IClassList} from "@/features/classCourseSchedule/type/schema/classList.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import moment from "moment";
import {useCourseData} from "@/hooks/useCourseData.ts";

type ClassItem = IClassList[number];
type SchoolType = (typeof Schools)[number];
const DAY_CN = ["", "一", "二", "三", "四", "五", "六", "日"];

interface TimeProps {
    week: number;
    day: number;
    classIndex: number;
}

function ClassCard({item, time, onCount}: {item: ClassItem; time: TimeProps; onCount: () => void}) {
    const {fetchSchedule, theorySchedule} = useClassScheduleData();

    const course = theorySchedule?.find(i => {
        return i.week === time.week && i.day === time.day && i.begin <= time.classIndex && i.end >= time.classIndex;
    });

    useEffect(() => {
        fetchSchedule(item);
    }, [item]);

    useEffect(() => {
        if (course) onCount();
    }, [course]);
    return (
        course && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{course.title}</Text>
                <Text style={styles.cardSub}>{course.location}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                    {course.teacher}
                </Text>
                <View style={{flex: 1}} />
                <Text style={styles.cardClassName}>
                    {item.className} · {item.studentCount}人
                </Text>
            </View>
        )
    );
}

function MajorSection({
    majorName,
    classes,
    time,
    onSchoolCount,
}: {
    majorName: string;
    classes: ClassItem[];
    time: TimeProps;
    onSchoolCount: () => void;
}) {
    const [count, setCount] = useState<number>(0);
    const onCount = () => {
        setCount(prev => prev + 1);
        onSchoolCount();
    };
    return (
        <View style={styles.majorBlock}>
            {count !== 0 && (
                <Text style={styles.majorName}>
                    {majorName}（{count}）
                </Text>
            )}
            <View style={styles.classGrid}>
                {classes.map(item => (
                    <ClassCard key={item.classId} item={item} time={time} onCount={onCount} />
                ))}
            </View>
        </View>
    );
}

function SchoolHeader({school}: {school: SchoolType}) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.schoolName}>{school[1]}</Text>
        </View>
    );
}

function SchoolContent({
    school,
    year,
    term,
    time,
}: {
    school: SchoolType;
    year: number;
    term: SchoolTermValue;
    time: TimeProps;
}) {
    const {fetchList, list, loading, trafficBytes} = useClassScheduleData();

    const [totalCount, setTotalCount] = useState<number>(0);
    const onSchoolCount = () => setTotalCount(prev => prev + 1);

    const byMajor = list.reduce<Record<string, ClassItem[]>>((acc, item) => {
        (acc[item.majorName] ??= []).push(item);
        return acc;
    }, {});

    return (
        <View style={styles.schoolBlock}>
            <View style={styles.contentHeaderRow}>
                {list.length > 0 && (
                    <Text style={{fontSize: 13, color: "#666", marginRight: 6}}>
                        {totalCount}/{list.length}
                    </Text>
                )}
                {trafficBytes > 0 && (
                    <Text style={{fontSize: 11, color: "#999", marginRight: 6}}>
                        {(trafficBytes / 1024).toFixed(1)} KB
                    </Text>
                )}
                <Button title="获取数据" size="sm" onPress={() => fetchList(year, term, school[0], "", "", "")} />
            </View>
            {loading && <ActivityIndicator style={{marginVertical: 6}} />}
            {!loading &&
                Object.entries(byMajor).map(([majorName, classes]) => (
                    <MajorSection
                        key={majorName}
                        majorName={majorName}
                        classes={classes}
                        time={time}
                        onSchoolCount={onSchoolCount}
                    />
                ))}
            <Divider style={{marginTop: 8}} />
        </View>
    );
}

type Section = {school: SchoolType; data: [SchoolType]};

export const FullCourseScreen = () => {
    const {store} = useUserConfig();
    const [year] = useState(+store(s => s.jw.year));
    const [term] = useState<SchoolTermValue>(store(s => s.jw.term));
    const [currentTime] = useState(moment().format());
    const startDay = useStartDay(year, term);

    const week = moment().diff(startDay, "week") + 1;
    const day = moment().isoWeekday();

    const {store: courseStore} = useCourseData();
    const timeSpanList = courseStore(s => s.timeSpanList);

    function getCurrentTimeSpan() {
        let res = -1;
        timeSpanList.forEach((timeSpan, index, list) => {
            const start = index > 0 ? list[index - 1].split("\n")[1] : "00:00";
            const end = timeSpan.split("\n")[1];
            const startTime = moment(start, "hh:mm");
            const endTime = moment(end, "hh:mm");
            if (moment(currentTime).isBetween(startTime, endTime, undefined, "[]")) {
                res = index;
                return;
            }
        });
        return res > -1 ? res : null;
    }

    const classIndex = getCurrentTimeSpan() + 1;
    const time: TimeProps = {week, day, classIndex};

    const sections: Section[] = useMemo(
        () => Schools.filter(i => i[1].includes("学院")).map(s => ({school: s, data: [s]})),
        [],
    );

    return (
        <View style={{flex: 1}}>
            <View style={styles.timeHeader}>
                <Text style={styles.timeWeek}>
                    第 <Text style={styles.timeNum}>{week}</Text> 周
                </Text>
                <Text style={styles.timeDot}>·</Text>
                <Text style={styles.timeWeekday}>
                    星期<Text style={styles.timeNum}>{DAY_CN[day]}</Text>
                </Text>
                <Text style={styles.timeDot}>·</Text>
                <Text style={styles.timeWeekday}>
                    第<Text style={styles.timeNum}>{classIndex}</Text>节课
                </Text>
            </View>
            <SectionList
                sections={sections}
                stickySectionHeadersEnabled
                renderSectionHeader={({section}) => <SchoolHeader school={section.school} />}
                renderItem={({item}) => <SchoolContent school={item} year={year} term={term} time={time} />}
                keyExtractor={item => item[0]}
                contentContainerStyle={{paddingVertical: 8}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
    },
    schoolBlock: {paddingHorizontal: 12, paddingTop: 6},
    contentHeaderRow: {flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 8},
    schoolName: {fontSize: 18, fontWeight: "700"},
    majorBlock: {marginBottom: 10},
    majorName: {fontSize: 16, color: "#444", fontWeight: "600", marginBottom: 8, paddingLeft: 2},
    classGrid: {flexDirection: "row", flexWrap: "wrap", gap: 8},
    card: {
        width: "31%",
        backgroundColor: "#e8eaf0",
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        justifyContent: "space-between",
    },
    cardTitle: {fontSize: 16, fontWeight: "700", color: "#111", lineHeight: 20},
    cardSub: {fontSize: 14, color: "#666", lineHeight: 18, marginTop: 2},
    cardClassName: {fontSize: 13, color: "#999", marginTop: 8},
    empty: {fontSize: 14, color: "#888", paddingVertical: 4},
    timeHeader: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
        paddingVertical: 12,
        gap: 8,
    },
    timeWeek: {fontSize: 16, color: "#555"},
    timeWeekday: {fontSize: 16, color: "#555"},
    timeDot: {fontSize: 16, color: "#bbb"},
    timeNum: {fontSize: 22, fontWeight: "700", color: "#111"},
});

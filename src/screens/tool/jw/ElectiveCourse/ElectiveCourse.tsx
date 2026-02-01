import {useEffect, useMemo, useState} from "react";
import {electiveAPI} from "@/features/courseSelectionList/api";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Flex, Icon} from "@/components/un-ui";
import {useTheme} from "@rneui/themed";

interface Course {
    kcmc: string; // 课程名称
    kcfl: string; // 课程分类
    kcgsmc: string; // 课程归属
    kclbmc: string; // 课程类别名称
    kcxzmc: string;
    jsmc: string;
    xf: string; // 学分
}

// 派生出的统计数据结构
interface ElectiveStats {
    totalScore: number;
    offlineScore: number;
    hasLeadModule: boolean;
    hasEntModule: boolean;
    artScore: number;
    specialModulesCount: number;
    humanScore: number;
    naturalScore: number;
    remainingRequired: string[];
    isQualified: boolean; // 最终结论
}

export default function ElectiveCourse() {
    const {theme} = useTheme();
    // 唯一的数据源状态
    const [courses, setCourses] = useState<Course[]>([]);

    // 初始化加载数据
    useEffect(() => {
        const init = async () => {
            const res = await electiveAPI.getCourses();
            const slimCourses = res.items
                .filter((i: any) => i.kklxmc === "通识选修课")
                .map((i: any) => ({
                    kcmc: i.kcmc,
                    kcfl: i.kcfl,
                    kcgsmc: i.kcgsmc,
                    kclbmc: i.kclbmc,
                    kcxzmc: i.kcxzmc,
                    jsmc: i.jsmc,
                    xf: i.xf,
                }));
            setCourses(slimCourses);
        };
        init();
    }, []);

    const styles = useMemo(() => style(theme), []);

    // 使用 useMemo 进行派生计算，只有当 courses 变化时才重新执行
    const stats: ElectiveStats = useMemo(() => {
        const requiredCourses = new Set(["创业基础", "中文写作实训", "逻辑与批判性思维训练", "中华民族共同体概论"]);

        const result = courses.reduce(
            (acc, course) => {
                const score = Number(course.xf) || 0;
                acc.totalScore += score;
                if (course.jsmc !== "网络教师") {
                    acc.offlineScore += score;
                }

                if (course.kcxzmc?.includes("领军") || course.kcxzmc?.includes("伦理")) acc.hasLeadModule = true;
                if (course.kcxzmc?.includes("创业")) acc.hasEntModule = true;
                if (course.kcxzmc?.includes("艺术")) acc.artScore += score;
                if (course.kcxzmc?.includes("东盟")) acc.hasAseanModule = true;
                if (course.kcxzmc?.includes("民族")) acc.hasEthnicModule = true;
                if (course.kcxzmc?.includes("海洋")) acc.hasOceanModule = true;

                // // 假设是理工农医专业，需要人文社科
                // if (course.kclbmc === "人文社科") acc.humanScore += score;
                // // 假设是文科专业，需要自然科学
                // if (course.kclbmc === "自然科学") acc.naturalScore += score;

                // 从必修列表中移除已修课程
                if (requiredCourses.has(course.kcmc)) {
                    requiredCourses.delete(course.kcmc);
                }
                return acc;
            },
            {
                totalScore: 0,
                offlineScore: 0,
                hasLeadModule: false,
                hasEntModule: false,
                artScore: 0,
                hasAseanModule: false,
                hasEthnicModule: false,
                hasOceanModule: false,
                specialModulesCount: 0,
                humanScore: 0,
                naturalScore: 0,
            },
        );

        const specialModulesCount =
            (result.hasAseanModule ? 1 : 0) + (result.hasEthnicModule ? 1 : 0) + (result.hasOceanModule ? 1 : 0);

        // 毕业要求判断逻辑
        const isQualified =
            result.totalScore >= 10 &&
            result.offlineScore >= 2 &&
            result.hasLeadModule &&
            result.hasEntModule &&
            result.artScore >= 2 &&
            specialModulesCount >= 2 &&
            requiredCourses.size === 0;

        return {
            ...result,
            remainingRequired: Array.from(requiredCourses),
            isQualified,
            specialModulesCount,
        };
    }, [courses]);

    const StatItem = ({label, value, passed}: {label: string; value: string | number; passed: boolean}) => (
        <View style={styles.statItem}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, passed ? styles.textSuccess : styles.textDanger]}>{value}</Text>
        </View>
    );
    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Flex>
                    <Text style={styles.title}>非 2025 级校选课毕业要求</Text>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "判断标准",
                                "关于通识选修课，累计应修学分不少于10学分，其" +
                                    "中领军、创新创业模块至少应各修1门课程，公共艺术课" +
                                    "程模块至少修读2学分，其余东盟、民族、海洋模块至少" +
                                    "选择其中2个模块修读，理工农医类学生修读人文社科类" +
                                    "课程不少于2学分，文科类学生修读自然科学类课程不少" +
                                    "于2学分。《创业基础》《中文写作实训》《逻辑与批判" +
                                    "性思维》《中华民族共同体概论》及公共艺术课程模块" +
                                    "为每生必修。其中《创业基础》属于创业模块，《中文" +
                                    "写作实训》《逻辑与批判性思维训练》属于领军模块，" +
                                    "《中华民族共同体概论》属于民族模块。线下课程修读" +
                                    "学分须≥5学分。",
                            );
                        }}
                        style={{paddingHorizontal: 10}}>
                        <Icon name={"head-question-outline"} size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "形式化地",
                                "所修的通识选修课，必须满足以下全部条件，方为合格：\n" +
                                    "首先，学生累计所修通识选修课的学分，总共不得少于十个学分。\n" +
                                    "其次，在领军类课程模块中，学生必须至少修读一门课程；在创新创业类课程模块中，也必须至少修读一门课程。\n" +
                                    "再次，在公共艺术课程模块中，学生必须修满至少两个学分。\n" +
                                    "然后，在东盟、民族、海洋这三个模块中，学生必须至少选择其中两个模块，并在所选模块中修读课程，无论学分多少，必须每个所选模块至少有一门课程的成绩记录。\n" +
                                    "此外，若学生属于理工农医类专业，则必须在人文社科类通识选修课程中，至少修满两个学分；若学生属于文科类专业，则必须在自然科学类通识选修课程中，至少修满两个学分。\n" +
                                    "还有以下五门课程为每位学生必须修读的：《创业基础》、《中文写作实训》、《逻辑与批判性思维训练》、《中华民族共同体概论》，以及公共艺术课程模块中的课程。其中，《创业基础》归属于创新创业模块；《中文写作实训》与《逻辑与批判性思维训练》归属于领军模块；《中华民族共同体概论》归属于民族模块。这些课程即使已满足模块要求，也不得免修。\n" +
                                    "最后，学生所修通识选修课中，通过线下教学方式完成的课程，其学分总和必须达到或超过五个学分。线上课程学分可计入总学分，但不可用于满足本项线下学分要求。\n" +
                                    "只有同时满足以上所有条件，学生的通识选修课修读结果才被视为符合培养方案规定。",
                            );
                        }}>
                        <Icon name={"lightbulb-alert-outline"} size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </Flex>
                <View style={styles.divider} />

                <StatItem
                    label="总学分 (要求: 10)"
                    value={`${stats.totalScore} / 10 `}
                    passed={stats.totalScore >= 10}
                />
                <StatItem
                    label="线下学分 (要求: 5)"
                    value={`${stats.offlineScore} / 5 `}
                    passed={stats.offlineScore >= 5}
                />
                <StatItem
                    label="公共艺术学分 (要求: 2)"
                    value={`${stats.artScore} / 2 `}
                    passed={stats.artScore >= 2}
                />
                <StatItem
                    label="领军模块"
                    value={stats.hasLeadModule ? "已完成" : "未完成"}
                    passed={stats.hasLeadModule}
                />
                <StatItem
                    label="创业模块"
                    value={stats.hasEntModule ? "已完成" : "未完成"}
                    passed={stats.hasEntModule}
                />

                <StatItem
                    label="东盟、海洋、民族（要求: 三选二)"
                    value={`${stats.specialModulesCount} / 2 `}
                    passed={stats.specialModulesCount >= 2}
                />

                <View style={styles.divider} />

                <Text style={styles.subtitle}>待完成必修课</Text>
                {stats.remainingRequired.length > 0 ? (
                    stats.remainingRequired.map(course => (
                        <Text key={course} style={styles.requiredItem}>
                            - {course}
                        </Text>
                    ))
                ) : (
                    <Text style={[styles.requiredItem, styles.textSuccess]}>全部完成</Text>
                )}

                <View style={styles.divider} />

                <View style={styles.conclusion}>
                    <Text style={styles.conclusionText}>毕业资格</Text>
                    <Text style={[styles.conclusionStatus, stats.isQualified ? styles.textSuccess : styles.textDanger]}>
                        {stats.isQualified ? "达标" : "不达标"}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>已选课程列表</Text>
                <View style={styles.divider} />
                {courses.map((c, index) => (
                    <Text key={index} style={styles.courseItem}>
                        {c.kcmc} {c.xf}学分 {"\n"} —— {c.kcxzmc}
                    </Text>
                ))}
            </View>
        </ScrollView>
    );
}

const style = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
            padding: 10,
        },
        card: {
            backgroundColor: theme.backgroundColor,
            padding: 16,
            marginBottom: 16,
        },
        title: {
            fontSize: 20,
            color: theme.colors.primary,
            paddingRight: 20,
        },
        subtitle: {
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.primary,
            marginTop: 8,
            marginBottom: 4,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.primary,
            marginVertical: 12,
        },
        statItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 6,
        },
        statLabel: {
            fontSize: 15,
            color: theme.colors.black,
        },
        statValue: {
            fontSize: 15,
            fontWeight: "bold",
        },
        requiredItem: {
            fontSize: 14,
            color: "#d9534f",
            marginLeft: 10,
            lineHeight: 22,
        },
        courseItem: {
            fontSize: 14,
            color: "#666",
            paddingVertical: 4,
        },
        conclusion: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
        },
        conclusionText: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.colors.primary,
        },
        conclusionStatus: {
            fontSize: 16,
            fontWeight: "bold",
        },
        textSuccess: {
            color: "#5cb85c", // 绿色
        },
        textDanger: {
            color: "#d9534f", // 红色
        },
    });

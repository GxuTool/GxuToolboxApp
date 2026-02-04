import {useEffect, useMemo, useState} from "react";
import {electiveAPI} from "@/features/electiveStrategy/api";
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from "react-native";
import {Flex} from "@/components/un-ui";
import {useTheme} from "@rneui/themed";
import {CourseList} from "@/features/electiveStrategy/api/schema.ts";
import {getStrategy} from "@/features/electiveStrategy/utils";
import {StatItem} from "@/features/electiveStrategy/component/StatItem.tsx";
import {jwxt} from "@/js/jw/jwxt.ts";
import {userMgr} from "@/js/mgr/user.ts";

export default function ElectiveStrategy() {
    const {theme} = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 唯一的数据源
    const [courses, setCourses] = useState<CourseList[]>([]);
    const [userGrade, setUserGrade] = useState<number>(2025);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError(null);

                // 并行获取课程和用户信息
                const coursePromise = electiveAPI.getCourses().then(r =>
                    r!.items.filter((i: any) => i.selectionType === "通识选修课")
                );
                const infoPromise = jwxt.getInfo();

                const [fetchedCourses, userInfo] = await Promise.all([coursePromise, infoPromise]);

                setCourses(fetchedCourses);

                if (userInfo && userInfo.grade) {
                    setUserGrade(userInfo.grade);
                } else {
                    setUserGrade(2025);
                }

            } catch (e) {
                setError("数据加载失败，请稍后重试。");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const styles = useMemo(() => style(theme), []);
    const strategy = useMemo(() => getStrategy(userGrade), [userGrade]);
    const stats = useMemo(() => strategy!.calculate(courses), [courses, strategy]);

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return <View style={styles.centered}><Text>{error}</Text></View>;
    }

    if (!strategy || !stats) {
        return <View style={styles.centered}><Text>无法确定培养方案。</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Flex>
                    <Text style={styles.title}>{strategy.name}</Text>
                </Flex>
                <View style={styles.divider} />
                {strategy.ui.requirements.map(req => (
                    <StatItem key={req.key} label={req.label} value={req.format(stats)} passed={req.passed(stats)} />
                ))}

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
                        {c.courseName} {c.credit}学分 {"\n"} —— {c.system}
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
        centered: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
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

import React, {useState} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {Color} from "@/js/color.ts";
import {ExamScore} from "@/type/infoQuery/exam/examScore.ts";
import {infoQuery} from "@/js/jw/infoQuery.ts";
import {SchoolTermValue, SchoolYearValue} from "@/type/global.ts";
import {examApi} from "@/js/jw/exam.ts";

interface Props {
    data: ExamScore[];
    year: SchoolYearValue;
    term: SchoolTermValue;
}

export function ExamScoreTable(props: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [usualScore, setUsualScore] = useState<{[key: string]: any}>({});
    const {theme} = useTheme();
    const handlePressRow = (item: ExamScore) => {
        const newExpandedId = expandedId === item.jxb_id ? null : item.jxb_id;
        setExpandedId(newExpandedId);

        if (newExpandedId) {
            console.log("点击了教学班:", item);
            examApi.getUsualScore(+props.year, item.xqm, item.jxb_id).then(res => {
                setUsualScore(prev => ({
                    ...prev,
                    [item.jxb_id]: res,
                }));
            });
        }
    };

    interface ScoreDetailRow {
        label: string;
        key: keyof ExamScore;
    }

    const scoreDetailRows: ScoreDetailRow[] = [
        {
            key: "cjbdsj",
            label: "成绩发布时间",
        },
        {
            key: "xf",
            label: "学分",
        },
        {
            key: "jd",
            label: "绩点",
        },
        {
            key: "jxbmc",
            label: "课程名称",
        },
        {
            key: "jsxm",
            label: "教师姓名",
        },
    ];

    const bgColor = Color.mix(
        Color(theme.colors.primary),
        Color(theme.colors.background),
        theme.mode === "dark" ? 0.7 : 0.2,
    ).setAlpha(theme.mode === "dark" ? 0.3 : 0.6).rgbaString;
    const styles = StyleSheet.create({
        detailItem: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginVertical: 4,
            backgroundColor: bgColor,
            borderWidth: 0.5,
            borderColor: theme.colors.primary,
        },
        detailItemLabel: {
            fontSize: 16,
            width: "100%",
            marginBottom: 2,
        },
        scoreItem: {
            flexDirection: "row",
            alignItems: "center", // 垂直居中
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderWidth: 1, // 全边框
            borderColor: theme.colors.primary,
        },
        schoolYearText: {
            fontSize: 16,
            width: "30%",
            textAlign: "left",
        },
        examCourseName: {
            marginLeft: 30,
            flex: 1, // 占满中间剩余空间
            fontSize: 16,
            textAlign: "left", // 文字开头对齐
            paddingHorizontal: 8, // 左右留空隙
        },
        examScore: {
            width: "10%",
            fontSize: 16,
            textAlign: "right",
        },
        detailContainer: {
            paddingHorizontal: 10,
            paddingVertical: 12,
            backgroundColor: bgColor,
            borderWidth: 0.5,
            borderColor: theme.colors.primary,
        },
        detailItemValue: {
            fontSize: 16,
            textAlign: "right",
        },
    });

    return (
        <Flex>
            <ScrollView>
                <Flex direction="column" gap={10}>
                    <View style={styles.scoreItem}>
                        <Text style={styles.schoolYearText}>{"       学年   "}</Text>
                        <Text style={styles.examCourseName}>{" 课程名称"}</Text>
                        <Text style={styles.examScore}>{"成绩"}</Text>
                    </View>
                    {props.data.map((item, index) => (
                        /* 外层 View 必须加 key，否则 React 会报警告 */
                        <View style={{width: "100%"}} key={item.kcmc}>
                            {/* 可点击的行 */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => handlePressRow(item)}>
                                <View style={styles.scoreItem}>
                                    <Text style={[styles.schoolYearText, +item.cj < 60 && {color: "red"}]}>
                                        {item.xnmmc}
                                    </Text>
                                    <Text style={[styles.examCourseName, +item.cj < 60 && {color: "red"}]}>
                                        {item.kcmc}
                                    </Text>
                                    <Text style={[styles.examScore, +item.cj < 60 && {color: "red"}]}>{item.cj}</Text>
                                </View>
                            </TouchableOpacity>

                            {expandedId === item.jxb_id && (
                                <View style={styles.detailContainer}>
                                    {usualScore[item.jxb_id]?.map((score, index) => {
                                        return (
                                            <Flex
                                                key={`index${index}`}
                                                justify="space-between"
                                                style={styles.detailItem}>
                                                <View style={{width: "55%"}}>
                                                    <Text style={styles.detailItemLabel} numberOfLines={1}>
                                                        {score.name || "暂无"}{score.ratio !== "N/A" && `（${score.ratio} %）`}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.detailItemLabel} numberOfLines={1}>
                                                        {score.score || "暂无"}
                                                    </Text>
                                                </View>
                                            </Flex>
                                        );
                                    }) || <Text style={styles.detailItem}>正在加载...</Text>}
                                    {scoreDetailRows.map((row, detailIndex) => (
                                        <Flex
                                            justify="space-between"
                                            key={`${item.jxb_id}-${row.key}-${detailIndex}`}
                                            style={styles.detailItem}>
                                            <View style={{width: "45%"}}>
                                                <Text style={[styles.detailItemLabel, styles.detailItemLabel]}>
                                                    {row.label}
                                                </Text>
                                            </View>
                                            <View style={{width: "55%"}}>
                                                <Text style={[styles.detailItemLabel, styles.detailItemValue]}>
                                                    {item[row.key] || "暂无"}
                                                </Text>
                                            </View>
                                        </Flex>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </Flex>
            </ScrollView>
        </Flex>
    );
}

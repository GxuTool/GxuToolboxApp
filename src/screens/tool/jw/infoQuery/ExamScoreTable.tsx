import React, {useMemo, useState} from "react";
import {LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager, View} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {OldExamScore} from "@/type/infoQuery/exam/oldExamScore.ts";
import {SchoolTermValue, SchoolYearValue} from "@/type/global.ts";
import {examApi} from "@/js/jw/exam.ts";
interface Props {
    data: OldExamScore[];
    year: SchoolYearValue;
    term: SchoolTermValue;
}

interface DetailState {
    status: "idle" | "loading" | "success" | "error";
    data?: any[];
    error?: string;
}

interface ScoreDetailRow {
    label: string;
    key: keyof OldExamScore;
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
        key: "jsxm",
        label: "教师姓名",
    },
];


export function ExamScoreTable(props: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, DetailState>>({});
    const {theme} = useTheme();
    const handlePressRow = async (item: OldExamScore) => {
        const newExpandedId = expandedId === item.jxb_id ? null : item.jxb_id;
        setExpandedId(newExpandedId);

        if (newExpandedId && !details[newExpandedId]) {
            setDetails(prev => ({...prev, [newExpandedId]: {status: "loading"}}));
            try {
                const res = await examApi.getUsualScore(+props.year, item.xqm, item.jxb_id);
                setDetails(prev => ({...prev, [newExpandedId]: {status: "success", data: res}}));
            } catch (e) {
                console.error("Failed to fetch usual score:", e);
                setDetails(prev => ({
                    ...prev,
                    [newExpandedId]: {status: "error", error: "加载平时成绩失败，请联系开发者"},
                }));
            }
        }
    };

    const styles = useMemo(() => {
        return StyleSheet.create({
            detailItem: {
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginVertical: 4,
            },
            detailItemLabel: {
                fontSize: 16,
                marginBottom: 2,
            },
            scoreItem: {
                flexDirection: "row",
                alignItems: "center", // 垂直居中
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderColor: theme.colors.primary,
            },
            schoolYearText: {
                flex: 3,
                fontSize: 16,
                textAlign: "left",
                color: theme.colors.grey2,
            },
            examCourseName: {
                flex: 5,
                fontSize: 16,
                fontWeight: "600",
                textAlign: "left",
                paddingHorizontal: 8,
            },
            examScore: {
                flex: 2,
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "right",
            },
            detailContainer: {
                borderTopColor: theme.colors.grey2,
                paddingHorizontal: 10,
                borderTopWidth: 0.1,
                paddingVertical: 12,
            },
            detailItemValue: {
                fontSize: 16,
                textAlign: "right",
            },
            cardContainer: {
                backgroundColor: theme.colors.background, // 或者 theme.colors.card
                borderRadius: 12,
                width: "100%",
                marginHorizontal: 12,
                marginVertical: 5,
            },
        });
    }, [theme]);

    return (
        <Flex>
            <ScrollView>
                <Flex direction="column">
                    <View style={styles.scoreItem}>
                        <Text style={styles.schoolYearText}>{"学年"}</Text>
                        <Text style={styles.examCourseName}>{"课程名称"}</Text>
                        <Text style={styles.examScore}>{"成绩"}</Text>
                    </View>
                    {props.data.map((item, index) => (
                        /* 外层 View 必须加 key，否则 React 会报警告 */
                        <ScoreRow
                            key={item.jxb_id}
                            item={item}
                            isExpanded={expandedId === item.jxb_id}
                            detailState={details[item.jxb_id]}
                            onPress={() => handlePressRow(item)}
                            styles={styles}
                        />
                    ))}
                </Flex>
            </ScrollView>
        </Flex>
    );
}

function ScoreRow({item, isExpanded, detailState, onPress, styles}) {
    return (
        <View style={styles.cardContainer} key={item.kcmc}>
            {/* 可点击的行 */}
            <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)}>
                <View style={styles.scoreItem}>
                    <Text style={[styles.schoolYearText, +item.cj < 60 && {color: "red"}]}>{item.xnmmc}</Text>
                    <Text style={[styles.examCourseName, +item.cj < 60 && {color: "red"}]}>{item.kcmc}</Text>
                    <Text style={[styles.examScore, +item.cj < 60 && {color: "red"}]}>{item.cj}</Text>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.detailContainer}>
                    {detailState?.status === "loading" && (
                        <Flex justify="space-between" style={styles.detailItem}>
                            <View style={{width: "55%"}}>
                                <Text style={styles.detailItemLabel} numberOfLines={1}>
                                    {"平时成绩"}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.detailItemLabel} numberOfLines={1}>
                                    {"正在加载中……"}
                                </Text>
                            </View>
                        </Flex>
                    )}
                    {detailState?.status === "error" && <Text style={{color: "red"}}>{detailState.error}</Text>}
                    {detailState?.status === "success" &&
                        detailState.data?.map((score, index) => {
                            return (
                                <Flex key={`index${index}`} justify="space-between" style={styles.detailItem}>
                                    <View style={{width: "55%"}}>
                                        <Text style={styles.detailItemLabel} numberOfLines={1}>
                                            {score.name || "暂无"}
                                            {score.ratio !== "N/A" && `（${score.ratio} %）`}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.detailItemLabel} numberOfLines={1}>
                                            {score.score || "暂无"}
                                        </Text>
                                    </View>
                                </Flex>
                            );
                        })}
                    {scoreDetailRows.map((row, detailIndex) => (
                        <Flex
                            justify="space-between"
                            key={`${item.jxb_id}-${row.key}-${detailIndex}`}
                            style={styles.detailItem}>
                            <View style={{width: "45%"}}>
                                <Text style={[styles.detailItemLabel, styles.detailItemLabel]}>{row.label}</Text>
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
    );
}

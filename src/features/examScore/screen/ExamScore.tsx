import {ActivityIndicator, ScrollView, StyleSheet, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {SchoolTermValue} from "@/type/global.ts";
import {Color} from "@/shared/color.ts";
import {ExamScoreTable} from "@/features/examScore/component/ExamScoreTable.tsx";
import {useNavigation} from "@react-navigation/native";
import {ChooseTerm} from "@/components/tool/infoQuery/examInfo/ChooseTerm.tsx";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {Icon, UnJsonEditor, UnPressable, UnText} from "@/components/un-ui";
import {useScore} from "@/features/examScore/hooks/useScore.ts";

export function ExamScore() {
    const {store: ucStore} = useUserConfig();
    const devMode = ucStore(s => s.devMode);
    const {theme} = useTheme();
    const navigation = useNavigation();
    const [year, setYear] = useState(+ucStore(s => s.jw.year));
    const [term, setTerm] = useState<SchoolTermValue>(ucStore(s => s.jw.term));
    const [page, setPage] = useState(1);
    const {scores, pageInfo, isLoading, loadLocal, fetchRemote, lastSyncTime} = useScore();

    const [notScore, setNotScore] = useState<string[]>([""]);
    const style = useMemo(() => {
        return StyleSheet.create({
            container: {
                padding: "5%",
            },
            table: {
                width: "100%",
            },
            tableText: {
                color: theme.colors.black,
                margin: 5,
            },
            tableBorder: {
                borderWidth: 2,
                borderColor: Color.mix(theme.colors.primary, theme.colors.grey4, 0.4).rgbaString,
            },
            tableHeader: {
                backgroundColor: Color.mix(
                    Color(theme.colors.primary),
                    Color(theme.colors.background),
                    theme.mode === "dark" ? 0.7 : 0.2,
                ).setAlpha(theme.mode === "dark" ? 0.3 : 0.6).rgbaString,
            },
            tableHeaderText: {},
        });
    }, [theme]);

    // async function init() {
    //     const data = await scoreRepo.getList(2025, 2);
    //     if (data && data.length > 0) {
    //         setScores(data);
    //         setPageInfo({
    //             totalCount: data.length,
    //             totalPage: 1,
    //         });
    //     }
    // }
    //
    // async function query() {
    //     const newTerm = term === "3" ? 1 : 2;
    //
    //     const res = await getExamScore(year, newTerm);
    //     if (res?.data) {
    //         setScores(res.data.items || []);
    //         setPageInfo({
    //             totalCount: res.data.totalCount,
    //             totalPage: res.data.totalPage,
    //         });
    //
    //         await scoreRepo.upsert(res.data.items);
    //         await getCourse(year, term, res);
    //     }
    // }

    // async function getCourse(year: number, term: SchoolTermValue, scoreRes: ExamScoreQueryRes) {
    //     const courseListRes = await electiveAPI.getCourses(year, term).then(res => {
    //         if (typeof res?.items === "object") {
    //             return res;
    //         }
    //         return null;
    //     });
    //
    //     if (courseListRes && scoreRes?.items) {
    //         const scoredCourses = new Set(scoreRes.items.map(item => item.kcmc));
    //         const unscored = courseListRes.items
    //             .map(item => item.courseName)
    //             .filter(courseName => !scoredCourses.has(courseName));
    //         setNotScore([...new Set(unscored)]);
    //     }
    // }
    //
    // useEffect(() => {
    //     init();
    // }, []);

    // useEffect(() => {
    //     query();
    // }, [year, term, page]);

    const query = useCallback(async () => {
        const localTerm = term === "3" ? 1 : 2;

        // 瞬间加载本地数据顶上（不阻塞）
        await loadLocal(year, localTerm);

        // 紧接着发起远端请求静默更新
        // 注意这里不要 await 它，让它在后台慢慢跑，跑完了 Hook 会自动 setScores 刷新界面
        fetchRemote(year, term, page).catch(console.error);
    }, [year, term, page, loadLocal, fetchRemote]);

    // 当学年、学期、页码改变时，自动触发
    useEffect(() => {
        query();
    }, [query]);

    // 手动点击查询按钮时，也是触发
    const handleQuery = () => {
        query();
    };

    return (
        <ScrollView>
            <ChooseTerm
                onTermSelect={(Year, Term) => {
                    setYear(Year);
                    setTerm(Term);
                }}
                includeWholeLife={false}
                includeWholeYear={false}
            />
            <View style={style.container}>
                <Flex direction="column" gap={15} align="flex-start">
                    {scores.length > 0 && (
                        <>
                            <Flex align="flex-end" gap={5}>
                                <Text h4>查询结果</Text>
                                {lastSyncTime && (
                                    <Text style={{fontSize: 14, color: "gray"}}>上次同步：{lastSyncTime}</Text>
                                )}
                                {isLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                            </Flex>
                            <Flex gap={10} justify="space-between" align="center">
                                {/*    <Flex gap={10} align="center">*/}
                                {/*        <Text>页数</Text>*/}
                                {/*        <NumberInput value={page} onChange={setPage} min={1} max={scores.totalPage ?? 1} />*/}
                                {/*        <Text>每页15条记录 </Text>*/}
                                {/*    </Flex>*/}
                                <Button onPress={() => navigation.navigate("gpaCalculator")}>绩点计算器</Button>
                            </Flex>
                            <Flex>
                                <ExamScoreTable data={scores} year={year} term={term} />
                            </Flex>
                            {/*<Flex gap={10} align="center">*/}
                            {/*    <Text>页数</Text>*/}
                            {/*    <NumberInput value={page} onChange={setPage} min={1} max={scores.totalPage ?? 1} />*/}
                            {/*    <Text>每页15条记录</Text>*/}
                            {/*</Flex>*/}
                        </>
                    )}
                    {notScore.length > 0 && (
                        <View style={{width: "100%"}}>
                            <Text h4>未出分科目</Text>
                            <Divider style={{marginVertical: 10}} />
                            <View style={{flexDirection: "row", flexWrap: "wrap", gap: 10}}>
                                {notScore.map((courseName, index) => (
                                    <Button key={index} type={"outline"} radius={"lg"} color={theme.colors.primary}>
                                        {courseName}
                                    </Button>
                                ))}
                            </View>
                        </View>
                    )}
                    {devMode && (
                        <Flex gap={8} direction="column">
                            <ScheduleDataDebugCard label="查看考试成绩数据" data={scores} />
                            <ScheduleDataDebugCard label="查看未出分科目" data={notScore} />
                        </Flex>
                    )}
                </Flex>
            </View>
        </ScrollView>
    );
}

function ScheduleDataDebugCard({label, data}: {label: string; data: any}) {
    const {theme} = useTheme();
    const [modalOpen, setModalOpen] = useState(false);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(theme.colors.error).setAlpha(theme.mode === "light" ? 0.5 : 0.3).rgbaString,
        },
    });
    return (
        <Flex>
            <UnPressable onPress={() => setModalOpen(true)}>
                <Flex style={styles.card} justify="flex-start" gap={4}>
                    <Icon name="console" size={16} inline />
                    <UnText weight="bold" size={16}>
                        {label}
                    </UnText>
                </Flex>
            </UnPressable>
            <UnJsonEditor.Modal readOnly visible={modalOpen} onClose={() => setModalOpen(false)} value={data} />
        </Flex>
    );
}

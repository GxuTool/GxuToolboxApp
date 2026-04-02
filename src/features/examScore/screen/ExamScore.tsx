import {ScrollView, StyleSheet, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import React, {useEffect, useMemo, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {SchoolTermValue} from "@/type/global.ts";
import {NumberInput} from "@/components/un-ui/NumberInput.tsx";
import {ExamScoreQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import {store} from "@/core/store.ts";
import {Color} from "@/shared/color.ts";
import {ExamScoreTable} from "@/features/examScore/component/ExamScoreTable.tsx";
import {examApi} from "@/js/jw/exam.ts";
import {useNavigation} from "@react-navigation/native";
import {ChooseTerm} from "@/components/tool/infoQuery/examInfo/ChooseTerm.tsx";
import {electiveAPI} from "@/features/electiveStrategy/api";
import {useUserConfig} from "@/hooks/app.ts";

export function ExamScore() {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();
    const navigation = useNavigation();
    const [apiRes, setApiRes] = useState<ExamScoreQueryRes>({} as ExamScoreQueryRes);
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const [page, setPage] = useState(1);
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

    async function init() {
        const data = await store.load<ExamScoreQueryRes>({key: "examScore"}).catch(e => {
            console.warn(e);
            return null;
        });
        if (data) {
            setApiRes(data);
        }
    }

    async function query() {
        const res = await examApi.getExamScore(year, term, page);
        if (res) {
            setApiRes(res);
            await store.save({key: "examScore", data: res});
            await getCourse(year, term, res);
        }
    }

    async function getCourse(year: number, term: SchoolTermValue, scoreRes: ExamScoreQueryRes) {
        const courseListRes = await electiveAPI.getCourses(year, term).then(res => {
            if (typeof res?.items === "object") {
                return res;
            }
            return null;
        });

        if (courseListRes && scoreRes?.items) {
            const scoredCourses = new Set(scoreRes.items.map(item => item.kcmc));
            const unscored = courseListRes.items
                .map(item => item.courseName)
                .filter(courseName => !scoredCourses.has(courseName));
            setNotScore([...new Set(unscored)]);
        }
    }

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        query();
    }, [year, term, page]);

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
                    {apiRes?.items?.length > 0 && (
                        <>
                            <Flex align="flex-end" gap={5}>
                                <Text h4>查询结果</Text>
                                <Text>{`第${apiRes.currentPage ?? 1}/${apiRes.totalPage ?? 1}页，共有${
                                    apiRes.totalCount ?? 0
                                }条结果 `}</Text>
                            </Flex>
                            <Flex gap={10} justify="space-between" align="center">
                                <Flex gap={10} align="center">
                                    <Text>页数</Text>
                                    <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                                    <Text>每页15条记录 </Text>
                                </Flex>
                                <Button onPress={() => navigation.navigate("gpaCalculator")}>绩点计算器</Button>
                            </Flex>
                            <Flex>
                                <ExamScoreTable data={apiRes.items ?? []} year={year} term={term} />
                            </Flex>
                            <Flex gap={10} align="center">
                                <Text>页数</Text>
                                <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                                <Text>每页15条记录</Text>
                            </Flex>
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
                </Flex>
            </View>
        </ScrollView>
    );
}

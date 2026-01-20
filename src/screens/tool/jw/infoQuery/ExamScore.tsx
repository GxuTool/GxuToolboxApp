import {ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import React, {useContext, useEffect, useMemo, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {SchoolTermValue} from "@/type/global.ts";
import {NumberInput} from "@/components/un-ui/NumberInput.tsx";
import {ExamScoreQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import {store} from "@/js/store.ts";
import {Color} from "@/js/color.ts";
import {ExamScoreTable} from "@/screens/tool/jw/infoQuery/ExamScoreTable.tsx";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {examApi} from "@/js/jw/exam.ts";
import {useNavigation} from "@react-navigation/native";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useWebView} from "@/hooks/app.ts";

export function ExamScore() {
    const {userConfig} = useContext(UserConfigContext);
    const {theme} = useTheme();
    const navigation = useNavigation();
    const {openInJw} = useWebView();
    const [apiRes, setApiRes] = useState<ExamScoreQueryRes>({} as ExamScoreQueryRes);
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const [page, setPage] = useState(1);
    const [tableData, setTableData] = useState({
        header: ["学年", "课程名称", "成绩", "发布时间", "学分", "绩点", "教学班", "教师", "教学班ID"],
        width: [120, 200, 80, 150, 100, 80, 200, 140, 300],
        body: [] as string[][],
    });
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
            setTableData({
                ...tableData,
                body: data.items.map((item, index) => [
                    item.xnmmc,
                    item.kcmc,
                    item.cj,
                    item.cjbdsj,
                    item.xf,
                    item.jd,
                    item.jxbmc,
                    item.jsxm,
                    item.jxb_id,
                ]),
            });
        }
    }

    async function query() {
        const res = await examApi.getExamScore(year, term, page);
        if (res) {
            const tableBody = res.items.map(item => [
                item.xnmmc,
                item.kcmc,
                item.cj,
                item.cjbdsj,
                item.xf,
                item.jd,
                item.jxbmc,
                item.jsxm,
                item.jxb_id,
            ]);
            ToastAndroid.show("获取考试成绩成功", ToastAndroid.SHORT);
            setTableData({
                ...tableData,
                body: tableBody,
            });
            setApiRes(res);
            await store.save({key: "examScore", data: res});
        }
    }

    useEffect(() => {
        init();
        query();
    }, [year, term, page]);

    return (
        <ScrollView>
            <View style={style.container}>
                <Text h4>查询参数</Text>
                <Flex gap={10} direction="column" align="flex-start">
                    <Flex gap={10}>
                        <Text>学期</Text>
                        <View style={{flex: 1}}>
                            <UnTermSelector
                                year={year}
                                term={term}
                                onChange={(year, term) => {
                                    setYear(+year);
                                    setTerm(term);
                                }}
                            />
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Button containerStyle={{flex: 1}} onPress={query}>
                            查询
                        </Button>
                        <Button
                            onPress={() => {
                                openInJw("/cjcx/cjcx_cxDgXscj.html?gnmkdm=N305005&layout=default");
                            }}>
                            前往教务查询
                        </Button>
                    </Flex>
                </Flex>
                <Divider />
                <Flex direction="column" gap={15} align="flex-start">
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
                </Flex>
            </View>
        </ScrollView>
    );
}

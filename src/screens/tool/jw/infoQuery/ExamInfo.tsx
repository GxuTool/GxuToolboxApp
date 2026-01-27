import {ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import React, {useContext, useEffect, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {SchoolTerms, SchoolTermValue, SchoolYears} from "@/type/global.ts";
import {NumberInput} from "@/components/un-ui/NumberInput.tsx";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {ExamInfoQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import {store} from "@/core/store.ts";
import {Color} from "@/shared/color.ts";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {examApi} from "@/js/jw/exam.ts";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useWebView} from "@/hooks/app.ts";

export function ExamInfo() {
    const {theme} = useTheme();
    const {userConfig} = useContext(UserConfigContext);
    const {openInJw} = useWebView();
    const [apiRes, setApiRes] = useState<ExamInfoQueryRes>({} as ExamInfoQueryRes);
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const [page, setPage] = useState(1);
    const [tableData, setTableData] = useState({
        header: ["课程名称", "考试时间", "考试校区", "考试地点", "考试座号", "学年", "学期", "教学班", "考试名称"],
        width: [170, 200, 80, 100, 80, 100, 70, 190, 300],
        body: [] as string[][],
    });

    const data = {
        schoolYear: [["", "全部"], ...SchoolYears],
        schoolTerm: [["", "全部"], ...SchoolTerms],
    };

    const style = StyleSheet.create({
        container: {
            padding: "5%",
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

    function init() {
        store
            .load({key: "examInfo"})
            .then(data => {
                setApiRes(data);
            })
            .catch(console.warn);
    }

    async function query() {
        const res = await examApi.getExamInfo(year, term, page);
        if (res) {
            const tableBody = res.items.map(item => [
                item.kcmc,
                item.kssj,
                item.cdxqmc,
                item.cdmc,
                item.zwh,
                item.xnmc,
                item.xqmmc,
                item.jxbmc,
                item.ksmc,
            ]);
            ToastAndroid.show("获取考试信息成功", ToastAndroid.SHORT);
            setTableData({
                ...tableData,
                body: tableBody,
            });
            setApiRes(res);
            await store.save({key: "examInfo", data: res});
        }
    }

    useEffect(() => {
        init();
        query();
    }, [year, term, page]);

    return (
        <ScrollView>
            <View style={style.container}>
                <Flex gap={10} direction="column" align="flex-start">
                    <Text h4>查询参数</Text>
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
                                openInJw("/kwgl/kscx_cxXsksxxIndex.html?gnmkdm=N358105&layout=default");
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
                        }条结果`}</Text>
                    </Flex>
                    <Flex gap={10}>
                        <Text>页数</Text>
                        <Flex inline>
                            <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                        </Flex>
                        <Text>每页15条记录</Text>
                    </Flex>
                    <ScrollView horizontal>
                        <Table borderStyle={style.tableBorder}>
                            <Row
                                data={tableData.header}
                                widthArr={tableData.width}
                                textStyle={style.tableText}
                                style={style.tableHeader}
                                height={50}
                            />
                            <Rows
                                heightArr={new Array(tableData.body.length).fill(50)}
                                data={tableData.body}
                                widthArr={tableData.width}
                                textStyle={style.tableText}
                            />
                        </Table>
                    </ScrollView>
                    <Flex gap={10}>
                        <Text>页数</Text>
                        <Flex inline>
                            <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                        </Flex>
                        <Text>每页15条记录</Text>
                    </Flex>
                </Flex>
            </View>
        </ScrollView>
    );
}

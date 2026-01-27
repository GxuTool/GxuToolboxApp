import {ScrollView, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text, useTheme} from "@rneui/themed";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Color} from "@/shared/color.ts";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";

type EngTrainingExp = {
    date: string;
    name: string;
    y: number;
    span: number;
    backgroundColor?: string;
    type: "engTrainingExp";
};

export function EngTrainingScheduleScreen() {
    const {theme} = useTheme();
    const [tableData, setTableData] = useState({
        header: ["上课时间", "实验名称"],
        width: [130, 250],
        body: [] as (string | Element)[][],
    });

    function formatData(list: EngTrainingExp[]) {
        setTableData({
            ...tableData,
            body: list.map(item => [
                <Text
                    style={{
                        textAlign: "center",
                        opacity: moment(item.date, "M月DD").isBefore(moment(), "d") ? 0.5 : 1,
                    }}>
                    {moment(item.date, "M月DD").format("YYYY年MM月DD日")}
                </Text>,
                item.name,
            ]),
        });
    }

    async function init() {
        // 从内存中加载物理实验缓存
        const engTrainingExpList = await store.load({key: "engTrainingExpList"}).catch(e => {
            console.warn(e);
            return [];
        });
        if (engTrainingExpList) formatData(engTrainingExpList);
        getData();
    }

    const {openInWeb} = useWebView();
    function openWeb() {
        openInWeb("工程训练中心", {
            uri: "http://xlzxms.gxu.edu.cn/api/security-server/dietc/loginsso/student",
        });
    }

    async function getData() {
        const {datas} = await courseApi.engTraining.getPersonalExpList();
        const dateList = datas[0].filter(item => item.startRow === 2);
        // 根据日期获取实训
        // TODO: 判断节数
        const expList = dateList.map<EngTrainingExp>(date => {
            const exp = datas[0].find(
                item =>
                    item.startRow === 9 &&
                    item.startCol <= date.startCol &&
                    item.startCol + item.colNumber >= date.startCol + date.colNumber,
            );
            return {
                date: date.content,
                type: "engTrainingExp",
                name: exp?.content ?? "",
                y: 0,
                span: 8,
                backgroundColor: undefined,
            };
        });
        await store.save({
            key: "engTrainingExpList",
            data: expList,
        });
        formatData(expList);
    }

    useEffect(() => {
        init();
    }, []);

    const style = StyleSheet.create({
        tableText: {
            color: theme.colors.black,
            textAlign: "center",
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
    });

    return (
        <ScrollView contentContainerStyle={{padding: "5%"}}>
            <Flex direction="column" gap={10}>
                <Button containerStyle={{width: "100%"}} onPress={openWeb}>
                    在工程训练中心查看
                </Button>
                {tableData.body.length > 0 ? (
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
                ) : (
                    <Text>当前学期没有金工实训课，无法查询过往学期的课程列表</Text>
                )}
            </Flex>
        </ScrollView>
    );
}

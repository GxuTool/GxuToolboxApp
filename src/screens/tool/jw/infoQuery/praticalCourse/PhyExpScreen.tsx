import {ScrollView, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text, useTheme} from "@rneui/themed";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Color} from "@/shared/color.ts";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";

export function PhyExpScreen() {
    const {theme} = useTheme();
    const [tableData, setTableData] = useState({
        header: ["上课时间", "上课地点", "实验名称"],
        width: [130, 190, 300],
        body: [] as (string | Element)[][],
    });

    function formatData(list: PhyExp[]) {
        setTableData({
            ...tableData,
            body: list.map(item => [
                <Text
                    style={{
                        textAlign: "center",
                        opacity: moment(item.skrq, "YYYYMMDD").isBefore(moment(), "d") ? 0.5 : 1,
                    }}>
                    {moment(item.skrq, "YYYYMMDD").format("YYYY年MM月DD日")}
                </Text>,
                item.fjbh,
                item.xmmc,
            ]),
        });
    }

    async function init() {
        // 从内存中加载物理实验缓存
        const phyExpList = await store.load({key: "phyExpList"}).catch(e => {
            console.warn(e);
            return [];
        });
        if (phyExpList) formatData(phyExpList);
        getData();
    }

    const {openInWeb} = useWebView();
    function openWeb() {
        openInWeb("物理实验教学中心", {
            uri: "https://pec.gxu.edu.cn/Customer/MasterPage/UserCenterPage.html",
        });
    }

    async function getData() {
        const {data} = await courseApi.getPhyExpList();
        formatData(data);
        await store.save({
            key: "phyExpList",
            data,
        });
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
                    在物理实验中心查看
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
                    <Text>当前学期没有实验课，无法查询过往学期的课程列表</Text>
                )}
            </Flex>
        </ScrollView>
    );
}

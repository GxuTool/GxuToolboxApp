import {ScrollView} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text} from "@rneui/themed";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";
import {UnTable, UnTableCols} from "@/components/un-ui";

type EngTrainingExp = {
    date: string;
    name: string;
    y: number;
    span: number;
    backgroundColor?: string;
    type: "engTrainingExp";
};

export function EngTrainingScheduleScreen() {
    const [tableData, setTableData] = useState<EngTrainingExp[]>([]);

    const cols: UnTableCols<EngTrainingExp> = [
        {
            title: "上课时间",
            width: 130,
            dataIndex: "date",
            render: v => (
                <Text
                    style={{
                        textAlign: "center",
                        opacity: moment(v, "M月DD").isBefore(moment(), "d") ? 0.5 : 1,
                    }}>
                    {moment(v, "M月DD").format("YYYY年MM月DD日")}
                </Text>
            ),
        },
        {
            title: "实验名称",
            width: 250,
            dataIndex: "name",
        },
    ];

    async function init() {
        // 从内存中加载物理实验缓存
        const engTrainingExpList = await store.load({key: "engTrainingExpList"}).catch(e => {
            console.warn(e);
            return [];
        });
        if (engTrainingExpList) setTableData(engTrainingExpList);
        await getData();
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
        setTableData(expList);
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <ScrollView contentContainerStyle={{padding: "5%"}}>
            <Flex direction="column" gap={10}>
                <Button containerStyle={{width: "100%"}} onPress={openWeb}>
                    在工程训练中心查看
                </Button>
                {tableData.length > 0 ? (
                    <ScrollView horizontal>
                        <UnTable<EngTrainingExp> data={tableData} cols={cols} />
                    </ScrollView>
                ) : (
                    <Text>当前学期没有金工实训课，无法查询过往学期的课程列表</Text>
                )}
            </Flex>
        </ScrollView>
    );
}

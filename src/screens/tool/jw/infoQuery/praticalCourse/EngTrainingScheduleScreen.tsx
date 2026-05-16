import {ScrollView, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text, useTheme} from "@rneui/themed";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";
import {Icon, UnJsonEditor, UnPressable, UnTable, UnTableCols, UnText} from "@/components/un-ui";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {Color} from "@/shared/color.ts";

type EngTrainingExp = {
    date: string;
    name: string;
    y: number;
    span: number;
    backgroundColor?: string;
    type: "engTrainingExp";
};

export function EngTrainingScheduleScreen() {
    const {store} = useUserConfig();
    const devMode = store(s => s.devMode);
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
                {devMode && <ScheduleDataDebugCard label="查看金工实训数据" data={tableData} />}
            </Flex>
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

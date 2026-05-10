import {ScrollView, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text, useTheme} from "@rneui/themed";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";
import {Icon, UnJsonEditor, UnPressable, UnTable, UnTableCols, UnText} from "@/components/un-ui";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {Color} from "@/shared/color.ts";

export function PhyExpScreen() {
    const {store} = useUserConfig();
    const devMode = store(s => s.devMode);
    const [tableData, setTableData] = useState<PhyExp[]>([]);

    const cols: UnTableCols<PhyExp> = [
        {
            title: "上课时间",
            dataIndex: "skrq",
            render: v => (
                <Text
                    style={{
                        textAlign: "center",
                        opacity: moment(v, "YYYYMMDD").isBefore(moment(), "d") ? 0.5 : 1,
                    }}>
                    {moment(v, "YYYYMMDD").format("YYYY年MM月DD日")}
                </Text>
            ),
            width: 130,
        },
        {
            title: "上课地点",
            dataIndex: "fjbh",
            width: 190,
        },
        {
            title:"上课教师",
            dataIndex:"zjjsxm",
            width:120,
        },
        {
            title: "实验名称",
            dataIndex: "xmmc",
            width: 300,
        },
    ];

    async function init() {
        // 从内存中加载物理实验缓存
        const phyExpList = await store.load({key: "phyExpList"}).catch(e => {
            console.warn(e);
            return [];
        });
        if (phyExpList) setTableData(phyExpList);
        await getData();
    }

    const {openInWeb} = useWebView();
    function openWeb() {
        openInWeb("物理实验教学中心", {
            uri: "https://pec.gxu.edu.cn/Customer/MasterPage/UserCenterPage.html",
        });
    }

    async function getData() {
        const {data} = await courseApi.getPhyExpList();
        setTableData(data);
        await store.save({
            key: "phyExpList",
            data,
        });
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <ScrollView contentContainerStyle={{padding: "5%"}}>
            <Flex direction="column" gap={10}>
                <Button containerStyle={{width: "100%"}} onPress={openWeb}>
                    在物理实验中心查看
                </Button>
                {tableData.length > 0 ? (
                    <UnTable<PhyExp> cols={cols} data={tableData} />
                ) : (
                    <Text>当前学期没有实验课，无法查询过往学期的课程列表</Text>
                )}
                {devMode && <ScheduleDataDebugCard label="查看物理实验课数据" data={tableData} />}
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

import {ScrollView} from "react-native";
import React, {useEffect, useState} from "react";
import {Button, Text} from "@rneui/themed";
import "moment/locale/zh-cn";
import Flex from "@/components/un-ui/Flex.tsx";
import {store} from "@/core/store.ts";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {useWebView} from "@/hooks/app.ts";
import {UnTable, UnTableCols} from "@/components/un-ui";

export function PhyExpScreen() {
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
            </Flex>
        </ScrollView>
    );
}

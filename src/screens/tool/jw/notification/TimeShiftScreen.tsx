import {ScrollView} from "react-native";
import React, {useEffect, useState} from "react";
import {http} from "@/core/http.ts";
import moment from "moment/moment";
import "moment/locale/zh-cn";
import {UnTable, UnTableCols} from "@/components/un-ui";

export function TimeShiftScreen() {
    const [timeShiftData, setTimeShiftData] = useState<[string, string][]>([]);

    async function init() {
        const {data} = await http.get("https://file.unde.site/GxuToolApp/data.json");
        setTimeShiftData(data.timeShift);
    }

    useEffect(() => {
        init();
    }, []);

    const cols: UnTableCols<[string, string]> = [
        {
            dataIndex: 0,
            width: 130,
            title: "调课日期",
            render: workDay => moment(workDay).format("YYYY年MM月DD日"),
        },
        {
            dataIndex: 1,
            width: 190,
            title: "调休日期",
            render: breakDay => moment(breakDay).format("YYYY年MM月DD日（ddd）"),
        },
    ];

    return (
        <ScrollView contentContainerStyle={{padding: "5%"}}>
            <UnTable<[string, string]> cols={cols} data={timeShiftData} />
        </ScrollView>
    );
}

import {ScrollView, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {useTheme} from "@rneui/themed";
import {http} from "@/core/http.ts";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Color} from "@/shared/color.ts";
import moment from "moment/moment";
import "moment/locale/zh-cn";

export function TimeShiftScreen() {
    const {theme} = useTheme();
    const [tableData, setTableData] = useState({
        header: ["调课日期", "调休日期"],
        width: [130, 190],
        body: [] as string[][],
    });

    async function init() {
        const {data} = await http.get("https://file.unde.site/GxuToolApp/data.json");
        setTableData({
            ...tableData,
            body: data.timeShift.map((item: [string, string]) => {
                const workDay = moment(item[0]);
                const breakDay = moment(item[1]);
                return [workDay.format("YYYY年MM月DD日"), breakDay.format("YYYY年MM月DD日（ddd）")];
            }),
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
        </ScrollView>
    );
}

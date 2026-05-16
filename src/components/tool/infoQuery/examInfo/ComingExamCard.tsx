import {Card, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {ScrollView, StyleSheet} from "react-native";
import {Color} from "@/shared/color.ts";
import {useEffect, useState} from "react";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import {store} from "@/core/store.ts";
import {ExamInfoQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import moment from "moment/moment";
import {Row, Rows, Table} from "react-native-reanimated-table";

export function ComingExamCard() {
    const {theme} = useTheme();
    const [apiRes, setApiRes] = useState<ExamInfoQueryRes>();
    const [resList, setResList] = useState<string[]>([]);
    const tableHeaders = ["科目", "时间", "地点"];
    const tableWidths = [100, 150, 100];

    function queryExam() {}

    function init() {
        store.load({key: "examInfo"}).then((data: ExamInfoQueryRes) => {
            setApiRes(data);
            format(data.items);
        }).catch(console.warn);
    }

    function format(examList: ExamInfo[]) {
        const res: any[] = [];
        examList.forEach(exam => {
            if (moment.duration(moment().diff(moment(exam.kssj))).asDays() <= 15) {
                res.push(exam);
            }
        });
        setResList(res.map((exam: ExamInfo) => [exam.kcmc, moment(exam.kssj).format(), exam.cdmc]));
    }

    useEffect(() => {
        init();
    }, []);

    const style = StyleSheet.create({
        card: {
            backgroundColor: Color(theme.colors.background).setAlpha(theme.mode === "dark" ? 0.7 : 0.8).rgbaString,
            borderRadius: 5,
        },
        bottomSheetContainer: {
            backgroundColor: theme.colors.background,
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
    });
    return (
        <Card containerStyle={style.card}>
            <Card.Title>
                <Flex justify="space-between">
                    <Text h4>近期考试</Text>
                    <Flex gap={15} justify="flex-end"></Flex>
                </Flex>
            </Card.Title>
            <Card.Divider />
            <ScrollView horizontal>
                <Table style={style.table} borderStyle={style.tableBorder}>
                    <Row
                        height={30}
                        data={tableHeaders}
                        style={style.tableHeader}
                        widthArr={tableWidths}
                        textStyle={style.tableText}
                    />
                    <Rows
                        heightArr={new Array(resList.length).map(() => 50)}
                        data={resList}
                        widthArr={tableWidths}
                        textStyle={style.tableText}
                    />
                </Table>
            </ScrollView>
        </Card>
    );
}

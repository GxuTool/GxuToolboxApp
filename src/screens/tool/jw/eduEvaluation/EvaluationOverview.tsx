import {useCallback, useMemo, useState} from "react";
import {ScrollView, StyleSheet, ToastAndroid} from "react-native";
import {Row, Table} from "react-native-reanimated-table";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {Color} from "@/js/color.ts";
import {Button, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {EvaluationRow} from "@/components/tool/eduEvaluation/EvaluationRow.tsx";
import {evaluationApi} from "@/js/jw/evaluation.ts";
import {Evaluation} from "@/type/eduEvaluation/evaluation.type.ts";
import {useWebView} from "@/hooks/app.ts";
import {EvaluationComment} from "@/screens/tool/jw/eduEvaluation/EvaluationComment.tsx";
import {Icon} from "@/components/un-ui";
import {parseEvaluationHTML} from "@/js/jw/evaParser.ts";
import {createDefaultReq, fillReq} from "@/js/jw/evaReq.ts";
import {loadTemplate} from "@/screens/tool/jw/eduEvaluation/EvaluationTemplate.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function EvaluationOverview() {
    const {theme} = useTheme();
    const [evaList, setEvaList] = useState<Evaluation[]>([]);
    const navigation = useNavigation();
    const colWidths = [9, 6, 5];
    const handleRowPress = (item: Evaluation) => {
        navigation.navigate("EvaluationDetail", {evaluationItem: item});
    };
    const defaultColor = Color.mix(
        Color(theme.colors.primary),
        Color(theme.colors.background),
        theme.mode === "dark" ? 0.1 : 0.4,
    ).setAlpha(theme.mode === "dark" ? 0.3 : 0.8).rgbaString;

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    paddingHorizontal: 10,
                    paddingVertical: 15,
                },
                header: {
                    height: 50,
                    backgroundColor: defaultColor,
                },
                headerText: {
                    textAlign: "center",
                    fontWeight: "bold",
                    color: theme.colors.black,
                    fontSize: 16,
                },
                row: {
                    height: 45,
                    borderBottomWidth: 1,
                    borderBottomColor: Color(theme.colors.primary).setAlpha(0.3).rgbaString,
                    alignItems: "center",
                },
                rowText: {
                    textAlign: "center",
                    fontSize: 14,
                },
            }),
        [theme],
    );

    const colorMap: Record<string, string> = {
        已评完: theme.colors.success,
        未评完: theme.colors.warning,
        未评: theme.colors.error,
    };
    const statusList = Object.keys(colorMap);

    const statusCounts = useMemo(() => {
        const cnt = {已评完: 0, 未评完: 0, 未评: 0};
        evaList.forEach(item => {
            if (cnt[item.tjztmc] !== undefined) {
                cnt[item.tjztmc]++;
            }
        });
        return cnt;
    }, [evaList]);

    const oneKey = async () => {
        let temp = await AsyncStorage.getItem("@EvaluationTemplate");
        temp = JSON.parse(typeof temp === "string" ? temp : "" as string);
        console.log(temp);
        for (const evaluationItem of evaList) {
            ToastAndroid.showWithGravity(`评教：${evaluationItem.kcmc}-${evaluationItem.xsmc}-${evaluationItem.jzgmc}`,ToastAndroid.SHORT,1);
            const HtmlText = await evaluationApi.getEvaluationDetail(
                evaluationItem.jgh_id,
                evaluationItem.jxb_id,
                evaluationItem.kch_id,
                evaluationItem.xsdm,
                evaluationItem.pjmbmcb_id,
            );
            const {idObj, teachers, selected} = parseEvaluationHTML(HtmlText);

            const defReq = createDefaultReq(evaluationItem, idObj);
            const reqToSend = fillReq(defReq, temp.selected, temp.comment, idObj);

            const res = await evaluationApi.handleEvaResult(defReq, reqToSend);
            console.log(res);
            ToastAndroid.showWithGravity(res, ToastAndroid.SHORT, 5);
            await init();
            //
            // break;
        }
    };

    async function init() {
        const res = await evaluationApi.getEvaluationList();
        res.items.sort((a, b) => statusList.indexOf(b.tjztmc) - statusList.indexOf(a.tjztmc));
        setEvaList(res.items);
    }

    useFocusEffect(
        useCallback(() => {
            init();
        }, []),
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Flex direction="column" gap={10}>
                <Flex direction="row" justify="space-between" gap={20}>
                    <Text style={{fontSize: 16}}>
                        总计 {evaList.length} ~ 已评完 {statusCounts["已评完"]} ~ 未评 {statusCounts["未评"]} ~ 未评完{" "}
                        {statusCounts["未评完"]}{" "}
                    </Text>
                    <Button
                        containerStyle={{width: "10%"}}
                        onPress={() => {
                            navigation.navigate("EvaluationTemplate");
                        }}>
                        <Icon name={"cog"} size={20} color={"white"} />
                    </Button>
                </Flex>
                <Button
                    containerStyle={{width: "100%"}}
                    onPress={() => {
                        oneKey();
                    }}>
                    应用自定义模板一键评教
                </Button>
                <Table style={{width: "100%"}}>
                    <Row
                        data={["课程", "教师", "状态"]}
                        style={styles.header}
                        flexArr={colWidths}
                        textStyle={styles.headerText}
                    />
                    {evaList.map(item => (
                        <EvaluationRow
                            key={item.jxb_id + item.jgh_id}
                            item={item}
                            onPress={handleRowPress}
                            colWidths={colWidths}
                            colorMap={colorMap}
                        />
                    ))}
                </Table>
            </Flex>
        </ScrollView>
    );
}

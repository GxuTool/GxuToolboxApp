import {useCallback, useMemo, useState, useRef} from "react";
import {ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {Row, Table} from "react-native-reanimated-table";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {Color} from "@/js/color.ts";
import {Button, Text, useTheme, Dialog, LinearProgress} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {EvaluationRow} from "@/components/tool/eduEvaluation/EvaluationRow.tsx";
import {evaluationApi} from "@/js/jw/evaluation.ts";
import {Evaluation} from "@/type/eduEvaluation/evaluation.type.ts";
import {Icon} from "@/components/un-ui";
import {parseEvaluationHTML} from "@/js/jw/evaParser.ts";
import {createDefaultReq, fillReq} from "@/js/jw/evaReq.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";


const ProgressBar = ({progress, color}: {progress: number; color: string}) => {
    const progressPercent = Math.round(progress * 100);
    return (
        <View style={{height: 4, backgroundColor: "#e0e0e0", borderRadius: 2}}>
            <View style={{height: "100%", width: `${progressPercent}%`, backgroundColor: color, borderRadius: 2}} />
        </View>
    );
};
export function EvaluationOverview() {
    const {theme} = useTheme();
    const [evaList, setEvaList] = useState<Evaluation[]>([]);
    const navigation = useNavigation();
    const colWidths = [9, 6, 5];

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const isCancelled = useRef(false);

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
        const unEvaluatedList = evaList.filter(item => item.tjztmc !== "已评完");
        if (unEvaluatedList.length === 0) {
            ToastAndroid.show("所有项目均已评教，无需操作。", ToastAndroid.SHORT);
            return;
        }

        let temp;
        try {
            const storedTemp = await AsyncStorage.getItem("@EvaluationTemplate");
            if (!storedTemp) throw new Error("未找到评教模板");
            temp = JSON.parse(storedTemp);
        } catch (e) {
            ToastAndroid.show("加载评教模板失败，请先设置模板。", ToastAndroid.LONG);
            navigation.navigate("EvaluationTemplate");
            return;
        }

        isCancelled.current = false;
        setIsModalVisible(true);
        setProgress(0);
        setProgressText("准备开始...");

        try {
            for (let i = 0; i < unEvaluatedList.length; i++) {
                if (isCancelled.current) {
                    ToastAndroid.show("操作已取消", ToastAndroid.SHORT);
                    break;
                }

                const evaluationItem = unEvaluatedList[i];
                const currentProgressText = `(${i + 1}/${unEvaluatedList.length}) ${evaluationItem.kcmc} - ${
                    evaluationItem.jzgmc
                }`;
                setProgressText(currentProgressText);

                const HtmlText = await evaluationApi.getEvaluationDetail(
                    evaluationItem.jgh_id,
                    evaluationItem.jxb_id,
                    evaluationItem.kch_id,
                    evaluationItem.xsdm,
                    evaluationItem.pjmbmcb_id,
                );
                const {idObj} = parseEvaluationHTML(HtmlText);
                const defReq = createDefaultReq(evaluationItem, idObj);
                const reqToSend = fillReq(defReq, temp.selected, temp.comment, idObj);
                await evaluationApi.handleEvaResult(defReq, reqToSend);

                const cur = (i + 1) / unEvaluatedList.length;
                setProgress(Math.round(cur * 100) / 100);
            }
        } catch (error) {
            console.error("一键评教时发生错误:", error);
            ToastAndroid.show(`发生错误: ${error.message}`, ToastAndroid.LONG);
        } finally {
            setIsModalVisible(false);
            await init(); // 无论如何都刷新列表
        }
    };

    const zero = async () => {
        setProgress(0);
        setProgressText("");
        for (let i = 0; i < evaList.length; i++) {
            if (isCancelled.current) {
                ToastAndroid.show("操作已取消", ToastAndroid.SHORT);
                break;
            }

            const evaluationItem = evaList[i];
            const currentProgressText = `(${i + 1}/${evaList.length}) ${evaluationItem.kcmc} - ${evaluationItem.jzgmc}`;
            setProgressText(currentProgressText);

            const HtmlText = await evaluationApi.getEvaluationDetail(
                evaluationItem.jgh_id,
                evaluationItem.jxb_id,
                evaluationItem.kch_id,
                evaluationItem.xsdm,
                evaluationItem.pjmbmcb_id,
            );
            const {idObj} = parseEvaluationHTML(HtmlText);
            const defReq = createDefaultReq(evaluationItem, idObj);
            await evaluationApi.handleEvaResult(defReq);

            setProgress((i + 1) / evaList.length);

            await init();
        }
    };

    async function init() {
        try {
            const res = await evaluationApi.getEvaluationList();
            res.items.sort((a, b) => statusList.indexOf(a.tjztmc) - statusList.indexOf(b.tjztmc));
            setEvaList(res.items);
        } catch (e) {
            console.error("获取评教列表失败:", e);
            ToastAndroid.show("获取评教列表失败", ToastAndroid.SHORT);
        }
    }

    useFocusEffect(
        useCallback(() => {
            init();
        }, []),
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* --- 进度弹窗 --- */}
            <Dialog isVisible={isModalVisible} overlayStyle={{borderRadius: 8}}>
                <Dialog.Title title="正在一键评教..." />
                <View style={{paddingHorizontal: 10, paddingVertical: 20}}>
                    <Text style={{fontSize: 16, marginBottom: 10}}>{progressText}</Text>
                    <ProgressBar progress={progress} color={theme.colors.primary} />
                </View>
                <Dialog.Actions>
                    <Button title="取消" type="clear" onPress={() => (isCancelled.current = true)} />
                </Dialog.Actions>
            </Dialog>

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
                <Flex>
                    <Button containerStyle={{width: "65%", paddingRight: 10}} onPress={oneKey}>
                        应用自定义模板一键评价
                    </Button>
                    <Button
                        containerStyle={{width: "25%"}}
                        onPress={() => {
                            zero();
                        }}>
                        清空评价
                    </Button>
                </Flex>
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

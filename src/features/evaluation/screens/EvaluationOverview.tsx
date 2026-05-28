import {useCallback, useMemo, useRef, useState} from "react";
import {Alert, ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {Row, Table} from "react-native-reanimated-table";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {Color} from "@/shared/color.ts";
import {Button, Dialog, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {EvaluationRow} from "@/features/evaluation/components/EvaluationRow.tsx";
import {evaluationApi} from "@/features/evaluation/api";
import {Evaluation} from "@/features/evaluation/types/evaluation.type.ts";
import {Icon} from "@/components/un-ui";
import {parseEvaluationHTML} from "@/features/evaluation/utils/parser.ts";
import {createDefaultReq, fillReq} from "@/features/evaluation/utils/reqBuilder.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useBatchProcessor} from "@/features/evaluation/hook/useBatchProcessor.ts";
import {EvaTeacherList} from "@/features/evaluation/types/schema/TeacherList.ts";
import {useJwAuth} from "@/core/auth/Jw/hooks/useJwAuth.ts";
import {AuthStateMap} from "@/core/auth/auth.type.ts";

const ProgressBar = ({progress, color}: {progress: number; color: string}) => {
    const progressPercent = Math.round(progress * 100);
    return (
        <View style={{height: 4, backgroundColor: "#e0e0e0", borderRadius: 2}}>
            <View style={{height: "100%", width: `${progressPercent}%`, backgroundColor: color, borderRadius: 2}} />
        </View>
    );
};

export function EvaluationOverview() {
    const {JWauthState} = useJwAuth();

    const {theme} = useTheme();
    const [evaList, setEvaList] = useState<EvaTeacherList[]>([]);
    const navigation = useNavigation();
    const colWidths = [8, 6, 5];

    const [isModalVisible, setIsModalVisible] = useState(false);
    const isCancelled = useRef(false);

    const handleRowPress = (item: EvaTeacherList) => {
        navigation.navigate("EvaluationDetail", {evaluationItem: item});
    };

    const defaultColor = Color.mix(
        Color(theme.colors.primary),
        Color(theme.colors.background),
        theme.mode === "dark" ? 0.1 : 0.4,
    ).setAlpha(theme.mode === "dark" ? 0.3 : 0.8).rgbaString;
    const softPrimaryBg = Color(theme.colors.primary)
        .setAlpha(theme.mode === "dark" ? 0.18 : 0.10)
        .rgbaString;
    const softPrimaryBorder = Color(theme.colors.primary)
        .setAlpha(theme.mode === "dark" ? 0.45 : 0.28)
        .rgbaString;
    const softPrimaryText = Color.mix(
        Color(theme.colors.primary),
        Color(theme.colors.black),
        theme.mode === "dark" ? 0.15 : 0.05,
    ).hexString;
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
                opcontainer:{

                    width:"100%",
                },
                opButton: {
                    backgroundColor: softPrimaryBg,
                    borderColor: softPrimaryBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    justifyContent:"center",

                },
                buttoText:{
                    color: softPrimaryText,
                    fontSize: 16,
                    fontWeight: "600",
                },
                submitButtonContainer: {
                    alignSelf: "center",
                    marginVertical: 4,
                },
                emptycontainer:{
                    alignItems:"center",
                    justifyContent:"center",
                    paddingVertical:60,
                    paddingHorizontal:24,
                },
                emptyTitle:{
                    textAlign:"center",
                    marginTop:12,
                    fontSize:18,
                    fontWeight:"bold",
                },
                emptyDoc:{
                    marginTop:8,
                    fontSize:14,
                    color:theme.colors.grey3,
                    textAlign:"center",
                    lineHeight:22
,                },
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
            if (cnt[item.submitStatus] !== undefined) {
                cnt[item.submitStatus]++;
            }
        });
        return cnt;
    }, [evaList]);

    const {isRunning, progress, progressText, setProgress, setProgressText, run, cancel} =
        useBatchProcessor<Evaluation>();

    const handleOneKey = async () => {
        const unEvaluatedList = evaList.filter(item => item.submitStatus !== "已评完");
        if (unEvaluatedList.length === 0) {
            ToastAndroid.show("所有项目均已评教，无需操作。", ToastAndroid.SHORT);
            return;
        }

        let temp: {selected: Record<string, Record<string, Record<string, number>>>; comment: string};
        try {
            const storedTemp = await AsyncStorage.getItem("@EvaluationTemplate");
            if (!storedTemp) throw new Error("未找到评教模板");
            temp = JSON.parse(storedTemp);
        } catch (e) {
            ToastAndroid.show("加载评教模板失败，请先设置模板。", ToastAndroid.LONG);
            navigation.navigate("EvaluationTemplate");
            return;
        }

        const task = async (item: EvaTeacherList, index: number, total: number) => {
            setProgressText(`(${index + 1}/${total}) ${item.courseName} - ${item.teacherName}`);
            setIsModalVisible(true);
            const HtmlText = await evaluationApi.getEvaluationDetail(
                item.securityToken,
                item.teachingClassId,
                item.courseId,
                item.courseTypeCode,
                item.rubricId,
            );
            const {idObj} = parseEvaluationHTML(HtmlText);
            const defReq = createDefaultReq(item, idObj);
            const reqToSend = fillReq(defReq, temp.selected, temp.comment, idObj);
            await evaluationApi.handleEvaResult(defReq, reqToSend);

            setProgress((index + 1) / total);
        };

        await run(unEvaluatedList, task);
        setIsModalVisible(false);
        await init();
    };

    const handleClear = async () => {
        const task = async (item: EvaTeacherList, index: number, total: number) => {
            setProgressText(`(${index + 1}/${total}) 清空: ${item.courseName}`);
            setIsModalVisible(true);
            const HtmlText = await evaluationApi.getEvaluationDetail(
                item.securityToken,
                item.teachingClassId,
                item.courseId,
                item.courseTypeCode,
                item.rubricId,
            );
            const {idObj} = parseEvaluationHTML(HtmlText);
            const defReq = createDefaultReq(item, idObj);
            await evaluationApi.handleEvaResult(defReq);

            setProgress((index + 1) / total);
        };

        await run(evaList, task);
        setIsModalVisible(false);
        await init();
    };

    const submit = async () => {
        const evaluationItem = evaList[0];
        const HtmlText = await evaluationApi.getEvaluationDetail(
            evaluationItem.securityToken,
            evaluationItem.teachingClassId,
            evaluationItem.courseId,
            evaluationItem.courseTypeCode,
            evaluationItem.rubricId,
        );
        const {idObj, selected} = parseEvaluationHTML(HtmlText);
        const defReq = createDefaultReq(evaluationItem, idObj);
        const reqToSend = fillReq(defReq, selected, "", idObj);
        await evaluationApi.submitEvaResult(defReq, reqToSend);
    };

    async function init() {
        try {
            if (JWauthState.status !== AuthStateMap.Authenticated) {
                Alert.alert("需要登录", "此操作需要登录教务系统", [
                    {text: "知道了", onPress: () => navigation.goBack()},
                ]);
                return;
            }

            const res = await evaluationApi.getEvaluationList();
            res.items.sort((a, b) => statusList.indexOf(a.submitStatus) - statusList.indexOf(b.submitStatus));
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
                </Flex>
                <View style={styles.opcontainer}>
                    <Button
                        buttonStyle={styles.opButton}
                        onPress={() => {
                          navigation.navigate("EvaluationTemplate");
                      }}>
                        <Text style={styles.buttoText}>自定义评价模板</Text>
                    </Button>
                        <Button buttonStyle={styles.opButton} onPress={handleOneKey}>
                            <Text style={styles.buttoText}>
                            应用自定义模板一键评价
                            </Text>
                        </Button>
                        <Button
                            buttonStyle={styles.opButton}
                            onPress={() => {handleClear();
                        }}><Text style={styles.buttoText}>
                        清空评价
                            </Text>
                    </Button>
                </View>
                <Table style={{width: "100%"}}>
                    <Row
                        data={["课程", "教师", "状态"]}
                        style={styles.header}
                        flexArr={colWidths}
                        textStyle={styles.headerText}
                    />
                    {evaList.map(item => (
                        <EvaluationRow
                            key={item.teachingClassId + item.securityToken}
                            item={item}
                            onPress={handleRowPress}
                            colWidths={colWidths}
                            colorMap={colorMap}
                        />
                    ))}
                </Table>
                evalist.length===0&&({
                <View style={styles.emptycontainer}>
                <Text style={styles.emptyTitle}>暂无待评价课程</Text>
                <Text style={styles.emptyDoc}>
                    当前可能未到期末学生评价开放时间，或所有课程暂未发布评价任务。
                </Text>
                </View>
            })
            </Flex>
            {evaList.length>=0&&(
                <View style={styles.submitButtonContainer}>
                    <Button
                        buttonStyle={styles.opButton}
                        onPress={handleClear}>
                        <Text style={styles.buttoText}>
                            提交
                        </Text>
                    </Button>
                </View>
            )}
        </ScrollView>
    );
}

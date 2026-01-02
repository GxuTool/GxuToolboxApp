import {useCallback, useMemo, useState} from "react";
import {ScrollView, StyleSheet} from "react-native";
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

export function EvaluationOverview() {
    const {theme} = useTheme();
    const [evaList, setEvaList] = useState<Evaluation[]>([]);
    const navigation = useNavigation();
    const {openInJw} = useWebView();
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
                <Text style={{fontSize: 14}}>请点击下方评价列表中的元素，进入详情页评价</Text>
                <Text style={{fontSize: 14}}>当前共有 {evaList.length} 项评价</Text>
                <Text style={{fontSize: 14}}>
                    其中 {statusCounts["已评完"]} 项已评完，
                    {statusCounts["未评完"]} 项未评完，
                    {statusCounts["未评"]} 项未评
                </Text>
                <Button
                    containerStyle={{width: "100%"}}
                    onPress={() => {
                        openInJw("/xspjgl/xspj_cxXspjIndex.html?doType=details&gnmkdm=N401605&layout=default");
                    }}>
                    前往教务查看
                </Button>
                <Button
                    containerStyle={{width: "100%"}}
                    onPress={() => {
                        navigation.navigate("EvaluationTemplate");
                    }}>
                    自定义评价模板
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

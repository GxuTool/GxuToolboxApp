import {KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import {useEffect, useState} from "react";
import {store} from "@/core/store.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {Picker} from "@react-native-picker/picker";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Color} from "@/shared/color.ts";
import {ExamInfoParsed} from "@/type/infoQuery/exam/examInfo.ts";
import {ExamInfoClass} from "@/class/jw/exam.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";

type ExamKeysType = keyof ExamInfoParsed;

export function ExamItemDetailSettingScreen() {
    const {store: ucStore} = useUserConfig();
    const {theme} = useTheme();
    const [examList, setExamList] = useState<ExamInfoParsed[]>([]);
    const [activeExamIndex, setActiveExamIndex] = useState(0);
    const activeExam = examList[activeExamIndex];

    const examDetail = ucStore(s => s.preference.examDetail);

    const style = StyleSheet.create({
        input: {
            color: theme.colors.black,
            backgroundColor: Color(theme.colors.grey2).setAlpha(0.1).rgbaString,
        },
        table: {
            marginVertical: 20,
        },
        tableText: {
            color: theme.colors.black,
        },
        tableRow: {
            height: 50,
        },
    });

    function editLabel(prop: ExamKeysType, label: string) {
        const s = ucStore.getState();
        ucStore.getState().update("preference", {
            ...s.preference,
            examDetail: {
                ...s.preference.examDetail,
                [prop]: { ...s.preference.examDetail[prop], label },
            },
        });
    }

    function toggleShow(prop: ExamKeysType) {
        const s = ucStore.getState();
        const newShow = !s.preference.examDetail[prop].show;
        ucStore.getState().update("preference", {
            ...s.preference,
            examDetail: {
                ...s.preference.examDetail,
                [prop]: { ...s.preference.examDetail[prop], show: newShow },
            },
        });
    }

    function save() {
        // save is now a no-op since updates are done via store.update
    }

    const table = {
        header: ["属性", "标签", "预览", "操作"],
        flex: [1, 1, 1, 1],
        showingProps: Object.entries(examDetail)
            .filter(prop => prop[1].show)
            .map(prop => [
                prop[0],
                <TextInput
                    style={style.input}
                    onChangeText={v => editLabel(prop[0] as ExamKeysType, v)}
                    onEndEditing={save}
                    placeholder="输入标签"
                    value={prop[1].label}
                />,
                <Text numberOfLines={2}>{activeExam?.[prop[0] as ExamKeysType] ?? ""}</Text>,
                <Button key={prop[0]} type="clear" onPress={() => toggleShow(prop[0] as ExamKeysType)}>
                    隐藏
                </Button>,
            ]),
        availableProps: Object.entries(examDetail)
            .filter(prop => !prop[1].show)
            .map(prop => [
                prop[0],
                <TextInput
                    style={style.input}
                    onChangeText={v => editLabel(prop[0] as ExamKeysType, v)}
                    onEndEditing={save}
                    placeholder="输入标签"
                    value={prop[1].label}
                />,
                <Text numberOfLines={2}>{activeExam?.[prop[0] as ExamKeysType] ?? ""}</Text>,
                <Button key={prop[0]} type="clear" onPress={() => toggleShow(prop[0] as ExamKeysType)}>
                    显示
                </Button>,
            ]),
    };

    async function init() {
        const examRes = await store.load({
            key: "examInfo",
        }).catch(e => {
            console.warn(e);
            return {};
        });
        const rawItems = examRes?.items ?? [];
        setExamList(rawItems.map((item: any) => new ExamInfoClass(item).transformed));
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <KeyboardAvoidingView style={{padding: "5%"}}>
            <ScrollView style={{paddingBottom: "5%", marginBottom: "5%", maxHeight: "93%"}}>
                <Flex gap={10}>
                    <Text>示例考试</Text>
                    <View style={{flex: 1}}>
                        <UnPicker selectedValue={activeExamIndex} onValueChange={setActiveExamIndex}>
                            {examList.map((exam, index) => (
                                <Picker.Item label={exam.courseName} value={index} key={`exam-${index}`} />
                            ))}
                        </UnPicker>
                    </View>
                </Flex>
                <Text>修改后请点击保存</Text>
                <Divider />
                <Text>已添加的条目</Text>
                <Table style={style.table}>
                    <Row style={style.tableRow} textStyle={style.tableText} data={table.header} flexArr={table.flex} />
                    <Rows style={style.tableRow} data={table.showingProps} textStyle={style.tableText} />
                </Table>
                <Divider />
                <Text>已添加的条目</Text>
                <Table style={style.table}>
                    <Row style={style.tableRow} textStyle={style.tableText} data={table.header} flexArr={table.flex} />
                    <Rows style={style.tableRow} data={table.availableProps} textStyle={style.tableText} />
                </Table>
            </ScrollView>
            <Button onPress={save}>保存</Button>
        </KeyboardAvoidingView>
    );
}

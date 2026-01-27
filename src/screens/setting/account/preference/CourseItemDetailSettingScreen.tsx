import {KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View} from "react-native";
import {Button, Divider, Text, useTheme} from "@rneui/themed";
import {useContext, useEffect, useState} from "react";
import {Course} from "@/type/infoQuery/course/course.ts";
import {store} from "@/core/store.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {Picker} from "@react-native-picker/picker";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Color} from "@/shared/color.ts";
import {defaultUserConfig} from "@/type/IUserConfig.ts";

type CourseKeysType = keyof Omit<Course, "queryModel" | "userModel">;

export function CourseItemDetailSettingScreen() {
    const {userConfig, updateUserConfig} = useContext(UserConfigContext);
    const {theme} = useTheme();
    const [courseList, setCourseList] = useState<Course[]>([]);
    const [activeCourseIndex, setActiveCourseIndex] = useState(0);
    const activeCourse = courseList[activeCourseIndex];

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

    function editLabel(prop: CourseKeysType, label: string) {
        userConfig.preference.courseDetail[prop].label = label;
    }

    function toggleShow(prop: CourseKeysType) {
        userConfig.preference.courseDetail[prop].show = !userConfig.preference.courseDetail[prop].show;
        save();
    }

    function save() {
        updateUserConfig(userConfig);
    }

    const table = {
        header: ["属性", "标签", "预览", "操作"],
        flex: [1, 1, 1, 1],
        showingProps: Object.entries(userConfig.preference.courseDetail)
            .filter(prop => prop[1].show)
            .map(prop => [
                prop[0],
                <TextInput
                    style={style.input}
                    onChangeText={v => editLabel(prop[0] as CourseKeysType, v)}
                    onEndEditing={save}
                    placeholder="输入标签"
                    value={prop[1].label}
                />,
                <Text numberOfLines={2}>{activeCourse?.[prop[0] as CourseKeysType] ?? ""}</Text>,
                <Button key={prop[0]} type="clear" onPress={() => toggleShow(prop[0] as CourseKeysType)}>
                    隐藏
                </Button>,
            ]),
        availableProps: Object.entries(userConfig.preference.courseDetail)
            .filter(prop => !prop[1].show)
            .map(prop => [
                prop[0],
                <TextInput
                    style={style.input}
                    onChangeText={v => editLabel(prop[0] as CourseKeysType, v)}
                    onEndEditing={save}
                    placeholder="输入标签"
                    value={prop[1].label}
                />,
                <Text numberOfLines={2}>{activeCourse?.[prop[0] as CourseKeysType] ?? ""}</Text>,
                <Button key={prop[0]} type="clear" onPress={() => toggleShow(prop[0] as CourseKeysType)}>
                    显示
                </Button>,
            ]),
    };

    async function init() {
        const courseRes = await store.load({
            key: "courseRes",
        }).catch(e => {
            console.warn(e);
            return {};
        });
        setCourseList(courseRes?.kbList ?? []);
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <KeyboardAvoidingView style={{padding: "5%"}}>
            <ScrollView style={{paddingBottom: "5%", marginBottom: "5%", maxHeight: "93%"}}>
                <Flex gap={10}>
                    <Text>示例课程</Text>
                    <View style={{flex: 1}}>
                        <UnPicker selectedValue={activeCourseIndex} onValueChange={setActiveCourseIndex}>
                            {courseList.map((course, index) => (
                                <Picker.Item label={course.kcmc} value={index} key={`course-${index}`} />
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

import {Course} from "@/type/infoQuery/course/course.ts";
import {Linking, StyleSheet, ToastAndroid, View, ViewProps} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import React, {createContext, useContext, useState} from "react";
import {Color} from "@/shared/color.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {TeacherInfoSheet} from "@/components/tool/infoQuery/courseSchedule/TeacherInfoSheet.tsx";
import {Icon, UnJsonEditor, UnPressable, UnText} from "@/components/un-ui";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";
import {Pos} from "@/js/pos.ts";

const CourseContext = createContext<Course | null>(null);

interface Props extends ViewProps {
    course: Course;
}

interface Info {
    label: string;
    key: keyof Omit<Course, "queryModel" | "userModel">;
}

function copy(value: string, tip: string) {
    Clipboard.setString(value);
    ToastAndroid.show(tip, ToastAndroid.SHORT);
}

function PropItem({item, ...props}: {item: Info}) {
    const {theme} = useTheme();
    const label = item.label;
    const course = (useContext(CourseContext)! as any)._ori ?? useContext(CourseContext)!;
    const value = course[item.key] ?? "";
    const style = StyleSheet.create({
        infoIcon: {
            width: 20,
        },
        infoLabel: {
            fontSize: 20,
            fontWeight: "bold",
        },
        infoData: {
            fontSize: 16,
        },
    });
    const info = {
        label: <Text style={style.infoLabel}>{label}</Text>,
        value: (
            <UnPressable
                onPress={function () {
                    return copy(value + "", "复制" + item.label + "成功");
                }}>
                <Text style={style.infoData}>{value}</Text>
            </UnPressable>
        ),
    };
    switch (item.key) {
        case "cdmc":
            info.label = (
                <UnPressable
                    onPress={function () {
                        return Pos.parseAndSearchInMap(value + "");
                    }}>
                    <Flex gap={5} align="center">
                        <Text style={style.infoLabel}>{label}</Text>
                        <Icon
                            type="Ionicon"
                            name="navigate"
                            style={{transform: [{translateY: 4}]}}
                            color={Color.mix(theme.colors.primary, theme.colors.black).rgbaString}
                            size={20}
                        />
                    </Flex>
                </UnPressable>
            );
            break;
        case "xm":
            info.label = (
                <UnPressable
                    onPress={function () {
                        return props.onClick();
                    }}>
                    <Flex gap={5} align="center">
                        <Text style={style.infoLabel}>{label}</Text>
                    </Flex>
                </UnPressable>
            );
    }
    return (
        <Flex justify="space-between" gap={30}>
            <Flex gap={10} inline>
                {info.label}
            </Flex>
            <Flex justify="flex-end">{info.value}</Flex>
        </Flex>
    );
}

export function CourseDetail(props: Props) {
    const [visible, setVisible] = useState(false);

    const {theme} = useTheme();
    const {store} = useUserConfig();
    const devMode = store(s => s.devMode);
    return (
        <CourseContext.Provider value={props.course}>
            <Flex {...props} gap={16} direction="column">
                <CourseInfoCard />
                <Flex justify="center">
                    <Text>点击属性，复制到剪切板</Text>
                </Flex>
                <Flex gap={10}>
                    <CoursePropItem prop="kcmc" label="课程名称" />
                    <CoursePropItem
                        prop="cdmc"
                        label="上课地点"
                        valueRender={(v, course) => <UnText>{course["lh"] + v}</UnText>}
                        labelRender={v => (
                            <UnPressable onPress={() => Pos.parseAndSearchInMap(v)}>
                                <Flex gap={5} align="center" inline>
                                    <UnText weight="bold" size={16}>
                                        上课地点
                                    </UnText>
                                    <Icon
                                        type="Ionicon"
                                        name="navigate"
                                        color={Color.mix(theme.colors.primary, theme.colors.black).rgbaString}
                                        size={16}
                                    />
                                </Flex>
                            </UnPressable>
                        )}
                    />
                </Flex>
                <Flex gap={10}>
                    <CoursePropItem
                        prop="xm"
                        label="上课教师"
                        valueRender={v => <UnText>{v}</UnText>}
                        labelRender={() => (
                            <UnPressable onPress={() => setVisible(true)}>
                                <UnText weight="bold" size={16}>
                                    上课教师
                                </UnText>
                            </UnPressable>
                        )}
                    />
                    <CoursePropItem prop="khfsmc" label="考核方式" />
                    <CoursePropItem prop="xf" label="学分" />
                </Flex>
                <Flex gap={10}>
                    <CoursePropItem prop="xkrs" label="选课人数" />
                    <CoursePropItem prop="zzrl" label="座位数" />
                    <CoursePropItem
                        prop="qqqh"
                        label="QQ群"
                        labelRender={() => (
                            <Flex gap={5} align="center" inline>
                                <UnText weight="bold" size={16}>
                                    QQ群
                                </UnText>
                                <Icon
                                    name="open-in-new"
                                    color={Color.mix(theme.colors.primary, theme.colors.black).rgbaString}
                                    size={16}
                                />
                            </Flex>
                        )}
                        onClick={async qq => {
                            const url = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}&card_type=group&source=qrcode`;
                            await Linking.openURL(url).catch(e => {
                                console.error(e);
                                ToastAndroid.show("无法直接跳转QQ，已将QQ群号复制至剪切板", ToastAndroid.SHORT);
                                Clipboard.setString(qq);
                            });
                        }}
                    />
                </Flex>
                <TeacherInfoSheet isVisible={visible} name={props.course.xm} onClose={() => setVisible(false)} />
                {devMode && <CourseDebugCard />}
            </Flex>
        </CourseContext.Provider>
    );
}

function CourseInfoCard() {
    const course = useContext(CourseContext)!;
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(getColor({title: course.kcmc})).setAlpha(theme.mode === "light" ? 0.5 : 0.3)
                .rgbaString,
        },
    });
    return (
        <View style={styles.card}>
            <UnText weight="bold" size={16}>
                {course.kcmc}
            </UnText>
            <UnText size={12} color={theme.colors.grey1}>
                {course.cdmc}，{course.xm}，{course.kclb}，{course.khfsmc}，{course.kcbj}，{course.xqjmc}
                {course.jcs}节，{course.zcd}
            </UnText>
        </View>
    );
}

function CourseDebugCard() {
    const course = useContext(CourseContext);
    const {theme} = useTheme();
    const [modalOpen, setModalOpen] = useState(false);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(theme.colors.error).setAlpha(theme.mode === "light" ? 0.5 : 0.3).rgbaString,
        },
    });
    return (
        <Flex>
            <UnPressable
                onPress={function () {
                    return setModalOpen(true);
                }}>
                <Flex style={styles.card} justify="flex-start" gap={4}>
                    <Icon name="console" size={16} inline />
                    <UnText weight="bold" size={16}>
                        查看课程数据
                    </UnText>
                </Flex>
            </UnPressable>
            <UnJsonEditor.Modal readOnly visible={modalOpen} onClose={() => setModalOpen(false)} value={course} />
        </Flex>
    );
}

function CoursePropItem<K extends keyof Course>(props: {
    prop: K;
    label: string;
    labelRender?: (value: Course[K], item: Course) => React.ReactNode;
    valueRender?: (value: Course[K], item: Course) => React.ReactNode;
    onClick?: (value: Course[K], item: Course) => void;
}) {
    const course = useContext(CourseContext)!;

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
        },
    });
    const value = course[props.prop];
    const labelNode = props.labelRender ? (
        props.labelRender(value, course)
    ) : (
        <UnText weight="bold" size={16}>
            {props.label}
        </UnText>
    );
    const valueNode = props.valueRender ? (
        props.valueRender(value, course)
    ) : (
        <UnText numberOfLines={4}>{value.toString() || "-"}</UnText>
    );
    return (
        <UnPressable
            style={{flex: 1}}
            onPress={function () {
                return props.onClick !== undefined
                    ? props.onClick(value, course)
                    : copy(value.toString() || "-", "复制" + props.label + "成功");
            }}>
            <Flex direction="column" style={styles.card} gap={4} align="flex-start">
                {labelNode}
                {valueNode}
            </Flex>
        </UnPressable>
    );
}

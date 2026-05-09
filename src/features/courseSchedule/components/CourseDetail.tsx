import {Course} from "@/type/infoQuery/course/course.ts";
import {Pressable, StyleSheet, ToastAndroid, ViewProps} from "react-native";
import {Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import React, {useState} from "react";
import {Color} from "@/shared/color.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {TeacherInfoSheet} from "@/components/tool/infoQuery/courseSchedule/TeacherInfoSheet.tsx";
import {Icon, UnText} from "@/components/un-ui";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";

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

function PropItem({item, ...props}: {item: Info} & Props) {
    const {store} = useUserConfig();
    const ripple = store(s => s.theme.ripple);
    const {theme} = useTheme();
    const label = item.label;
    const course = (props.course as any)._ori ?? props.course;
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
            <Pressable android_ripple={ripple} onPress={() => copy(value + "", `复制${item.label}成功`)}>
                <Text style={style.infoData}>{value}</Text>
            </Pressable>
        ),
    };
    switch (item.key) {
        case "cdmc":
            info.label = (
                <Pressable android_ripple={ripple} onPress={() => Pos.parseAndSearchInMap(value + "")}>
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
                </Pressable>
            );
            break;
        case "xm":
            info.label = (
                <Pressable android_ripple={ripple} onPress={() => props.onClick()}>
                    <Flex gap={5} align="center">
                        <Text style={style.infoLabel}>{label}</Text>
                    </Flex>
                </Pressable>
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
    const infoList = Object.entries(store(s => s.preference.courseDetail))
        .filter(prop => prop[1].show)
        .map(
            ([key, {label}]) =>
                ({
                    key,
                    label,
                }) as Info,
        );
    return (
        <Flex {...props} gap={4} direction="column">
            <CourseInfoCard course={props.course} />
            <Flex justify="center">
                <Text>点击属性，复制到剪切板</Text>
            </Flex>
            <Flex gap={10}>
                <CoursePropItem course={props.course} prop="kcmc" label="课程名称" />
                <CoursePropItem course={props.course} prop="cdmc" label="上课地点" />
            </Flex>
            <Flex gap={10}>
                <CoursePropItem course={props.course} prop="xm" label="上课教师" />
                <CoursePropItem course={props.course} prop="khfsmc" label="考核方式" />
                <CoursePropItem course={props.course} prop="xf" label="学分" />
            </Flex>
            <Flex gap={10}>
                <CoursePropItem course={props.course} prop="xkrs" label="选课人数" />
                <CoursePropItem course={props.course} prop="zzrl" label="座位数" />
                <CoursePropItem course={props.course} prop="qqqh" label="QQ群" />
            </Flex>
            <TeacherInfoSheet isVisible={visible} name={props.course.xm} onClose={() => setVisible(false)} />
            <CourseDebugCard course={props.course}/>
        </Flex>
    );
}

function CourseInfoCard(props: {course: Course}) {
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(getColor({title: props.course.kcmc})).setAlpha(theme.mode === "light" ? 0.5 : 0.3)
                .rgbaString,
        },
    });
    return (
        <Flex direction="column" style={styles.card} align="flex-start">
            <UnText weight="bold" size={16}>
                {props.course.kcmc}
            </UnText>
            <UnText size={12} color={theme.colors.grey1}>
                {props.course.cdmc}，{props.course.xm}，{props.course.kclb}，{props.course.khfsmc}，{props.course.kcbj}
                ，{props.course.xqjmc}
                {props.course.jcs}节，{props.course.zcd}
            </UnText>
        </Flex>
    );
}
function CourseDebugCard(props: {course: Course}) {
    const {theme} = useTheme();
    const [modalOpen, setModalOpen] = useState(false);
    const {store} = useUserConfig();
    const androidRipple = store(s => s.theme.ripple);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(theme.colors.error).setAlpha(theme.mode === "light" ? 0.5 : 0.3).rgbaString,
        },
    });
    return (
        <>
            <Pressable android_ripple={androidRipple} onPress={() => setModalOpen(true)}>
                <Flex style={styles.card} justify="flex-start" gap={4} inline>
                    <Icon name="console" size={16} inline />
                    <UnText weight="bold" size={16}>
                        查看课程数据
                    </UnText>
                </Flex>
            </Pressable>
        </>
    );
}

function CoursePropItem<K extends keyof Course>(props: {
    course: Course;
    prop: K;
    label: string;
    labelRender?: (value: Course[K], item: Course) => React.ReactNode;
    valueRender?: (value: Course[K], item: Course) => React.ReactNode;
    onClick?: (value: Course[K], item: Course) => void;
}) {
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();
    const {store} = useUserConfig();
    const androidRipple = store(s => s.theme.ripple);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
        },
    });
    const value = props.course[props.prop];
    return (
        <Pressable
            android_ripple={androidRipple}
            style={{flex: 1}}
            onPress={() =>
                props.onClick
                    ? props.onClick(value, props.course)
                    : copy(value.toString() || "-", `复制${props.label}成功`)
            }>
            <Flex direction="column" style={styles.card} gap={4} align="flex-start">
                <UnText weight="bold" size={16}>
                    {props.label}
                </UnText>
                <UnText numberOfLines={4}>{value.toString() || "-"}</UnText>
            </Flex>
        </Pressable>
    );
}

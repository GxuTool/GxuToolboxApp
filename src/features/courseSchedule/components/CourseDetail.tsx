import {Course} from "@/type/infoQuery/course/course.ts";
import {Pressable, StyleSheet, ToastAndroid, View, ViewProps} from "react-native";
import {ListItem, Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import React, {useState} from "react";
import {Color} from "@/shared/color.ts";
import {Pos} from "@/js/pos.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {TeacherInfoSheet} from "@/components/tool/infoQuery/courseSchedule/TeacherInfoSheet.tsx";

interface Props extends ViewProps {
    course: Course;
    onClick: () => void;
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
    StyleSheet.create({
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
    return (
        <View {...props}>
            <Flex justify="center">
                <Text>点击属性，复制到剪切板</Text>
            </Flex>
            {infoList.map((item, index) => (
                <ListItem bottomDivider={index !== infoList.length - 1} key={index}>
                    <PropItem item={item} {...props} onClick={() => setVisible(true)} />
                </ListItem>
            ))}
            <ListItem>
                {/*<Flex justify="space-between" gap={30}>*/}
                {/*    <Flex gap={10} inline>*/}
                {/*        <Flex inline justify="center" style={style.infoIcon}>*/}
                {/*            <Icon type="fontawesome" name="code" size={20} />*/}
                {/*        </Flex>*/}
                {/*        <Text style={style.infoLabel}>复制课程信息JSON</Text>*/}
                {/*    </Flex>*/}
                {/*    <Flex justify="flex-end">*/}
                {/*        <Pressable*/}
                {/*            android_ripple={userConfig.theme.ripple}*/}
                {/*            onPress={() =>*/}
                {/*                copy(JSON.stringify(props.course, null, 4) + "" ?? "", "复制课程信息JSON成功")*/}
                {/*            }>*/}
                {/*            <Text style={style.infoData}>&#123; ... &#125;</Text>*/}
                {/*        </Pressable>*/}
                {/*    </Flex>*/}
                {/*</Flex>*/}
            </ListItem>
            <TeacherInfoSheet isVisible={visible} name={props.course.xm} onClose={() => setVisible(false)} />
        </View>
    );
}

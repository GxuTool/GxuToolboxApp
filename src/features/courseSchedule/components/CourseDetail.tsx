import {Course} from "@/type/infoQuery/course/course.ts";
import {Pressable, StyleSheet, ToastAndroid, View, ViewProps} from "react-native";
import {ListItem, Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import {Color} from "@/shared/color.ts";
import {Pos} from "@/js/pos.ts";
import {useUserConfig} from "@/hooks/app.ts";

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
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();
    const label = item.label;
    const value = props.course[item.key] ?? "";
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
            <Pressable
                android_ripple={userConfig.theme.ripple}
                onPress={() => copy(value + "", `复制${item.label}成功`)}>
                <Text style={style.infoData}>{value}</Text>
            </Pressable>
        ),
    };
    switch (item.key) {
        case "cdmc":
            info.label = (
                <Pressable android_ripple={userConfig.theme.ripple} onPress={() => Pos.parseAndSearchInMap(value + "")}>
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
    const {userConfig} = useUserConfig();
    const infoList = Object.entries(userConfig.preference.courseDetail)
        .filter(prop => prop[1].show)
        .map(
            ([key, {label}]) =>
                ({
                    key,
                    label,
                } as Info),
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
                    <PropItem item={item} {...props} />
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
        </View>
    );
}

import {Pressable, StyleSheet, ToastAndroid, View, ViewProps} from "react-native";
import {ListItem, Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import React, {useContext} from "react";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {Pos} from "@/js/pos.ts";
import {Color} from "@/shared/color.ts";

interface Props extends ViewProps {
    examInfo: ExamInfo;
}

interface Info {
    label: string;
    key: keyof Omit<ExamInfo, "queryModel" | "userModel">;
}

function copy(value: string, tip: string) {
    Clipboard.setString(value);
    ToastAndroid.show(tip, ToastAndroid.SHORT);
}

function PropItem({item, ...props}: {item: Info} & Props) {
    const {userConfig} = useContext(UserConfigContext);
    const {theme} = useTheme();
    const label = item.label;
    const value = props.examInfo[item.key] ?? "";
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

export function ExamDetail(props: Props) {
    const {userConfig} = useContext(UserConfigContext);
    const infoList = Object.entries(userConfig.preference.examDetail)
        .filter(prop => prop[1].show)
        .map(
            ([key, {label}]) =>
                ({
                    key,
                    label,
                } as Info),
        );

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

    return (
        <View {...props}>
            <Flex justify="center">
                <Text>点击属性复制到剪切板</Text>
            </Flex>
            {infoList.map((item, index) => (
                <ListItem bottomDivider={index !== infoList.length - 1} key={index}>
                    <PropItem item={item} {...props} />
                </ListItem>
            ))}
            <ListItem>
                <Flex justify="space-between" gap={30}>
                    <Flex gap={10} inline>
                        <Flex inline justify="center" style={style.infoIcon}>
                            <Icon type="fontawesome" name="code" size={20} />
                        </Flex>
                        <Text style={style.infoLabel}>复制考试信息JSON</Text>
                    </Flex>
                    <Flex justify="flex-end">
                        <Pressable
                            android_ripple={userConfig.theme.ripple}
                            onPress={() =>
                                copy(JSON.stringify(props.examInfo, null, 4) + "" ?? "", "复制考试信息JSON成功")
                            }>
                            <Text style={style.infoData}>&#123; ... &#125;</Text>
                        </Pressable>
                    </Flex>
                </Flex>
            </ListItem>
        </View>
    );
}

import {Pressable, StyleSheet, ToastAndroid, View, ViewProps} from "react-native";
import {ListItem, Text} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import {IActivity} from "@/type/app/activity.ts";
import {useUserConfig} from "@/hooks/app.ts";

interface Props extends ViewProps {
    activity: IActivity;
}

interface Info {
    label: string;
    key: keyof IActivity;
    render?: (v: any, record: IActivity) => any;
}

function copy(value: string, tip: string) {
    Clipboard.setString(value);
    ToastAndroid.show(tip, ToastAndroid.SHORT);
}

function PropItem({item, ...props}: {item: Info} & Props) {
    const {userConfig} = useUserConfig();
    const label = item.label;
    const value = item.render !== undefined ? item.render(props.activity[item.key], props.activity) : props.activity[item.key];
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
                onPress={() => typeof value === "string" && copy(value + "", `复制${item.label}成功`)}>
                <Text style={style.infoData}>{value}</Text>
            </Pressable>
        ),
    };
    return (
        <Flex justify="space-between" gap={30}>
            <Flex gap={10} inline>
                {info.label}
            </Flex>
            <Flex justify="flex-end">{info.value}</Flex>
        </Flex>
    );
}

export function ActivityDetail(props: Props) {
    const infoList: Info[] = [
        {key: "name", label: "活动名称"},
        {key: "weekSpan", label: "周数", render: v=>`第${v[0]}周至第${v[1]}周`},
        {key: "timeSpan", label: "节次", render: v=>`第${v[0]}节至第${v[1]}节`},
        {key: "desc", label: "活动描述"},
    ];

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
        </View>
    );
}

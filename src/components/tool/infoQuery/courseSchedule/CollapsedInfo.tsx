import {Pressable, StyleSheet, View} from "react-native";
import {useTheme} from "@rneui/themed";
import {UnText} from "@/components/un-ui";
import React from "react";
import {useUserConfig} from "@/hooks/app.ts";

type Data = {
    label: string;
    value: string;
};

interface Props {
    info: Data;
    isCollapsed: Boolean;
    onClick?: () => void;
}

export function CollapsedInfo(props: React.PropsWithChildren<Props>) {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const style = StyleSheet.create({
        infoContainer: {
            height: "auto",
        },
        rowContainer: {
            flexDirection: "row",
            gap: 10,
        },
        columContainer: {
            flexDirection: "column",
            gap: 6,
        },
        dividerContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 2,
        },
        dividerItem: {
            flex: 1,
            height: 1,
            backgroundColor: theme.colors.primary,
        },
    });

    return (
        <View style={style.infoContainer}>
            {!props.isCollapsed && props.children}
            <Pressable
                android_ripple={userConfig.theme.ripple}
                style={{marginHorizontal: 8}}
                onPress={() => {
                    props.onClick();
                }}>
                <View style={style.dividerContainer}>
                    <View style={style.dividerItem} />
                    <UnText>{props.isCollapsed ? "展开↓" : "收起↑"}</UnText>
                    <View style={style.dividerItem} />
                </View>
            </Pressable>
        </View>
    );
}

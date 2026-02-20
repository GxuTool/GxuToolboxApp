import {TooltipProps} from "@rneui/base";
import React, {useState} from "react";
import {Tooltip, useTheme} from "@rneui/themed";
import {Pressable} from "react-native";
import {useUserConfig} from "@/hooks/app.ts";

export function UnTooltip(props: React.PropsWithChildren<TooltipProps>) {
    const {userConfig} = useUserConfig();
    const [open, setOpen] = useState(props.visible ?? false);
    const {theme} = useTheme();
    return (
        <Tooltip
            highlightColor={theme.colors.grey4}
            backgroundColor={theme.colors.grey5}
            visible={open}
            withPointer={false}
            withOverlay={false}
            {...props}
            onClose={() => {
                setOpen(false);
                props.onClose?.();
            }}
            onOpen={() => {
                setOpen(true);
                props.onOpen?.();
            }}>
            <Pressable android_ripple={userConfig.theme.ripple} onPress={() => setOpen(!open)}>
                {props.children}
            </Pressable>
        </Tooltip>
    );
}

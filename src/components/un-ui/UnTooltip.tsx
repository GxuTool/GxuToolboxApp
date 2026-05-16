import {TooltipProps} from "@rneui/base";
import React, {useState} from "react";
import {Tooltip, useTheme} from "@rneui/themed";
import {UnPressable} from "@/components/un-ui";
import {Color} from "@/shared/color.ts";

export function UnTooltip(props: React.PropsWithChildren<TooltipProps>) {
    const [open, setOpen] = useState(props.visible ?? false);
    const {theme} = useTheme();
    return (
        <Tooltip
            highlightColor={Color.mix(theme.colors.grey4, theme.colors.background, 0.5).rgbaString}
            backgroundColor={Color.mix(theme.colors.grey5, theme.colors.background, 0.4).rgbaString}
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
            <UnPressable onPress={() => setOpen(!open)}>
                {props.children}
            </UnPressable>
        </Tooltip>
    );
}

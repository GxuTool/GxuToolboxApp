import {TooltipProps} from "@rneui/base";
import {useState} from "react";
import {Tooltip, useTheme} from "@rneui/themed";

export function UnTooltip(props: TooltipProps) {
    const [open, setOpen] = useState(props.visible ?? false);
    const {theme} = useTheme();
    return (
        <Tooltip
            highlightColor={theme.colors.grey4}
            backgroundColor={theme.colors.grey5}
            visible={open}
            withPointer={false}
            withOverlay={false}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            {...props}
        />
    );
}

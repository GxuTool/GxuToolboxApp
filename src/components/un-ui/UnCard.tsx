import {StyleSheet, View, ViewProps} from "react-native";
import {useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import {UnText} from "@/components/un-ui/UnText.tsx";

export interface UnCardProps extends ViewProps {
    color?: "primary" | "success" | "secondary" | "warning" | "error" | string;
    title?: string;
}
export function UnCard(props: UnCardProps) {
    const {theme} = useTheme();

    const mainColor = ["primary", "success", "secondary", "warning", "error", undefined].includes(props.color)
        ? theme.colors[props.color ?? "primary"]
        : props.color;
    const style = StyleSheet.create({
        card: {
            backgroundColor: Color.mix(mainColor, theme.colors.background, 0.5).setAlpha(0.5).rgbaString,
            borderRadius: 8,
            padding: 8,
        },
        titleContainer: {
            paddingHorizontal: 8,
            marginBottom: 8,
        },
    });

    return (
        <View {...props} style={[props.style, style.card]}>
            {props.title && (
                <View style={style.titleContainer}>
                    <UnText h4 color={Color.mix(mainColor, theme.colors.black, 0.4).rgbaString}>
                        {props.title}
                    </UnText>
                </View>
            )}
            {props.children}
        </View>
    );
}

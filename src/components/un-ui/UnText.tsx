import {TextProps} from "@rneui/base";
import {Text, useTheme} from "@rneui/themed";
import {TextStyle} from "react-native";

interface Props {
    size?: TextStyle["fontSize"];
    color?: TextStyle["color"];
    weight?: TextStyle["fontWeight"];
    align?: TextStyle["textAlign"];
    lineHeight?: TextStyle["lineHeight"];
    bold?: boolean;
}

export type UnTextProps = Props & TextProps;

export function UnText(props: UnTextProps) {
    const {theme} = useTheme();
    const {size, color, weight, align, lineHeight, bold, style, ...rest} = props;

    return (
        <Text
            {...rest}
            style={[
                {
                    fontSize: size,
                    color: color ?? theme.colors.black,
                    fontWeight: bold ? "bold" : weight,
                    textAlign: align,
                    lineHeight,
                },
                style,
            ]}
        />
    );
}

import {TextProps} from "@rneui/base";
import {Text, useTheme} from "@rneui/themed";
import {TextStyle} from "react-native";

interface Props {
    size?: TextStyle["fontSize"];
    color?: TextStyle["color"];
}

export type UnTextProps = Props & TextProps;

export function UnText(props: UnTextProps) {
    const {theme} = useTheme();
    return (
        <Text
            {...props}
            style={[
                {
                    fontSize: props.size,
                    color: props.color ?? theme.colors.black,
                },
                props.style,
            ]}
        />
    );
}

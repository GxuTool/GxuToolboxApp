import { FlexAlignType, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import React, { useMemo } from "react";

export interface FlexProps extends ViewProps {
    gap?: number;
    inline?: boolean;
    flex?: number;
    direction?: "row" | "column" | "row-reverse" | "column-reverse";
    align?: FlexAlignType;
    justify?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly";
}

const Flex: React.FC<FlexProps> = ({
    gap = 0,
    inline = false,
    flex,
    direction = "row",
    align = "center",
    justify = "flex-start",
    style,
    children,
    ...restProps
}) => {
    const flexValue = flex !== undefined ? flex : (inline ? undefined : 1);

    const flexStyle = useMemo<StyleProp<ViewStyle>>(
        () => ({
            flex: flexValue,
            alignSelf: "stretch",
            flexDirection: direction,
            gap,
            alignItems: align,
            justifyContent: justify,
        }),
        [flexValue, direction, gap, align, justify]
    );

    return (
        <View {...restProps} style={[style, flexStyle]}>
            {children}
        </View>
    );
};

export default Flex;

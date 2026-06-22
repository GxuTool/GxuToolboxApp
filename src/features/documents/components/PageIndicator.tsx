import {StyleSheet, View} from "react-native";
import {useTheme} from "@rneui/themed";
import {vh} from "@/components/un-ui";

type Props = {
    totalPages: number;
    activePage: number;
};

export function PageIndicator(props: Props) {
    const {theme} = useTheme();

    const style = StyleSheet.create({
        container: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            paddingVertical: vh(1),
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
    });

    return (
        <View style={style.container}>
            {Array.from({length: props.totalPages}, (_, i) => (
                <View
                    key={i}
                    style={[
                        style.dot,
                        {
                            backgroundColor:
                                i === props.activePage ? theme.colors.primary : theme.colors.grey5,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

import {TouchableOpacity} from "react-native";
import {UnText, vh, vw} from "@/components/un-ui";

type Props = {
    label: string;
    onClick: () => void;
};

export function Letter(props: Props) {
    return (
        <TouchableOpacity
            style={{
                width: vw(17),
                height: vh(5),
                marginVertical: 4,
                alignItems: "center",
                justifyContent: "center",
            }}
            onPress={() => {
                props.onClick();
            }}>
            <UnText size={20}>{props.label}</UnText>
        </TouchableOpacity>
    );
}

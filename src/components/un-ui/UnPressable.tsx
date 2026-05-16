import { Pressable, PressableProps } from "react-native";
import { useUserConfig } from "@/hooks/useUserConfig";

export type UnPressableProps = PressableProps;

export function UnPressable(props: UnPressableProps) {
    var store = useUserConfig().store;
    var ripple = store(function (s) { return s.theme.ripple; });

    var android_ripple = props.android_ripple !== undefined ? props.android_ripple : ripple;

    return <Pressable {...props} android_ripple={android_ripple} />;
}

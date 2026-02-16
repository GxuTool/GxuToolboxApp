import {Pressable, StyleSheet, TextInput, View} from "react-native";
import Flex from "./Flex.tsx";
import {Icon} from "./Icon.tsx";
import {Color} from "@/shared/color.ts";
import {useRef} from "react";
import {useTheme} from "@rneui/themed";
import {useUserConfig} from "@/hooks/app.ts";

export interface NumberInputProps {
    value: number;
    onChange?: (value: number) => void;
    onSubmit?: (value: number) => void;
    onBlur?: () => void;
    min?: number;
    max?: number;
    step?: number;
    size?: number;
    autoFocus?: boolean;
}

export function NumberInput(props: NumberInputProps) {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const style = StyleSheet.create({
        container: {
            borderColor: theme.colors.grey4,
            borderWidth: 1,
            borderRadius: 5,
            height: props.size ?? 30,
            backgroundColor: Color(theme.colors.black).setAlpha(0.1).rgbaString,
        },
        leftIcon: {
            width: props.size ?? 30,
            height: "100%",
            borderRightWidth: 1,
            borderRightColor: theme.colors.grey4,
            backgroundColor:
                props.value <= (props.min ?? Number.MIN_SAFE_INTEGER)
                    ? Color(theme.colors.grey5).setAlpha(0.7).rgbaString
                    : undefined,
        },
        input: {
            paddingHorizontal: 10,
            color: theme.colors.black,
            marginVertical: -10,
        },
        rightIcon: {
            width: props.size ?? 30,
            height: "100%",
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.grey4,
            backgroundColor:
                props.value >= (props.max ?? Number.MAX_SAFE_INTEGER)
                    ? Color(theme.colors.grey5).setAlpha(0.7).rgbaString
                    : undefined,
        },
    });

    const inputRef = useRef<TextInput>(null);

    function plus() {
        if (props.max && props.value >= props.max) return;
        props.onChange?.(props.value + (props.step ?? 1));
    }

    function minus() {
        if (props.min && props.value <= props.min) return;
        props.onChange?.(props.value - (props.step ?? 1));
    }

    return (
        <Flex style={style.container} inline>
            <Pressable
                android_ripple={userConfig.theme.ripple}
                onPressIn={e => e.stopPropagation()}
                onPress={minus}
                disabled={props.value <= (props.min ?? Number.MIN_SAFE_INTEGER)}>
                <Flex style={style.leftIcon} inline justify="center">
                    <Icon
                        name="minus"
                        size={(props.size ?? 30) / 2}
                        color={
                            props.value <= (props.min ?? Number.MIN_SAFE_INTEGER)
                                ? Color(theme.colors.black).setAlpha(0.5).rgbaString
                                : undefined
                        }
                    />
                </Flex>
            </Pressable>
            <View>
                <TextInput
                    blurOnSubmit={true}
                    onSubmitEditing={v => {
                        if (v.nativeEvent.text === "") {
                            props.onSubmit?.(props.min ?? 0);
                        }
                        const num = parseFloat(v.nativeEvent.text);
                        if (!isNaN(num)) {
                            props.onSubmit?.(num);
                        }
                    }}
                    value={props.value.toString()}
                    ref={inputRef}
                    inputMode="numeric"
                    autoFocus={props.autoFocus}
                    onBlur={props.onBlur}
                    onChangeText={v => {
                        if (v === "") {
                            props.onChange?.(props.min ?? 0);
                        }
                        const num = parseFloat(v.replace(/[^0-9-.]/g, ""));
                        props.onChange?.(num);
                    }}
                    style={style.input}
                />
            </View>
            <Pressable
                android_ripple={userConfig.theme.ripple}
                onPress={plus}
                disabled={props.value >= (props.max ?? Number.MAX_SAFE_INTEGER)}>
                <Flex style={style.rightIcon} inline justify="center">
                    <Icon
                        name="plus"
                        size={(props.size ?? 30) / 2}
                        color={
                            props.value >= (props.max ?? Number.MAX_SAFE_INTEGER)
                                ? Color(theme.colors.black).setAlpha(0.5).rgbaString
                                : undefined
                        }
                    />
                </Flex>
            </Pressable>
        </Flex>
    );
}

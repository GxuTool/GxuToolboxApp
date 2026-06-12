import {SliderProps} from "@rneui/base";
import {Slider, Text, useTheme} from "@rneui/themed";
import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import Flex from "./Flex.tsx";
import {Color} from "@/shared/color.ts";
import {useEffect, useState} from "react";
import {NumberInput} from "@/components/un-ui/NumberInput.tsx";

interface Props {
    containerStyle?: StyleProp<ViewStyle>;
    sliderContainerStyle?: StyleProp<ViewStyle>;
    inputMode?: boolean;
}

export function UnSlider(props: Props & SliderProps) {
    const {theme} = useTheme();
    const [value, setValue] = useState(props.value ?? 0);
    const [inputMode, setInputMode] = useState(props.inputMode);

    useEffect(() => {
        if (props.value !== undefined) setValue(props.value);
    }, [props.value]);

    const style = StyleSheet.create({
        valuePreviewText: {
            backgroundColor: Color(theme.colors.black).setAlpha(0.1).rgbaString,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 4,
        },
        track: {
            marginTop: -5,
        },
        thumb: {
            marginTop: -5,
        },
    });

    const onValueChange = (vo: number) => {
        const v = +vo ?? 0;
        let res = v;
        if (!Number.isNaN(props.maximumValue) && props.maximumValue !== undefined && v > props.maximumValue) {
            res = props.maximumValue;
        } else if (!Number.isNaN(props.minimumValue) && props.minimumValue !== undefined && v < props.minimumValue) {
            res = props.minimumValue;
        }
        setValue(res);
        props.onValueChange?.(res);
    };

    return (
        <Flex gap={10} inline justify="flex-end" style={props.containerStyle}>
            {inputMode ? (
                <NumberInput
                    value={value}
                    onSubmit={onValueChange}
                    onChange={setValue}
                    max={props.maximumValue}
                    min={props.minimumValue}
                    step={props.step}
                    onBlur={() => {
                        onValueChange(value);
                        setInputMode(false);
                    }}
                    autoFocus
                />
            ) : (
                <Text style={style.valuePreviewText} onPress={() => setInputMode(true)}>
                    {value}
                </Text>
            )}
            <View style={{marginBottom: -5, flex: 1}}>
                <Slider
                    {...props}
                    onValueChange={setValue}
                    onSlidingComplete={onValueChange}
                    value={value}
                    containerStyle={props.sliderContainerStyle}
                    minimumTrackTintColor={Color.mix(theme.colors.primary, theme.colors.grey2).rgbaString}
                    trackStyle={style.track}
                    thumbStyle={style.thumb}
                />
            </View>
        </Flex>
    );
}

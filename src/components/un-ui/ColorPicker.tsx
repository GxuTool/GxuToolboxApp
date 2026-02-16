import {Pressable, StyleSheet, View} from "react-native";
import Flex from "./Flex.tsx";
import {Button, Dialog, Slider, Text, useTheme} from "@rneui/themed";
import {BaseColor, Color} from "@/shared/color.ts";
import {useState} from "react";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {useUserConfig} from "@/hooks/app.ts";

interface Props {
    size: number;
    alpha: boolean;
    color: string;
    onColorChange: (color: string) => void;
    onColorInput: (color: string) => void;
}

export function ColorPicker(props: Partial<Props>) {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const [dialogVisible, setDialogVisible] = useState(false);
    const defaultColor = Color(props.color ?? BaseColor.black);
    const [r, setR] = useState(defaultColor.rgba[0]);
    const [g, setG] = useState(defaultColor.rgba[1]);
    const [b, setB] = useState(defaultColor.rgba[2]);
    const [a, setA] = useState(defaultColor.rgba[3]);
    const value = Color(r, g, b, a);
    const style = StyleSheet.create({
        labelContainer: {
            borderColor: theme.colors.grey4,
            borderWidth: 1,
            borderRadius: 5,
            padding: 5,
            height: props.size ?? 30,
        },
        colorLabel: {
            width: props.size ? props.size * (2 / 3) : 20,
            height: props.size ? props.size * (2 / 3) : 20,
            borderRadius: 3,
            backgroundColor: defaultColor.rgbaString,
        },
        dialogContainer: {
            height: 400,
        },
        tempColorView: {
            height: 50,
            width: 100,
            backgroundColor: value.rgbaString,
            borderRadius: 5,
        },
    });

    return (
        <Pressable android_ripple={userConfig.theme.ripple} onPress={() => setDialogVisible(true)}>
            <Flex style={style.labelContainer} gap={10} inline>
                <View style={style.colorLabel} />
                <Text>{defaultColor.hexString().toUpperCase()}</Text>
            </Flex>

            <Dialog
                isVisible={dialogVisible}
                overlayStyle={style.dialogContainer}
                onBackdropPress={() => {
                    props.onColorChange?.(props.alpha ? value.rgbaString : value.hexString().toUpperCase());
                    setDialogVisible(false);
                }}>
                <Flex direction="column" gap={10}>
                    <Text h4>选择颜色</Text>
                    <Flex justify="center">
                        <View style={style.tempColorView} />
                    </Flex>
                    <Flex justify="center">
                        <Text>{props.alpha ? value.rgbaString : value.hexString().toUpperCase()}</Text>
                    </Flex>
                    <Flex gap={10}>
                        <Text>红</Text>
                        <Flex>
                            <UnSlider step={1} minimumValue={0} maximumValue={255} value={r} onValueChange={setR} />
                        </Flex>
                    </Flex>
                    <Flex gap={10}>
                        <Text>绿</Text>
                        <Flex>
                            <UnSlider step={1} minimumValue={0} maximumValue={255} value={g} onValueChange={setG} />
                        </Flex>
                    </Flex>
                    <Flex gap={10}>
                        <Text>蓝</Text>
                        <Flex>
                            <UnSlider step={1} minimumValue={0} maximumValue={255} value={b} onValueChange={setB} />
                        </Flex>
                    </Flex>
                    {props.alpha && (
                        <Flex gap={10}>
                            <Text>透明度</Text>
                            <Text>{a}</Text>
                            <Flex>
                                <Slider
                                    step={1}
                                    minimumValue={0}
                                    maximumValue={255}
                                    value={a}
                                    thumbStyle={{
                                        height: 20,
                                        width: 20,
                                        backgroundColor: theme.colors.grey1,
                                    }}
                                    onValueChange={setA}
                                />
                            </Flex>
                        </Flex>
                    )}
                    <Flex>
                        <Button
                            onPress={() => {
                                props.onColorChange?.(props.alpha ? value.rgbaString : value.hexString().toUpperCase());
                                setDialogVisible(false);
                            }}>
                            确定
                        </Button>
                    </Flex>
                </Flex>
            </Dialog>
        </Pressable>
    );
}

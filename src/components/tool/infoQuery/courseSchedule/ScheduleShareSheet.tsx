import {Dimensions, Pressable, ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {Flex, Icon} from "@/components/un-ui";
import {Button, Text, useTheme} from "@rneui/themed";
import React, {useRef} from "react";
import {Color} from "@/shared/color.ts";
import {CanvasSchedule} from "@/components/tool/infoQuery/courseSchedule/CanvasSchedule.tsx";
import moment from "moment";
import RNFS from "react-native-fs";
import {CameraRoll} from "@react-native-camera-roll/camera-roll";
import Share, {ShareOptions} from "react-native-share";
import Canvas from "react-native-canvas";
import {useUserConfig} from "@/hooks/useUserConfig.ts";

type Props = {
    week: number;
    onClose: () => void;
};

export function ScheduleShareSheet(props: Props) {
    const {theme} = useTheme();
    const {store} = useUserConfig();
    const ripple = store(s => s.theme.ripple);

    const {width: screenWidth, height: screenHeight} = Dimensions.get("window");
    const styles = StyleSheet.create({
        bottomSheetContainer: {
            height: screenHeight * 0.18,
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
            borderWidth: 1,
        },
        scrollView: {
            height: screenHeight * 0.75,
            width: screenWidth * 0.92,
            marginLeft: screenWidth * 0.04,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderWidth: 2,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
            backgroundColor: theme.colors.background,
        },
        flexContainer: {
            marginBottom: 10,
            marginVertical: 10,
        },
    });
    const canvasRef = useRef<Canvas | null>(null);

    /**
     * 每次调用生成图片并写入临时目录，返回图片路径
     */
    const getImagePath = async (): Promise<string> => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        const base64 = await canvas.toDataURL();
        const fileName = `week_${props.week}_${moment().format("YYYY_MMDD_HHmmss_SSS")}_gxu_tool_app`;
        const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}.png`;
        //把base64字符串解码成二进制
        await RNFS.writeFile(filePath, base64.replace("data:image/png;base64,", ""), "base64");
        return filePath;
    };

    /**
     * 生成png类型图片写入系统相册
     */
    const saveToLocal = async () => {
        try {
            const filePath = await getImagePath();
            await CameraRoll.saveToCameraRoll(filePath, "photo");
            ToastAndroid.show("已保存至相册", ToastAndroid.SHORT);
            await clearDebugImage();
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * 分享图片
     */
    const shareSchedule = async () => {
        const filePath = await getImagePath();
        const shareOptions: ShareOptions = {
            url: "file://" + filePath,
            type: "image/png",
            message: "分享课表",
        };
        await Share.open(shareOptions);
        ToastAndroid.show("已发送", ToastAndroid.SHORT);
    };

    /**
     * 清除临时目录的文件，可在调试用
     */
    const clearDebugImage = async () => {
        const filePath = await getImagePath();
        try {
            if (await RNFS.exists(filePath)) {
                await RNFS.unlink(filePath);
                // ToastAndroid.show("已清除预览图", ToastAndroid.SHORT);
            }
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <View>
            <ScrollView style={styles.scrollView}>
                <CanvasSchedule week={props.week} canvasRef={canvasRef} />
            </ScrollView>
            <View style={styles.bottomSheetContainer}>
                <Flex justify={"center"}>
                    <Text>预览图：第{props.week}周课表</Text>
                </Flex>
                <Flex style={styles.flexContainer}>
                    <Flex justify={"center"} direction={"column"}>
                        <Pressable
                            android_ripple={ripple}
                            onPress={async () => {
                                await saveToLocal();
                            }}>
                            <Flex justify={"center"}>
                                <Icon name="arrow-collapse-down" size={20} />
                            </Flex>
                            <Text>保存到相册</Text>
                        </Pressable>
                    </Flex>
                    <Flex justify={"center"} direction={"column"}>
                        <Pressable
                            android_ripple={ripple}
                            onPress={async () => {
                                await shareSchedule();
                            }}>
                            <Flex justify={"center"}>
                                <Icon name="share" size={20} />
                            </Flex>
                            <Text>分享课表</Text>
                        </Pressable>
                    </Flex>
                </Flex>
                <Flex style={{marginBottom: 5}}>
                    <Button
                        title="取消"
                        type="clear"
                        onPress={() => {
                            props.onClose();
                        }}
                        containerStyle={{
                            flex: 1,
                        }}
                    />
                </Flex>
            </View>
        </View>
    );
}

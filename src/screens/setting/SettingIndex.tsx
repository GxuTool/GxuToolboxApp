import {Button} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import packageJson from "@/../package.json";
import moment from "moment/moment";
import {ColorPicker} from "@/components/un-ui/ColorPicker.tsx";
import {launchImageLibrary} from "react-native-image-picker";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {UnListSection, UnSectionList} from "@/components/un-ui/UnSectionList.tsx";
import {ToastAndroid} from "react-native";
import {useUserConfig} from "@/hooks/app.ts";

export function SettingIndex() {
    const {userConfig, updateUserConfig} = useUserConfig();

    function selectBg() {
        launchImageLibrary({
            mediaType: "photo",
        }).then(res => {
            if (!res.didCancel && res.assets && res.assets.length > 0) {
                userConfig.theme.bgUrl = res.assets[0].uri ?? "";
                updateUserConfig(userConfig);
                ToastAndroid.show("设置成功", ToastAndroid.SHORT);
            }
        });
    }

    const settingList: UnListSection[] = [
        {
            title: "账号",
            data: [
                {
                    label: "教务账号设置",
                    type: "navigation",
                    value: "jwAccount",
                },
                {
                    label: "统一认证账号设置",
                    type: "navigation",
                    value: "authAccount",
                },
                {
                    label: "考勤系统账号设置",
                    type: "navigation",
                    value: "attendanceSystemAccount",
                },
                {
                    label: "偏好设置",
                    type: "navigation",
                    value: "userPreferenceSetting",
                },
            ],
        },
        {
            title: "主题",
            data: [
                {
                    label: "主题色",
                    type: "any",
                    value: (
                        <ColorPicker
                            color={userConfig.theme.primaryColor}
                            onColorChange={v => {
                                userConfig.theme.primaryColor = v;
                                updateUserConfig(userConfig);
                            }}
                        />
                    ),
                },
                {
                    label: "课程颜色",
                    type: "any",
                    value: (
                        <Flex gap={10} inline>
                            <Button
                                onPress={() => {
                                    userConfig.theme.course.courseColor = {};
                                    updateUserConfig(userConfig);
                                    ToastAndroid.show("清空成功", ToastAndroid.SHORT);
                                }}
                                size="sm">
                                清空课程颜色缓存
                            </Button>
                        </Flex>
                    ),
                },
                {
                    label: "背景图",
                    type: "any",
                    value: (
                        <Flex gap={10} inline>
                            <Button
                                onPress={() => {
                                    userConfig.theme.bgUrl = "";
                                    updateUserConfig(userConfig);
                                    ToastAndroid.show("清空成功", ToastAndroid.SHORT);
                                }}
                                size="sm">
                                重置背景
                            </Button>
                            <Button onPress={selectBg} size="sm">
                                选择图片
                            </Button>
                        </Flex>
                    ),
                },
                {
                    label: "背景蒙版相对透明度",
                    type: "blockAny",
                    value: (
                        <UnSlider
                            step={1}
                            minimumValue={0}
                            maximumValue={130}
                            value={userConfig.theme.bgOpacity}
                            onValueChange={v => {
                                userConfig.theme.bgOpacity = v;
                                updateUserConfig(userConfig);
                            }}
                        />
                    ),
                },
            ],
        },
        {
            title: "软件",
            data: [
                {
                    label: "代码版本号",
                    type: "text",
                    value: packageJson.version,
                },
                {
                    label: "源代码",
                    type: "link",
                    value: "GitLab",
                    url: "https://gitlab.unde.site/gxutool/gxu_tool_app",
                },
                {
                    label: "软件文档",
                    type: "link",
                    value: "Docs",
                    url: "https://acm.gxu.edu.cn/docs/",
                },
                {
                    label: "公测群",
                    type: "link",
                    value: "101974491",
                    url: "https://qm.qq.com/q/n8l4zsvsGW",
                },
                {
                    label: "软件信息",
                    type: "text",
                    value: `CopyRight © ${moment().year()} \n寰辰<UNDERLR@foxmail.com>`,
                },
            ],
        },
    ];

    return <UnSectionList sections={settingList} contentContainerStyle={{padding: "5%"}} />;
}

import {useContext, useEffect, useState} from "react";
import {Button, Card, Text, useTheme} from "@rneui/themed";
import axios from "axios";
import {Linking, PermissionsAndroid, StyleSheet} from "react-native";
import Flex from "./un-ui/Flex";
import {Color} from "@/shared/color.ts";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import PackageJSON from "@/../package.json";
import {useUserConfig} from "@/hooks/app.ts";

enum ChannelList {
    beta = "beta",
    release = "release",
}

type VersionRes = {
    [c in ChannelList]: Version[];
};

interface Version {
    versionName: string;
    versionCode: number;
    desc: string;
    dependency: string;
    ori: Record<string, string>;
}

export function UpdateCard() {
    const {theme} = useTheme();
    const {userConfig, updateUserConfig} = useUserConfig();
    const [channel, setChannel] = useState<ChannelList>(
        PackageJSON.version.indexOf("beta") > -1 ? ChannelList.beta : ChannelList.release,
    );
    const [version, setVersion] = useState<Version>();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        init();
    }, []);

    const style = StyleSheet.create({
        card: {
            backgroundColor: Color(theme.colors.background).setAlpha(
                0.05 + ((theme.mode === "dark" ? 0.6 : 0.7) * userConfig.theme.bgOpacity) / 100,
            ).rgbaString,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.7).rgbaString,
            borderRadius: 5,
            paddingHorizontal: 0,
            marginHorizontal: 5,
            elevation: 0, // Android 去除阴影
            shadowOpacity: 0, // iOS 去除阴影
            overflow: "hidden",
        },
    });

    async function init() {
        const {data} = await axios.get<VersionRes>(
            "https://file.unde.site/GxuToolApp/version.json",
        );
        const newVersion = data[channel].find(version => version.versionCode > PackageJSON.versionCode);
        if (newVersion) {
            setVisible(true);
            setVersion(newVersion);
        }

        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
            granted["android.permission.READ_EXTERNAL_STORAGE"] === "granted" &&
            granted["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted"
        ) {
        } else {
            // ToastAndroid.show("需要权限进行更新", ToastAndroid.SHORT);
        }
    }

    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const handleUpdate = async (url: string) => {
        try {
            if (await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.error("更新失败:", error);
        } finally {
            setDownloading(false);
            setProgress(0);
        }
    };

    return visible ? (
        <Card containerStyle={style.card}>
            <Card.Title>
                <Flex justify="space-between">
                    <Text h4>发现新版本~</Text>
                </Flex>
            </Card.Title>
            <Card.Divider />
            <Flex direction="column" gap={10} align="flex-start" inline style={{paddingHorizontal: "2%"}}>
                {/*<Text>可以在设置关闭更新提示</Text>*/}
                <Text style={{fontSize: 14}}>版本号：{version?.versionName}</Text>
                <Text style={{fontSize: 14}}>更新信息：</Text>
                <Text style={{fontSize: 14}}>{version?.desc}</Text>
                <Flex gap={10} inline>
                    <Button
                        loading={downloading}
                        disabled={downloading}
                        onPress={() => handleUpdate(version?.ori.official!)}>
                        {downloading ? `下载中 ${progress.toFixed(1)}%` : "获取更新"}
                    </Button>
                    {/*<Button type="clear" onPress={() => setVisible(false)} disabled={downloading}>*/}
                    {/*    取消*/}
                    {/*</Button>*/}
                </Flex>
            </Flex>
        </Card>
    ) : (
        <></>
    );
}

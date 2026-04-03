import {BuildingList, IPos} from "@/type/pos.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert, Linking, ToastAndroid} from "react-native";
import {urlWithParams} from "@/core/http.ts";

const sourceApplication = "gxujwt";
export type MapApp = "amap" | "baidu";

const DEFAULT_MAP_APP_KEY = "default_map_app";

function getKeyword(pos: IPos | string) {
    return typeof pos === "string" ? pos : pos.fullName;
}

function buildAmapUrl(keyword: string) {
    return urlWithParams("androidamap://poi", {sourceApplication: sourceApplication, keywords: keyword, dev: 0});
}

function buildBaiduUrl(keyword: string) {
    return urlWithParams("baidumap://map/place/search", {query: keyword, src: sourceApplication});
}

function buildAmapProbeUrl() {
    return "androidamap://";
}

function buildBaiduProbeUrl() {
    return "baidumap://";
}

async function getDefaultMapApp(): Promise<MapApp | null> {
    const value = await AsyncStorage.getItem(DEFAULT_MAP_APP_KEY);
    if (value === "amap" || value === "baidu") {
        return value;
    }
    return null;
}

async function setDefaultMapApp(app: MapApp) {
    await AsyncStorage.setItem(DEFAULT_MAP_APP_KEY, app);
}

async function clearDefaultMapApp() {
    await AsyncStorage.removeItem(DEFAULT_MAP_APP_KEY);
}

async function getAvailableMaps(keyword: string) {
    const amapUrl = buildAmapUrl(keyword);
    const baiduUrl = buildBaiduUrl(keyword);

    const [amapAvailable, baiduAvailable] = await Promise.all([
        Linking.canOpenURL(buildAmapProbeUrl()).catch(() => false),
        Linking.canOpenURL(buildBaiduProbeUrl()).catch(() => false),
    ]);

    return {
        amap: amapAvailable ? amapUrl : null,
        baidu: baiduAvailable ? baiduUrl : null,
    };
}

async function tryOpenMap(url: string, app: MapApp, showToast = true) {
    try {
        await Linking.openURL(url);
        return true;
    }
    catch (e) {
        console.error(e);
        if (showToast) {
            const appName = app === "amap" ? "高德地图" : "百度地图";
            ToastAndroid.show(`无法打开${appName}，请检查是否安装`, ToastAndroid.SHORT);
        }
        return false;
    }
}

function chooseMapApp(): Promise<MapApp | null> {
    return new Promise(resolve => {
        Alert.alert(
            "选择地图",
            "请选择要使用的地图应用",
            [
                {text: "高德地图", onPress: () => resolve("amap")},
                {text: "百度地图", onPress: () => resolve("baidu")},
                {text: "取消", style: "cancel", onPress: () => resolve(null)},
            ],
            {
                cancelable: true,
                onDismiss: () => resolve(null),
            },
        );
    });
}

function chooseRememberMode(app: MapApp): Promise<"once" | "always" | null> {
    const appName = app === "amap" ? "高德地图" : "百度地图";

    return new Promise(resolve => {
        Alert.alert(
            "地图使用方式",
            `你这次选择了${appName}，要默认使用它，还是只用这一次？`,
            [
                {text: "只用一次", onPress: () => resolve("once")},
                {text: "设为默认", onPress: () => resolve("always")},
                {text: "取消", style: "cancel", onPress: () => resolve(null)},
            ],
            {
                cancelable: true,
                onDismiss: () => resolve(null),
            },
        );
    });
}

export const Pos = {
    getDefaultMapApp: async () => {
        return await getDefaultMapApp();
    },
    setDefaultMapApp: async (app: MapApp) => {
        await setDefaultMapApp(app);
    },
    clearDefaultMapApp: async () => {
        await clearDefaultMapApp();
    },
    parseStr: (str: string): IPos | null => {
        let res: IPos | null = null;
        for (const pos of BuildingList) {
            if (
                (typeof pos.test === "function" && pos.test(str)) ||
                (pos.test instanceof RegExp && "test" in pos.test && pos.test.test(str))
            ) {
                res = pos;
                break;
            }
        }
        return res;
    },
    searchInMap: async (pos: IPos | string) => {
        if (!pos) {
            return false;
        }
        const keyword = getKeyword(pos);
        const availableMaps = await getAvailableMaps(keyword);
        const hasAmap = !!availableMaps.amap;
        const hasBaidu = !!availableMaps.baidu;
        const amapUrl = buildAmapUrl(keyword);
        const baiduUrl = buildBaiduUrl(keyword);
        const defaultApp = await getDefaultMapApp();
        const fallbackApp: MapApp | null = defaultApp === "amap" ? "baidu" : defaultApp === "baidu" ? "amap" : null;

        try {
            if (hasAmap && !hasBaidu) {
                return await tryOpenMap(availableMaps.amap!, "amap");
            }

            if (!hasAmap && hasBaidu) {
                return await tryOpenMap(availableMaps.baidu!, "baidu");
            }

            if (!hasAmap && !hasBaidu) {
                if (defaultApp === "amap") {
                    const opened = await tryOpenMap(amapUrl, "amap", false);
                    if (opened) {
                        return true;
                    }
                    await clearDefaultMapApp();
                    return await tryOpenMap(baiduUrl, "baidu");
                }

                if (defaultApp === "baidu") {
                    const opened = await tryOpenMap(baiduUrl, "baidu", false);
                    if (opened) {
                        return true;
                    }
                    await clearDefaultMapApp();
                    return await tryOpenMap(amapUrl, "amap");
                }

                const selectedApp = await chooseMapApp();

                if (!selectedApp) {
                    return false;
                }

                const rememberMode = await chooseRememberMode(selectedApp);

                if (!rememberMode) {
                    return false;
                }

                if (rememberMode === "always") {
                    await setDefaultMapApp(selectedApp);
                }

                if (selectedApp === "amap") {
                    return await tryOpenMap(amapUrl, "amap");
                }

                return await tryOpenMap(baiduUrl, "baidu");
            }

            if (defaultApp === "amap" && availableMaps.amap) {
                const opened = await tryOpenMap(availableMaps.amap, "amap", false);
                if (opened) {
                    return true;
                }
                await clearDefaultMapApp();
                if (availableMaps.baidu) {
                    return await tryOpenMap(availableMaps.baidu, "baidu");
                }
                return false;
            }

            if (defaultApp === "baidu" && availableMaps.baidu) {
                const opened = await tryOpenMap(availableMaps.baidu, "baidu", false);
                if (opened) {
                    return true;
                }
                await clearDefaultMapApp();
                if (availableMaps.amap) {
                    return await tryOpenMap(availableMaps.amap, "amap");
                }
                return false;
            }

            if (defaultApp && fallbackApp) {
                await clearDefaultMapApp();
                if (fallbackApp === "amap") {
                    return await tryOpenMap(amapUrl, "amap");
                }
                return await tryOpenMap(baiduUrl, "baidu");
            }

            const selectedApp = await chooseMapApp();

            if (!selectedApp) {
                return false;
            }

            const rememberMode = await chooseRememberMode(selectedApp);

            if (!rememberMode) {
                return false;
            }

            if (rememberMode === "always") {
                await setDefaultMapApp(selectedApp);
            }

            if (selectedApp === "amap" && availableMaps.amap) {
                return await tryOpenMap(availableMaps.amap, "amap");
            }

            if (selectedApp === "baidu" && availableMaps.baidu) {
                return await tryOpenMap(availableMaps.baidu, "baidu");
            }

            ToastAndroid.show("无法打开所选地图", ToastAndroid.SHORT);
            return false;
        }
        catch (e) {
            console.error(e);
            ToastAndroid.show("无法打开地图，请稍后重试", ToastAndroid.SHORT);
            return false;
        }
    },
    parseAndSearchInMap: (str: string) => {
        if (!str) {
            return;
        }
        const pos = Pos.parseStr(str);
        if (pos !== null) {
            Pos.searchInMap(pos).then(opened => {
                if (opened) {
                    ToastAndroid.show("正在跳转至地图", ToastAndroid.SHORT);
                }
            }).catch(e => {
                console.error(e);
                ToastAndroid.show("打开失败", ToastAndroid.SHORT);
            });
        }
        else {
            ToastAndroid.show("该地点尚未支持自动在地图打开", ToastAndroid.SHORT);
        }
    },
};

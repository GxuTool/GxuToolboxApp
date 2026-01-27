import {BuildingList, IPos} from "@/type/pos.ts";
import {Linking, ToastAndroid} from "react-native";
import {urlWithParams} from "@/core/http.ts";

const sourceApplication = "gxujwt";

export const Pos = {
    /**
     * 解析字符串为地点
     * @param str 目标字符串
     */
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
    /**
     * 在打开地图搜索地点
     * @param pos 目标地点
     */
    searchInMap: async (pos: IPos | string) => {
        if (!pos) {
            return;
        }
        const keyword = typeof pos === "string" ? pos : pos.fullName;
        const url = urlWithParams("androidamap://poi", {sourceApplication: sourceApplication, keywords: keyword});
        return Linking.canOpenURL(url)
            .then(() => {
                Linking.openURL(url);
            })
            .catch(e => {
                console.error(e);
            });
    },
    /**
     * 自动解析，并打开地图搜索地点，带有报错信息
     * @param str 目标字符串
     */
    parseAndSearchInMap: (str: string) => {
        if (!str) {
            return;
        }
        const pos = Pos.parseStr(str);
        if (pos !== null) {
            ToastAndroid.show("正在跳转至地图", ToastAndroid.SHORT);
            Pos.searchInMap(pos).catch(e => {
                console.error(e);
                ToastAndroid.show("打开失败", ToastAndroid.SHORT);
            });
        } else {
            ToastAndroid.show("该地点尚未支持自动在地图打开", ToastAndroid.SHORT);
        }
    },
};

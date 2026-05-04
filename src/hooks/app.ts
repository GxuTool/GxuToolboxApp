import {useNavigation} from "@react-navigation/native";
import {WebViewSource} from "react-native-webview/lib/WebViewTypes";

export function useWebView() {
    const navigation = useNavigation();

    return {
        openInWeb: (title: string, opt: WebViewSource) => {
            navigation.navigate("webViewScreen", {
                title,
                source: opt,
            });
        },
        openInJw: (url: string, title?: string) => {
            navigation.navigate("webViewScreen", {
                title,
                source: {
                    uri: "https://jwxt2018.gxu.edu.cn/jwglxt" + url,
                } as WebViewSource,
            });
        },
    };
}

import {View} from "react-native";
import WebView from "react-native-webview";

// @ts-ignore
export function FileScreen({route}){
    const {fileId} = route.params;
    return (
        <View style={{flex: 1}}>
            <WebView
                source={{
                    uri: `https://wjxt.gxu.edu.cn/Wjxt_UI/showfile.aspx?id=${fileId}`,
                    headers: {
                        Referer: "https://wjxt.gxu.edu.cn/Wjxt_UI/qstwj.aspx",
                    },
                }}
            />
        </View>
    )
}

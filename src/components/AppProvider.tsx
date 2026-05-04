import {useEffect} from "react";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {createTheme, useTheme} from "@rneui/themed";
import {generateUiTheme} from "@/shared/theme.ts";
import {useColorScheme} from "react-native";
import {cowsay} from "@/js/cowsay.ts";

export function AppProvider(props: { children: React.ReactNode }) {
    const {store, init} = useUserConfig();
    const userConfig = store(s => s);
    const colorScheme = useColorScheme();
    const uiTheme = useTheme();

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        init();
        cowsay({
            text: "恭喜你，成功启动了开发服",
            f: "dragon",
        });
    }, []);

    useEffect(() => {
        const newUiTheme = createTheme(generateUiTheme(userConfig, colorScheme));
        uiTheme.updateTheme(newUiTheme);
    }, [userConfig, colorScheme, uiTheme]);

    return <>{props.children}</>;
}

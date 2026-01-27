import React, {useEffect, useMemo} from "react";
import {ThemeProvider} from "@rneui/themed";
import {theme} from "@/shared/theme.ts";
import {Root} from "./src/screens/Root.tsx";
import {useColorScheme} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {jwxt} from "@/js/jw/jwxt.ts";
import {AppProvider} from "@/components/AppProvider.tsx";

function App(): React.JSX.Element {
    const colorScheme = useColorScheme();
    const currentTheme = useMemo(
        () => ({
            ...theme,
            mode: colorScheme ?? "light",
        }),
        [colorScheme],
    );

    async function init() {
        await jwxt.testToken();
    }

    // 应用初始化
    useEffect(() => {
        init();
    }, []);

    return (
        <ThemeProvider theme={currentTheme}>
            <AppProvider>
                <SafeAreaProvider>
                    <Root />
                </SafeAreaProvider>
            </AppProvider>
        </ThemeProvider>
    );
}

export default App;

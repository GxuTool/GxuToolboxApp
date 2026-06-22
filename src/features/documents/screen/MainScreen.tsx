import {PendingFile, wjxt} from "@/js/wjxt/api.ts";
import {useEffect, useMemo, useState} from "react";
import {userMgr} from "@/js/mgr/user.ts";
import {ActivityIndicator, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity, View} from "react-native";
import {UnText, vh, vw} from "@/components/un-ui";
import {LoginDialog} from "@/features/documents/components/LoginDialog.tsx";
import {PageIndicator} from "@/features/documents/components/PageIndicator.tsx";
import {FileCard} from "@/features/documents/components/FileCard.tsx";
import {Divider, useTheme} from "@rneui/themed";
import {usePagerView} from "react-native-pager-view";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {FileScreen} from "@/features/documents/screen/FileScreen.tsx";
import {useNavigation} from "@react-navigation/native";

export function PendingFileListScreen() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [isLoginModel, setIsLoginModel] = useState<boolean>(false);
    const [isBusy, setIsBusy] = useState<boolean>(false);


    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [Account, setAccount] = useState<{username: string; password: string}>({username: "", password: ""});

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(pendingFiles.length / ITEMS_PER_PAGE));
    const pagerView = usePagerView({pagesAmount: totalPages});

    const navigation = useNavigation();

    /**
     * 每一页的数据
     */
    const paginatedFiles = useMemo(() => {
        const pages: PendingFile[][] = [];
        for (let i = 0; i < pendingFiles.length; i += ITEMS_PER_PAGE) {
            pages.push(pendingFiles.slice(i, i + ITEMS_PER_PAGE));
        }
        return pages;
    }, [pendingFiles]);

    const {theme} = useTheme();
    const style = StyleSheet.create({
        loadingView: {
            display: "flex",
            height: vh(70),
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
        },
        page: {
            width: "100%",
            height: vh(70),
            paddingHorizontal: 2,
        },
        emptyView: {
            alignItems: "center",
            marginTop: vh(30),
        },
    });

    async function init() {
        const {username, password} = await userMgr.wjxt.getAccount();
        setAccount({username, password});

        if (!username || !password) {
            ToastAndroid.show("请先设置账密", 500);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const test = await wjxt.testCookie();
        if (test) {
            setIsLogin(true);
            const res = await wjxt.getPendingFiles();
            if (res.length > 0) {
                setPendingFiles(res);
                setIsLoading(false);
                ToastAndroid.show("加载成功", 500);
            }
        } else {
            const loginRes = await wjxt.login(username, password);
            if (loginRes) {
                const toReadList = await wjxt.getPendingFiles();
                if (toReadList.length) setPendingFiles(toReadList);
            } else {
                ToastAndroid.show("登录失败，请检查账密", 500);
            }
        }
        setIsLoading(false);
        return;
    }

    async function handleLogin(username: string, password: string) {
        try {
            setIsLogin(false);
            setIsBusy(true);
            setPendingFiles([]);
            const loginRes = await wjxt.login(username, password);
            await userMgr.wjxt.storeAccount(username, password);

            if (loginRes) {
                ToastAndroid.show("登录成功", 500);
                setIsLogin(true);
                setIsBusy(false);
                setIsLoginModel(false);
                await init();
            } else {
                ToastAndroid.show("登录失败，请检查账密", 500);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsBusy(false);
        }
    }

    // @ts-ignore
    useEffect(() => {
        init();
    }, []);
    return (
        <>
            <View style={{padding: vw(5)}}>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"}}>
                    <View>
                        <UnText size={20}>待阅文件</UnText>
                    </View>
                    <TouchableOpacity onPress={() => setIsLoginModel(true)}>
                        <UnText size={18} color={theme.colors.primary}>登录</UnText>
                    </TouchableOpacity>
                </View>
                <Divider orientation="horizontal"/>

                {isLoading ? (
                    <View style={style.loadingView}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <UnText size={16} color={theme.colors.primary}>
                            内容加载中...
                        </UnText>
                    </View>
                ) : pendingFiles.length === 0 ? (
                    <View style={style.emptyView}>
                        <UnText size={16}>{isLogin ? "暂无待阅文件" : "未登录"}</UnText>
                    </View>
                ) : (
                    <>
                        <pagerView.AnimatedPagerView
                            ref={pagerView.ref}
                            style={{width: "100%", height: vh(72)}}
                            overScrollMode="never"
                            orientation="horizontal"
                            onPageSelected={pagerView.onPageSelected}>
                            {paginatedFiles.map((page, pageIndex) => (
                                <View key={pageIndex} collapsable={false} style={style.page}>
                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        {page.map((item, itemIndex) => {
                                            const parts = item.content.split("-");
                                            const title =
                                                parts.length > 1 ? parts.slice(0, -1).join("-") : item.content;
                                            const subtitle = parts.length > 1 ? parts.at(-1) : "";

                                            return (
                                                <FileCard
                                                    key={itemIndex}
                                                    title={title}
                                                    subtitle={subtitle}
                                                    onPress={() => {
                                                        // @ts-ignore
                                                        navigation.navigate("FileScreen", {fileId: item.id});
                                                    }}
                                                />
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            ))}
                        </pagerView.AnimatedPagerView>
                        <PageIndicator totalPages={totalPages} activePage={pagerView.activePage} />
                    </>
                )}
            </View>
            <LoginDialog
                isVisible={isLoginModel}
                isBusy={isBusy}
                username={Account.username}
                password={Account.password}
                onBackdropPress={() => setIsLoginModel(false)}
                handleLogin={async (username, password) => {
                    await handleLogin(username, password);
                }}
            />
        </>
    );
}

export function MainScreen() {
    const Stack = createNativeStackNavigator();

    // @ts-ignore
    return (
        <Stack.Navigator screenOptions={{headerShown: false, animation: "fade"}}>
            <Stack.Screen name={"PendingFileList"} component={PendingFileListScreen} options={{title: "待阅文件"}} />
            <Stack.Screen name={"FileScreen"} component={FileScreen} options={{title: "文件"}} />
        </Stack.Navigator>
    );
}

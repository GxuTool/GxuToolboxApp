import {Linking, Pressable, SectionList, SectionListProps, StyleSheet, ToastAndroid, View} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import {Color} from "@/shared/color.ts";
import {useNavigation} from "@react-navigation/native";
import {Text, useTheme} from "@rneui/themed";
import {useContext} from "react";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import Flex from "@/components/un-ui/Flex.tsx";

export interface UnListSection {
    title: string;
    data: UnListItem[];
}

interface UnListItem {
    label: string;
    type: "navigation" | "text" | "link" | "any" | "blockAny";
    value: any;
    url?: string;
}

interface Props {}

export function UnSectionList(props: Props & SectionListProps<UnListItem, UnListSection>) {
    const {userConfig} = useContext(UserConfigContext);
    const navigation = useNavigation();
    const {theme} = useTheme();

    const bgColor = Color(theme.mode === "light" ? theme.colors.background : theme.colors.grey5).setAlpha(
        0.1 + ((theme.mode === "light" ? 0.7 : 0.1) * userConfig.theme.bgOpacity) / 100,
    ).rgbaString;
    const borderRadius = 16;
    const span = 5;
    const style = StyleSheet.create({
        settingSectionContainer: {
            paddingBottom: "5%",
            marginBottom: 10,
        },
        settingSectionHeader: {
            marginTop: span,
            backgroundColor: bgColor,
            paddingHorizontal: "3%",
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            paddingTop: "2%",
        },
        settingSectionFooter: {
            marginBottom: span,
            backgroundColor: bgColor,
            height: borderRadius,
            paddingHorizontal: "3%",
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
            paddingTop: "2%",
        },
        settingItemContainer: {
            backgroundColor: bgColor,
            paddingHorizontal: "3%",
        },
        settingItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 15,
            paddingHorizontal: 10,
        },
        linkText: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black,
        },
        labelText: {
            fontSize: 16,
        },
    });

    async function openUrl(url?: string) {
        if (url) {
            Linking.openURL(url).catch(e => {
                console.error(e);
                ToastAndroid.show("打开链接失败，已将链接复制至剪切板", ToastAndroid.LONG);
                Clipboard.setString(url);
            });
        }
    }

    const renderItem = (item: UnListItem, underlined: boolean) => {
        const itemStyle = [
            style.settingItem,
            underlined && {
                borderBottomColor: Color.mix(theme.colors.grey3, theme.colors.primary).setAlpha(0.3).rgbaString,
                borderBottomWidth: 1,
            },
        ];
        switch (item.type) {
            case "navigation":
                return (
                    <Pressable
                        onPress={() => navigation.navigate(item.value)}
                        style={itemStyle}
                        android_ripple={userConfig.theme.ripple}>
                        <Text style={style.labelText}>{item.label}</Text>
                        <Icon name="chevron-right" size={16} />
                    </Pressable>
                );
            case "text":
                return (
                    <Flex style={itemStyle} justify="space-between">
                        <Text style={style.labelText}>{item.label}</Text>
                        <Text>{item.value}</Text>
                    </Flex>
                );
            case "link":
                return (
                    <Pressable
                        onPress={() => openUrl(item.url)}
                        style={itemStyle}
                        android_ripple={userConfig.theme.ripple}>
                        <Text style={style.labelText}>{item.label}</Text>
                        <Text style={style.linkText}>
                            <Icon name="link" size={16} />
                            {item.value ?? item.url}
                        </Text>
                    </Pressable>
                );
            case "any":
                return (
                    <Flex style={itemStyle} justify="space-between">
                        <Text style={style.labelText}>{item.label}</Text>
                        {item.value}
                    </Flex>
                );
            case "blockAny":
                return (
                    <Flex direction="column" align="flex-start" gap={10} style={itemStyle}>
                        <View>
                            <Text style={style.labelText}>{item.label}</Text>
                        </View>
                        {item.value}
                    </Flex>
                );
            default:
                return (
                    <View style={itemStyle}>
                        <Text style={style.labelText}>{item.label}</Text>
                    </View>
                );
        }
    };
    return (
        <SectionList<UnListItem, UnListSection>
            renderItem={({item, index, section}) => (
                <View style={style.settingItemContainer}>{renderItem(item, index !== section.data.length - 1)}</View>
            )}
            contentContainerStyle={style.settingSectionContainer}
            renderSectionHeader={({section: {title}}) => (
                <View style={style.settingSectionHeader}>
                    <Text h4>{title}</Text>
                </View>
            )}
            renderSectionFooter={() => <View style={style.settingSectionFooter} />}
            {...props}
        />
    );
}

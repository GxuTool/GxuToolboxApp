import {ScrollView, StyleSheet, View} from "react-native";
import {useEffect, useState} from "react";
import {getPersonalInfo} from "@/features/personalInfo/api";
import {ListItem, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";

const InfoRow = ({label, value, theme, styles}: {label: string; value?: string; theme: any; styles: any}) => (
    <ListItem bottomDivider containerStyle={{backgroundColor: "transparent"}}>
        <ListItem.Content>
            <Flex justify="space-between" style={{width: "100%"}}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{`${value  }`}</Text>
            </Flex>
        </ListItem.Content>
    </ListItem>
);

export const PersonalInfo = () => {
    const {theme} = useTheme();
    const [info, setInfo] = useState<any>();

    const init = async () => {
        const res = await getPersonalInfo();
        setInfo(res);
    };

    useEffect(() => {
        init();
    }, []);

    const styles = StyleSheet.create({
        container: {
            padding: 15,
        },
        header: {
            marginBottom: 20,
            paddingHorizontal: 10,
        },
        infoContainer: {
            backgroundColor: theme.mode === "dark" ? theme.colors.grey5 : theme.colors.white,
            borderRadius: 12,
            overflow: "hidden",
        },
        label: {
            color: theme.colors.grey3,
            fontSize: 14,
        },
        value: {
            color: theme.colors.black,
            fontSize: 16,
            fontWeight: "500",
        },
    });

    if (!info) return null;

    return (
        <ScrollView style={{backgroundColor: theme.colors.background}}>
            <View style={styles.container}>
                <View style={styles.infoContainer}>
                    {info.map((item: any) => (
                        <InfoRow label={item.label} value={item.value} theme={theme} styles={styles}/>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

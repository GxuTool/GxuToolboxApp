import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {useMemo} from "react";

export const NumberCard = ({evaList}) => {
    const {theme} = useTheme();
    const styles = StyleSheet.create({
        statsCard: {
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 16,
            alignSelf: "stretch",
        },
        statItem: {
            alignItems: "center",
            paddingHorizontal: 10,
            flex: 1,
        },
        statDivider: {
            width: 1,
            backgroundColor: theme.colors.divider,
        },
        statNumber: {
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.grey3,
        },
    });

    const statusCounts = useMemo(() => {
        const cnt = {done: 0, undone: 0, undo: 0};
        evaList.forEach(item => {
            switch (item.submitStatus) {
                case "已评完":
                    cnt.done++;
                    break;

                case "未评完":
                    cnt.undone++;
                    break;
                case "未评":
                    cnt.undo++;
                    break;
                default:
                    break;
            }
        });
        return cnt;
    }, [evaList]);
    return (
        <View style={styles.statsCard}>
            <Flex direction="row" justify="flex-start" inline>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, {color: theme.colors.black}]}>{evaList.length}</Text>
                    <Text style={styles.statLabel}>总计</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, {color: theme.colors.success}]}>{statusCounts.done}</Text>
                    <Text style={styles.statLabel}>已评完</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, {color: theme.colors.warning}]}>{statusCounts.undone}</Text>
                    <Text style={styles.statLabel}>未评完</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, {color: theme.colors.error}]}>{statusCounts.undo}</Text>
                    <Text style={styles.statLabel}>未评</Text>
                </View>
            </Flex>
        </View>
    );
};

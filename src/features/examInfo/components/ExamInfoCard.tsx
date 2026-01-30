import {StyleSheet, View} from "react-native";
import {Card, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui";
import {ExamInformation} from "@/features/examInfo/type/exam.types.ts";
import {ExamStatus} from "@/features/examInfo/utils/timeParser.ts";

interface Props {
    item: ExamInformation;
}

const StatusBadge = ({status}: {status: ExamStatus}) => {
    const {theme} = useTheme();
    const config: Record<ExamStatus, {text: string; color: string}> = {
        upcoming: {text: "即将开考", color: theme.colors.success},
        past: {text: "已结束", color: theme.colors.grey3},
        tbd: {text: "时间未知", color: theme.colors.warning},
    };
    return (
        <View
            style={{
                position: "absolute",
                top: -1,
                right: -1,
                backgroundColor: config[status].color,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 8,
            }}>
            <Text style={{color: "white", fontSize: 12, fontWeight: "bold"}}>{config[status].text}</Text>
        </View>
    );
};

const InfoRow = ({icon, label, value}: {icon: string; label: string; value: string}) => (
    <Flex align="center" gap={10} style={{marginVertical: 5}}>
        <Icon name={icon} size={16} color={"gray"} />
        <Text style={{color: "gray", width: 70, fontSize: 16}}>{label}:</Text>
        <Text style={{flex: 1, fontWeight: "bold", fontSize: 16}}>{value}</Text>
    </Flex>
);

export const ExamInfoCard = ({item}: Props) => {
    const {theme} = useTheme();

    const styles = StyleSheet.create({
        cardContainer: {
            borderRadius: 4,
            margin: 0,
            padding: 0,
        },
        header: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        body: {
            padding: 10,
        },
        footer: {
            padding: 10,
            backgroundColor: theme.colors.grey5,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
    });

    return (
        <Card containerStyle={styles.cardContainer}>
            <StatusBadge status={item.status} />
            <View style={styles.header}>
                <Text h4 style={{textAlign: "center"}}>
                    {item.course}
                </Text>
            </View>
            <View style={styles.body}>
                <InfoRow icon="clock-outline" label="考试时间" value={item.time} />
                <InfoRow icon="office-building-marker-outline" label="考试地点" value={item.classroom} />
                <InfoRow icon="seat-outline" label="座位号" value={item.seat || "未知"} />
            </View>
            <View style={styles.footer}>
                <Text style={{color: theme.colors.grey2, fontSize: 12}}>{item.type}</Text>
            </View>
        </Card>
    );
};

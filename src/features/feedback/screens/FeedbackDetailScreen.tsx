import {ScrollView, Text, View} from "react-native";
import {useRoute} from "@react-navigation/native";
import {FeedbackItemVM} from "@/api/schema/feedbackSchema.ts";

// 反馈类型 / 问题模块的中文标签（与提交表单的取值对应）
const TYPE_LABELS: Record<string, string> = {
    bug: "Bug 反馈",
    suggestion: "功能建议",
    feature: "功能建议",
    experience: "体验问题",
    other: "其他",
};

const FEATURE_LABELS: Record<string, string> = {
    schedule: "课表",
    class_schedule: "课表",
    score: "成绩",
    exam: "考试",
    auth: "账号登录",
    other: "其他",
};

export function FeedbackDetailScreen() {
    const route = useRoute<any>();
    const item: FeedbackItemVM = route.params.item;

    return (
        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16}}>
            {/* 状态 + 类型 */}
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
                <Text
                    style={{
                        color: "#fff",
                        fontSize: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: item.status === "replied" ? "#52c41a" : "#ff7875",
                    }}>
                    {item.status === "replied" ? "已回复" : "待回复"}
                </Text>
                <Text style={{marginLeft: 8, color: "#666", fontSize: 13}}>
                    {(TYPE_LABELS[item.type] ?? item.type) +
                        " · " +
                        (FEATURE_LABELS[item.feature] ?? item.feature)}
                </Text>
            </View>

            {/* 用户反馈内容 */}
            <View style={{backgroundColor: "#fff", borderRadius: 12, padding: 16}}>
                <Text style={{fontSize: 13, color: "#999", marginBottom: 6}}>我的反馈</Text>
                <Text style={{fontSize: 15, color: "#333", lineHeight: 22}}>{item.content}</Text>
                <Text style={{fontSize: 12, color: "#bbb", marginTop: 10}}>{item.createdAt}</Text>
            </View>

            {/* 管理员回复 */}
            <View style={{backgroundColor: "#f6ffed", borderRadius: 12, padding: 16, marginTop: 12}}>
                <Text style={{fontSize: 13, color: "#52c41a", marginBottom: 6}}>管理员回复</Text>
                {item.adminNote ? (
                    <Text style={{fontSize: 15, color: "#333", lineHeight: 22}}>{item.adminNote}</Text>
                ) : (
                    <Text style={{fontSize: 14, color: "#999"}}>管理员尚未回复，请耐心等待</Text>
                )}
            </View>

            {/* 其他信息 */}
            <View style={{marginTop: 16}}>
                <Text style={{fontSize: 12, color: "#aaa"}}>
                    联系方式：{item.contactType} {item.contact}
                </Text>
                <Text style={{fontSize: 12, color: "#aaa", marginTop: 4}}>设备：{item.deviceModel}</Text>
                <Text style={{fontSize: 12, color: "#aaa", marginTop: 4}}>版本：{item.appVersion}</Text>
            </View>
        </ScrollView>
    );
}

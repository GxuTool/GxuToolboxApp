import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";

type LevelType = "非常满意" | "满意" | "一般" | "不满意" | "非常不满意";
const LEVELS: LevelType[] = ["非常满意", "满意", "一般", "不满意", "非常不满意"];
export const QuestionCard = React.memo(
    ({
        index,
        text,
        value,
        onChange,
        themeColor,
    }: {
        index: number;
        text: string;
        value: LevelType;
        onChange: (index: number, val: LevelType) => void;
        themeColor: string;
    }) => {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    {index + 1}. {text}
                </Text>
                <View style={styles.radioRow}>
                    {LEVELS.map(lv => {
                        const active = value === lv;
                        return (
                            <TouchableOpacity
                                key={lv}
                                activeOpacity={0.7}
                                style={[
                                    styles.radioWrap,
                                    active && {
                                        borderColor: themeColor,
                                        backgroundColor: `${themeColor}15`,
                                    },
                                ]}
                                onPress={() => onChange(index, lv)}>
                                <View style={[styles.radioDot, active && {backgroundColor: themeColor}]} />
                                <Text style={[styles.radioText, active && {color: themeColor, fontWeight: "600"}]}>
                                    {lv}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f5fa",
    },
    cardList: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
    },
    cardTitle: {
        fontSize: 15,
        lineHeight: 24,
        color: "#262626",
        marginBottom: 16,
        fontWeight: "500",
    },
    radioRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    radioWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        backgroundColor: "#fafafa",
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#d9d9d9",
        marginBottom: 8,
    },
    radioText: {
        fontSize: 12,
        color: "#595959",
        textAlign: "center",
    },
    inputContainer: {
        borderBottomWidth: 0,
        paddingHorizontal: 0,
    },
    inputText: {
        textAlignVertical: "top",
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        lineHeight: 20,
        minHeight: 80,
    },
    buttonContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 30,
    },
});

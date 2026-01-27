import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {store} from "@/core/store.ts";
import {useState} from "react";
import {useTheme} from "@rneui/themed";

interface ChooseTermProps {
    onTermSelect?: (year, term) => void;
}

export function ChooseTerm({onTermSelect}: ChooseTermProps) {
    const {theme} = useTheme();
    // 入学年份
    const [enrollmentYear] = useState(store.cache.userInfo.rawData.grade);
    const [selected, setSelected] = useState<{year: number; term: string} | null>(null);

    const yearNames = ["大一", "大二", "大三", "大四", "大五"];
    const currentYear = new Date().getFullYear();
    const academicYears = [];

    for (let i = 0; i < 5; i++) {
        const startYear = enrollmentYear + i;
        if (startYear > currentYear) {
            break;
        }
        academicYears.push({
            name: yearNames[i],
            year: startYear,
        });
    }

    const handleSelect = (year: number, term: string) => {
        onTermSelect?.(year, term);
        setSelected({year, term});
    };

    const styles = StyleSheet.create({
        container: {
            padding: 16,
        },
        title: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.colors.black,
            marginBottom: 8,
        },
        yearRow: {
            marginBottom: 12,
        },
        yearLabel: {
            fontSize: 15,
            color: theme.colors.grey2,
            marginBottom: 8,
        },
        buttonContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        button: {
            flex: 1,
            paddingVertical: 10,
            marginHorizontal: 4,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonSelected: {
            backgroundColor: theme.colors.primary,
        },
        buttonText: {
            color: theme.colors.primary,
            fontSize: 14,
        },
        buttonTextSelected: {
            color: theme.colors.white,
            fontWeight: "bold",
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>请选择查询的学期</Text>
            {academicYears.map(ay => (
                <View key={ay.year} style={styles.yearRow}>
                    <Text style={styles.yearLabel}>
                        {ay.name} ({ay.year}-{ay.year + 1})
                    </Text>
                    <View style={styles.buttonContainer}>
                        {[
                            {label: "秋季学期", term: "3"},
                            {label: "春季学期", term: "12"},
                            {label: "全学年", term: ""},
                        ].map(termInfo => {
                            const isSelected = selected?.year === ay.year && selected?.term === termInfo.term;
                            return (
                                <TouchableOpacity
                                    key={termInfo.term}
                                    style={[styles.button, isSelected && styles.buttonSelected]}
                                    onPress={() => handleSelect(ay.year, termInfo.term as string)}>
                                    <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
                                        {termInfo.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            ))}
        </View>
    );
}

import {Row} from "react-native-reanimated-table";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import React from "react";
import {Evaluation} from "@/features/evaluation/types/evaluation.type.ts";
import {EvaTeacherList} from "@/features/evaluation/types/schema/TeacherList.ts";

interface EvaluationRowProps {
    item: EvaTeacherList;
    onPress: (item: Evaluation) => void;
    colWidths: number[];
    colorMap: Record<string, string>;
}

const EvaluationRowComponent = ({item, onPress, colorMap}: EvaluationRowProps) => {
    const {theme} = useTheme();
    const colWidths = [10, 5, 5];
    const styles = StyleSheet.create({
        row: {
            height: "auto",
            borderBottomWidth: 1,
            borderBottomColor: Color(theme.colors.primary).setAlpha(0.3).rgbaString,
            alignItems: "center",
            paddingVertical: 12,
        },
        rowText: {
            textAlign: "center",
            fontSize: 14,
        },
    });

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <Row
                cellTextStyle={cell => ({color: colorMap[cell] ?? theme.colors.black})}
                data={[`${item.courseName}(${item.courseTypeName})`, item.teacherName, item.submitStatus]}
                style={styles.row}
                flexArr={colWidths}
                textStyle={styles.rowText}
            />
        </TouchableOpacity>
    );
};

export const EvaluationRow = React.memo(EvaluationRowComponent);

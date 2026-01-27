import {Row} from "react-native-reanimated-table";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import React from "react";
import {Evaluation} from "@/features/evaluation/types/evaluation.type.ts";

interface EvaluationRowProps {
    item: Evaluation;
    onPress: (item: Evaluation) => void;
    colWidths: number[];
    colorMap: Record<string, string>;
}

const EvaluationRowComponent = ({item, onPress, colWidths, colorMap}: EvaluationRowProps) => {
    const {theme} = useTheme();
    const styles = StyleSheet.create({
        row: {
            height: 45,
            borderBottomWidth: 1,
            borderBottomColor: Color(theme.colors.primary).setAlpha(0.3).rgbaString,
            alignItems: "center",
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
                data={[`${item.kcmc} - ${item.xsmc}`, item.jzgmc, item.tjztmc]}
                style={styles.row}
                flexArr={colWidths}
                textStyle={styles.rowText}
            />
        </TouchableOpacity>
    );
};

export const EvaluationRow = React.memo(EvaluationRowComponent);

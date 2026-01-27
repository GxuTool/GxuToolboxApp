import React, {useState} from "react";
import {Text, useTheme} from "@rneui/themed";
import {StyleSheet, TouchableOpacity, View, ViewProps} from "react-native";
import {Color} from "@/shared/color.ts";

interface Props {
    options: Option[];
    label: string;
    onSelect?: (index: number) => void;
}

interface Option {
    label: string;
    key: string;
    checked: boolean;
}

export function UnOption(props: Props & ViewProps) {
    const {theme} = useTheme();

    const [selectIdx, setSelectIdx] = useState<number>(-1);
    const defaultColor = Color.mix(
        Color(theme.colors.primary),
        Color(theme.colors.background),
        theme.mode === "dark" ? 0.2 : 0.1,
    ).setAlpha(theme.mode === "dark" ? 0.3 : 0.8).rgbaString;
    const styles = StyleSheet.create({
        item: {marginBottom: 8},
        itemTitle: {fontSize: 14, marginBottom: 4, marginLeft: 10, marginRight: 10},
        optionButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: defaultColor,
            borderRadius: 8,
            marginBottom: 9,
        },
        optionButtonChecked: {
            backgroundColor: defaultColor,
        },
        optionText: {fontSize: 15, color: theme.colors.black},
        optionTextChecked: {color: "#fff", fontWeight: "bold"},
    });
    return (
        <View style={styles.item} {...props}>
            <Text style={styles.itemTitle}>{props.label}</Text>

            {props.options.map((opt, optIdx) => (
                <TouchableOpacity
                    key={opt.key}
                    style={[styles.optionButton, ((opt.checked && selectIdx === -1) || selectIdx === optIdx) && styles.optionButtonChecked]}
                    onPress={() => {
                        props.onSelect?.(optIdx);
                        setSelectIdx(optIdx);
                    }}>
                    <Text style={[styles.optionText, ((opt.checked && selectIdx === -1) || selectIdx === optIdx) && styles.optionTextChecked]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

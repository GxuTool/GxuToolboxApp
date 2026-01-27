import {Pressable, StyleSheet} from "react-native";
import {Dialog, Text, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import React, {useContext, useState} from "react";
import DateTimePicker, {useDefaultStyles} from "react-native-ui-datepicker";
import moment from "moment/moment";
import dayjs from "dayjs";
import {UserConfigContext} from "@/components/AppProvider.tsx";

interface Props {
    value: number;
    mode: "single" | "range" | "multiple";
    onlyDate?: boolean;
    onChange?: (value: number) => void;
}

export function UnDateTimePicker(props: Props) {
    const defaultStyles = useDefaultStyles();
    const {theme} = useTheme();
    const {userConfig} = useContext(UserConfigContext);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [value, setValue] = useState(props.value);
    const style = StyleSheet.create({
        labelContainer: {
            backgroundColor: Color(theme.colors.black).setAlpha(0.1).rgbaString,
            borderColor: theme.colors.grey4,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
    });

    return (
        <>
            <Pressable
                onPress={() => setDialogVisible(true)}
                android_ripple={userConfig.theme.ripple}
                style={style.labelContainer}>
                <Text>{moment(value).format(props.onlyDate ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss")}</Text>
            </Pressable>
            <Dialog
                isVisible={dialogVisible}
                onBackdropPress={() => {
                    props.onChange?.(value);
                    setDialogVisible(false);
                }}>
                <DateTimePicker
                    styles={defaultStyles}
                    mode={props.mode}
                    locale="cn"
                    showOutsideDays
                    firstDayOfWeek={1}
                    enabledDates={date => dayjs(date).day() === 1}
                    date={value}
                    onChange={v => {
                        setValue(moment(v.date).valueOf());
                        props.onChange?.(value);
                    }}
                />
            </Dialog>
        </>
    );
}

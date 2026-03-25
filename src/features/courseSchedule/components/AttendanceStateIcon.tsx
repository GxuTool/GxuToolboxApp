import {useTheme} from "@rneui/themed";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import React from "react";
import {Icon} from "@/components/un-ui";

export interface AttendanceStateIconProps {
    state: AST.AttendanceState;
    defaultColor: string;
}

export function AttendanceStateIcon(props: AttendanceStateIconProps) {
    const {theme} = useTheme();
    const iconMap: Record<AST.AttendanceState, React.ReactElement> = {
        [AST.AttendanceState.Normal]: <Icon name="check-circle" color={theme.colors.success} />,
        [AST.AttendanceState.Late]: <Icon name="clock" color={theme.colors.warning} />,
        [AST.AttendanceState.Absent]: <Icon name="close-circle" color={theme.colors.error} />,
        [AST.AttendanceState.NotStarted]: <Icon name="circle-outline" color={props.defaultColor} />,
        [AST.AttendanceState.NoNeed]: <Icon name="minus-circle" color={props.defaultColor} />,
    };
    return iconMap[props.state];
}

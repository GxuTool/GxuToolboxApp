import React from "react";
import {UnPressable} from "@/components/un-ui";
import {Text, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import {Course} from "@/type/infoQuery/course/course.ts";

interface ConflictCourseListProps {
    courses: Course[];
    activeKch: Course["kch"];
    onSelect: (course: Course) => void;
    onPressActive: (course: Course) => void;
}

export function ConflictCourseList({courses, activeKch, onSelect, onPressActive}: ConflictCourseListProps) {
    const {theme} = useTheme();

    return (
        <>
            <Text h4 style={{marginBottom: 12}}>
                冲突课程
            </Text>
            {courses.map(c => {
                const isActive = c.kch === activeKch;
                return (
                    <UnPressable
                        key={c.kch}
                        onPress={function() { return isActive ? onPressActive(c) : onSelect(c); }}
                        style={{
                            paddingVertical: 12,
                            paddingHorizontal: 8,
                            borderLeftWidth: isActive ? 3 : 0,
                            borderLeftColor: theme.colors.primary,
                            backgroundColor: isActive
                                ? Color(theme.colors.primary).setAlpha(0.08).rgbaString
                                : "transparent",
                            marginBottom: 4,
                            borderRadius: 4,
                        }}>
                        <Text style={{fontWeight: isActive ? "bold" : "normal"}}>{c.kcmc}</Text>
                        <Text style={{fontSize: 12, color: theme.colors.grey3}}>
                            {[c.xm, c.cdmc].filter(Boolean).join(" · ")}
                        </Text>
                    </UnPressable>
                );
            })}
        </>
    );
}

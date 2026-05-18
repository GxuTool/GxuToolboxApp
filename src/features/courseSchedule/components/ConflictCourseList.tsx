import React from "react";
import {UnPressable} from "@/components/un-ui";
import {Text, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import {CourseClass} from "@/class/jw/course.ts";

interface ConflictCourseListProps {
    courses: CourseClass[];
    activeCourseCode: string;
    onSelect: (course: CourseClass) => void;
    onPressActiveCourse: (course: CourseClass) => void;
}

export function ConflictCourseList({courses, activeCourseCode, onSelect, onPressActiveCourse}: ConflictCourseListProps) {
    const {theme} = useTheme();

    return (
        <>
            <Text h4 style={{marginBottom: 12}}>
                冲突课程
            </Text>
            {courses.map(c => {
                const t = c.transformed;
                const isActive = t.courseCode === activeCourseCode;
                return (
                    <UnPressable
                        key={t.courseCode}
                        onPress={function() { return isActive ? onPressActiveCourse(c) : onSelect(c); }}
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
                        <Text style={{fontWeight: isActive ? "bold" : "normal"}}>{t.courseName}</Text>
                        <Text style={{fontSize: 12, color: theme.colors.grey3}}>
                            {[t.name, t.venueName].filter(Boolean).join(" · ")}
                        </Text>
                    </UnPressable>
                );
            })}
        </>
    );
}

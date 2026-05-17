import React from "react";
import {UnPressable} from "@/components/un-ui";
import {Text, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import {CourseParsed} from "@/type/infoQuery/course/course.ts";

interface ConflictCourseListProps {
    courses: CourseParsed[];
    activeKch: CourseParsed["courseCode"];
    onSelect: (course: CourseParsed) => void;
    onPressActive: (course: CourseParsed) => void;
}

export function ConflictCourseList({courses, activeKch, onSelect, onPressActive}: ConflictCourseListProps) {
    const {theme} = useTheme();

    return (
        <>
            <Text h4 style={{marginBottom: 12}}>
                冲突课程
            </Text>
            {courses.map(c => {
                const isActive = c.courseCode === activeKch;
                return (
                    <UnPressable
                        key={c.courseCode}
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
                        <Text style={{fontWeight: isActive ? "bold" : "normal"}}>{c.courseName}</Text>
                        <Text style={{fontSize: 12, color: theme.colors.grey3}}>
                            {[c.name, c.venueName].filter(Boolean).join(" · ")}
                        </Text>
                    </UnPressable>
                );
            })}
        </>
    );
}

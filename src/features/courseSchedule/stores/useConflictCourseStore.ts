import {create} from "zustand";
import {Course} from "@/type/infoQuery/course/course.ts";

interface ConflictGroup {
    courses: string[]; // 排序后的 Course['kch'][]
    active: string; // 当前激活的 Course['kch']
}

interface ConflictCourseState {
    conflictGroups: ConflictGroup[];
    sheetData: {courses: Course[]} | null;

    setActive: (courses: string[], active: string) => void;
    getActive: (courses: string[]) => string | undefined;
    openSheet: (courses: Course[]) => void;
    closeSheet: () => void;
}

export const useConflictCourseStore = create<ConflictCourseState>((set, get) => ({
    conflictGroups: [],
    sheetData: null,

    setActive: (courses, active) => {
        const sorted = [...courses].sort();
        set(state => ({
            conflictGroups: [
                ...state.conflictGroups.filter(g => g.courses.join(",") !== sorted.join(",")),
                {courses: sorted, active},
            ],
        }));
    },
    getActive: courses => {
        const sorted = [...courses].sort();
        return get().conflictGroups.find(g => g.courses.join(",") === sorted.join(","))?.active;
    },
    openSheet: courses => set({sheetData: {courses}}),
    closeSheet: () => set({sheetData: null}),
}));

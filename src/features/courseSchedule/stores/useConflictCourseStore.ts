import {create} from "zustand/react";
import {store as storage} from "@/core/store.ts";

const STORAGE_KEY = "conflictCourseStore";

interface ConflictGroup {
    courses: string[];
    active: string;
}

interface ConflictCourseState {
    conflictGroups: ConflictGroup[];

    setActive: (courses: string[], active: string) => Promise<void>;
    getActive: (courses: string[]) => string | undefined;
}

const conflictCourseStore = create<
    ConflictCourseState & {
        init: () => Promise<void>;
    }
>()((set, get) => ({
    conflictGroups: [],

    setActive: async (courses, active) => {
        const sorted = [...courses].sort();
        set(state => ({
            conflictGroups: [
                ...state.conflictGroups.filter(g => g.courses.join(",") !== sorted.join(",")),
                {courses: sorted, active},
            ],
        }));
        await storage.save({key: STORAGE_KEY, data: get().conflictGroups});
    },

    getActive: courses => {
        const sorted = [...courses].sort();
        return get().conflictGroups.find(g => g.courses.join(",") === sorted.join(","))?.active;
    },

    init: async () => {
        try {
            const cached = await storage.load({key: STORAGE_KEY});
            if (cached) {
                set({conflictGroups: cached as ConflictGroup[]});
            }
        } catch {
            // 首次启动无缓存
        }
    },
}));

export const useConflictCourseStore = () => {
    return {
        store: conflictCourseStore,
        init: conflictCourseStore.getState().init,
        load: async (): Promise<ConflictGroup[] | null> => {
            try {
                return await storage.load({key: STORAGE_KEY});
            } catch {
                return null;
            }
        },
        save: (data: ConflictGroup[]) => storage.save({key: STORAGE_KEY, data}),
        remove: () => storage.remove({key: STORAGE_KEY}),
    };
};

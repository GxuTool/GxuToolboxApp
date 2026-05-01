import { create } from "zustand/react";
import { useMemo } from "react";
import { BaseColor } from "@/shared/color.ts";
import { store as storage } from "@/core/store.ts";
import { useTheme } from "@rneui/themed";
import { generateCourseScheduleStyle } from "@/js/jw/course.ts";
import { PaletteName } from "@/features/courseSchedule/utils/colorPalette.ts";

const STORAGE_KEY = "courseScheduleStore";

export interface CourseStoreState {
    courseInfoVisible: Record<string, boolean>;
    startDay: string;
    randomColor: string[];
    weekdayList: string[];
    timeSpanList: `${string}\n${string}`[];
    theme: {
        timeSpanHeight: number;
        weekdayHeight: number;
        courseItemMargin: number;
        courseItemBorderWidth: number;
        courseColor: Record<string, string>;
        palette?: PaletteName;
        customColors?: Record<string, string>;
    };
}

export interface CourseStoreAction {
    update: <T extends keyof CourseStoreState>(k: T, v: CourseStoreState[T]) => void;
    init: () => Promise<void>;
}

const defaultState: CourseStoreState = {
    courseInfoVisible: {
        name: true,
        position: true,
        teacher: true,
    },

    startDay: "2025-02-24",

    randomColor: [
        BaseColor.pink,
        BaseColor.lightgreen,
        BaseColor.skyblue,
        BaseColor.orange,
        BaseColor.tan,
        BaseColor.sandybrown,
        BaseColor.navy,
        BaseColor.maroon,
        BaseColor.mediumspringgreen,
        BaseColor.slateblue,
        BaseColor.yellowgreen,
        BaseColor.red,
        BaseColor.yellow,
        BaseColor.gold,
        BaseColor.lightskyblue,
        BaseColor.lightsteelblue,
        BaseColor.limegreen,
        BaseColor.mediumaquamarine,
        BaseColor.mediumblue,
    ],

    weekdayList: ["一", "二", "三", "四", "五", "六", "日"],

    timeSpanList: [
        "08:00\n08:45",
        "08:55\n09:40",
        "10:00\n10:45",
        "10:55\n11:40",
        "14:30\n15:15",
        "15:20\n16:05",
        "16:25\n17:10",
        "17:15\n18:00",
        "18:10\n18:55",
        "18:45\n19:30",
        "19:40\n20:25",
        "20:30\n21:15",
        "21:20\n22:05",
    ],

    theme: {
        timeSpanHeight: 80,
        weekdayHeight: 60,
        courseItemMargin: 2,
        courseItemBorderWidth: 0,
        courseColor: {},
    },
};

const persistableKeys = [
    "courseInfoVisible",
    "startDay",
    "randomColor",
    "weekdayList",
    "timeSpanList",
    "theme",
] as const;

const useCourseStore = create<CourseStoreState & CourseStoreAction>()((set, get) => ({
    ...defaultState,

    update: (k, v) => {
        set({ [k]: v } as Partial<CourseStoreState>);
        const state = get();
        const data: Record<string, unknown> = {};
        for (const key of persistableKeys) {
            data[key] = state[key];
        }
        storage.save({ key: STORAGE_KEY, data });
    },

    init: async () => {
        try {
            const cached = await storage.load({ key: STORAGE_KEY });
            if (cached) {
                set({ ...defaultState, ...cached });
            }
        } catch {
            // 首次启动无缓存，使用默认值
        }
    },
}));

export const useCourse = () => {
    const { theme: rneuiTheme } = useTheme();
    const courseTheme = useCourseStore(s => s.theme);

    const courseScheduleStyle = useMemo(
        () => generateCourseScheduleStyle(courseTheme, rneuiTheme),
        [courseTheme, rneuiTheme],
    );

    return {
        store: useCourseStore,
        courseScheduleStyle,
        /** 在应用启动时调用，从本地存储读取缓存数据还原到 store */
        init: useCourseStore.getState().init,
        /** 直接从存储加载数据（不走缓存），失败返回 null */
        load: async (): Promise<CourseStoreState | null> => {
            try {
                return await storage.load({ key: STORAGE_KEY });
            } catch {
                return null;
            }
        },
        /** 直接保存数据到存储 */
        save: (data: CourseStoreState) => storage.save({ key: STORAGE_KEY, data }),
        /** 删除存储中的数据 */
        remove: () => storage.remove({ key: STORAGE_KEY }),
    };
};

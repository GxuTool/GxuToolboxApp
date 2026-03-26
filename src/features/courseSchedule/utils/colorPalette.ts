import {BaseColor} from "@/shared/color.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";


export type PaletteName = "default" | "macaron" | "morandi" | "vivid";

export const ColorPalettes: Record<PaletteName, string[]> = {
    default: [
        BaseColor.pink, BaseColor.lightgreen, BaseColor.skyblue, BaseColor.orange,
        BaseColor.tan, BaseColor.sandybrown, BaseColor.navy, BaseColor.maroon,
        BaseColor.mediumspringgreen, BaseColor.slateblue, BaseColor.yellowgreen,
        BaseColor.red, BaseColor.yellow, BaseColor.gold, BaseColor.lightskyblue,
        BaseColor.lightsteelblue, BaseColor.limegreen, BaseColor.mediumaquamarine,
        BaseColor.mediumblue,
    ],
    macaron: [
        "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA",
        "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9", "#B3E5FC",
        "#B2DFDB", "#DCEDC8", "#FFF9C4", "#FFECB3", "#FFE0B2",
    ],
    morandi: [
        "#A8B6B2", "#90A4AE", "#78909C", "#B0BEC5", "#CFD8DC",
        "#BCAAA4", "#A1887F", "#8D6E63", "#D7CCC8", "#EFEBE9",
        "#FFE082", "#FFCA28", "#FFB300", "#FFD54F", "#FFECB3",
    ],
    vivid: [
        "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE",
        "#448AFF", "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE",
        "#B2FF59", "#EEFF41", "#FFFF00", "#FFD740", "#FFAB40",
    ]
};

// Type-based default colors
const TypeDefaults: Record<string, string> = {
    exam: BaseColor.purple,
    holiday: BaseColor.red,
    experiment: BaseColor.lightskyblue,
    activity: BaseColor.orange,
};


export function resolveEventsColor(
    entity: Partial<ScheduleTableItem> & { kind?: string },
    customColors: Record<string, string> = {},
    paletteName: PaletteName = "default"
): string {

    // 每门课颜色一样
    const key = entity.title || entity.id || "unknown";
    if (customColors[key]) {
        return customColors[key];
    }

    // 考试、放假等先用默认颜色
    if (entity.kind && entity.kind !== 'course' && TypeDefaults[entity.kind]) {
        return TypeDefaults[entity.kind];
    }

    // 用哈希算法从制定色盘中选颜色
    const palette = ColorPalettes[paletteName];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
}

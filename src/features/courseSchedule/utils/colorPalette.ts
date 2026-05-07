import {BaseColor} from "@/shared/color.ts";

interface ColorMapItem {
    id?: string;
    title?: string;
    day?: number;
    begin?: number;
    end?: number;
    kind?: string;
    color?: string;
}

export type PaletteName = "default" | "macaron" | "morandi" | "vivid";

export const ColorPalettes: Record<PaletteName, string[]> = {
    default: [
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
    macaron: [
        "#FFB7B2",
        "#FFDAC1",
        "#E2F0CB",
        "#B5EAD7",
        "#C7CEEA",
        "#F8BBD0",
        "#E1BEE7",
        "#D1C4E9",
        "#C5CAE9",
        "#B3E5FC",
        "#B2DFDB",
        "#DCEDC8",
        "#FFF9C4",
        "#FFECB3",
        "#FFE0B2",
    ],
    morandi: [
        "#A8B6B2",
        "#90A4AE",
        "#78909C",
        "#B0BEC5",
        "#CFD8DC",
        "#BCAAA4",
        "#A1887F",
        "#8D6E63",
        "#D7CCC8",
        "#EFEBE9",
        "#FFE082",
        "#FFCA28",
        "#FFB300",
        "#FFD54F",
        "#FFECB3",
    ],
    vivid: [
        "#FF5252",
        "#FF4081",
        "#E040FB",
        "#7C4DFF",
        "#536DFE",
        "#448AFF",
        "#40C4FF",
        "#18FFFF",
        "#64FFDA",
        "#69F0AE",
        "#B2FF59",
        "#EEFF41",
        "#FFFF00",
        "#FFD740",
        "#FFAB40",
    ],
};

// Type-based default colors
const TypeDefaults: Record<string, string> = {
    exam: BaseColor.purple,
    holiday: BaseColor.red,
    experiment: BaseColor.lightskyblue,
    activity: BaseColor.orange,
};

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace("#", "");
    return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16),
    ];
}

function colorDistance(hex1: string, hex2: string): number {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function hashStr(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

/**
 * 批量为课表中的 course 类型课程分配颜色。
 * 保证：同一门课颜色唯一；在同一天时段相邻的课颜色尽量差异最大。
 */
export function buildColorMap(
    items: ColorMapItem[],
    paletteName: PaletteName,
    customColors: Record<string, string> = {},
): Map<string, string> {
    const palette = ColorPalettes[paletteName];

    // ① 只处理 course 类型，聚合出唯一课程 key
    const courseKeys = Array.from(
        new Set(items.filter(item => item?.kind && item.kind === "course").map(item => item.title || item.id)),
    );
    // ② 构建邻接图：同一天，时段重叠或相差 ≤ 1 即相邻（week 不参与判断）
    const adj = new Map<string, Set<string>>();
    courseKeys.forEach(k => adj.set(k, new Set()));

    for (let i = 0; i < courseKeys.length; i++) {
        for (let j = i + 1; j < courseKeys.length; j++) {
            const keyA = courseKeys[i];
            const keyB = courseKeys[j];
            const itemsA = items.filter(it => (it.title || it.id) === keyA);
            const itemsB = items.filter(it => (it.title || it.id) === keyB);

            outer: for (const a of itemsA) {
                for (const b of itemsB) {
                    if (a.day === b.day && (Math.abs(a.begin - b.end) <= 1 || Math.abs(b.begin - a.end) <= 1)) {
                        adj.get(keyA)!.add(keyB);
                        adj.get(keyB)!.add(keyA);
                        break outer;
                    }
                }
            }
        }
    }

    // ③ 按邻接数降序，最拥挤的课先分配
    const sorted = [...courseKeys].sort((a, b) => adj.get(b)!.size - adj.get(a)!.size);

    // ④ 贪心着色：优先选未被任何课用过的颜色，候选中挑与邻居 RGB 距离最大的
    const assigned = new Map<string, string>();

    for (const key of sorted) {
        if (customColors[key]) {
            assigned.set(key, customColors[key]);
            continue;
        }

        const neighborColors = [...adj.get(key)!].map(n => assigned.get(n)).filter((c): c is string => c !== undefined);

        const usedGlobally = new Set(assigned.values());
        const unused = palette.filter(c => !usedGlobally.has(c));
        const notNeighbor = palette.filter(c => !neighborColors.includes(c));
        const pool =
            unused.filter(c => notNeighbor.includes(c)).length > 0
                ? unused.filter(c => notNeighbor.includes(c))
                : notNeighbor.length > 0
                  ? notNeighbor
                  : palette;

        const best =
            neighborColors.length === 0
                ? pool[Math.abs(hashStr(key)) % pool.length]
                : pool.reduce((best, c) => {
                      const dist = Math.min(...neighborColors.map(nc => colorDistance(c, nc)));
                      const bestDist = Math.min(...neighborColors.map(nc => colorDistance(best, nc)));
                      return dist > bestDist ? c : best;
                  });

        assigned.set(key, best);
    }

    return assigned;
}

export function resolveEventsColor(
    entity: ColorMapItem,
    customColors: Record<string, string> = {},
    paletteName: PaletteName = "default",
): string {
    // 每门课颜色一样
    const key = entity.title || entity.id || "unknown";
    if (customColors[key]) {
        return customColors[key];
    }

    // 考试、放假等先用默认颜色
    if (entity.kind && entity.kind !== "course" && TypeDefaults[entity.kind]) {
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

// useEntityColor.ts
import {createContext, useCallback, useContext} from "react";
import {useCourseData} from "@/hooks/useCourseData.ts";
import {PaletteName, resolveEventsColor} from "../utils/colorPalette.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export const ColorMapContext = createContext<Map<string, string> | null>(null);

export function useBlocksColor() {
    const {store} = useCourseData();

    const paletteName = store(s => s.theme.palette) || "macaron";
    const customColors = store(s => s.theme.customColors) || {};

    const colorMap = useContext(ColorMapContext);

    const getColor = useCallback((entity: Partial<ScheduleTableItem> & { kind?: string }) => {
        const key = entity.title || entity.id || "unknown";
        if (customColors[key]) return customColors[key];
        if (entity.kind && entity.kind !== "course" && entity.kind in {
            exam: 1,
            holiday: 1,
            experiment: 1,
            activity: 1
        }) {
            return resolveEventsColor(entity, customColors, paletteName);
        }
        if (colorMap?.has(key)) return colorMap.get(key)!;
        return resolveEventsColor(entity, customColors, paletteName);
    }, [customColors, paletteName, colorMap]);

    const setCustomColor = useCallback((key: string, color: string) => {
        store.getState().update("theme", {
            ...store.getState().theme,
            customColors: {
                ...customColors,
                [key]: color
            }
        });
    }, [store, customColors]);

    return {getColor, setCustomColor, paletteName};
}

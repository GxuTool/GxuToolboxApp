// useEntityColor.ts
import {createContext, useCallback, useContext} from "react";
import {useUserConfig} from "@/hooks/app.ts";
import {PaletteName, resolveEventsColor} from "../utils/colorPalette.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export const ColorMapContext = createContext<Map<string, string> | null>(null);

export function useBlocksColor() {
    const {userConfig, updateUserConfig} = useUserConfig();

    // userConfig 里存 paletteName 和 customColors
    // 如果没有，先用默认值, 然后扩展 userConfig 类型
    // 先默认用马卡龙色系
    const paletteName = (userConfig.theme?.course?.palette as PaletteName) || "macaron";
    const customColors = userConfig.theme?.course?.customColors || {};

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
        // 更新 userConfig
        const newTheme = {
            ...userConfig.theme,
            course: {
                ...userConfig.theme.course,
                customColors: {
                    ...customColors,
                    [key]: color
                }
            }
        };
        updateUserConfig({...userConfig, theme: newTheme});
    }, [userConfig, updateUserConfig]);

    return {getColor, setCustomColor, paletteName};
}

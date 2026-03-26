// useEntityColor.ts
import {useCallback} from "react";
import {useUserConfig} from "@/hooks/app.ts";
import {resolveEventsColor, PaletteName} from "../utils/colorPalette.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useBlocksColor() {
    const {userConfig, updateUserConfig} = useUserConfig();

    // userConfig 里存 paletteName 和 customColors
    // 如果没有，先用默认值, 然后扩展 userConfig 类型
    // 先默认用马卡龙色系
    const paletteName = (userConfig.theme?.course?.palette as PaletteName) || "macaron";
    const customColors = userConfig.theme?.course?.customColors || {};

    const getColor = useCallback((entity: Partial<ScheduleTableItem> & { kind?: string }) => {
        return resolveEventsColor(entity, customColors, paletteName);
    }, [customColors, paletteName]);

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

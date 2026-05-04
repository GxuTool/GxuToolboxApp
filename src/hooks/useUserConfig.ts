import { create } from "zustand/react";
import { defaultUserConfig, IUserConfig } from "@/type/IUserConfig.ts";
import { store as storage } from "@/core/store.ts";
import { deepMerge } from "@/utils/objectUtils.ts";

const STORAGE_KEY = "userConfig";

const useUserConfigStore = create<
    IUserConfig & {
        update: <T extends keyof IUserConfig>(k: T, v: IUserConfig[T]) => void;
        init: () => Promise<void>;
    }
>()((set, get) => ({
    ...defaultUserConfig,

    update: (k, v) => {
        set({ [k]: v } as Partial<IUserConfig>);
        storage.save({ key: STORAGE_KEY, data: get() });
    },

    init: async () => {
        try {
            const cached = await storage.load({ key: STORAGE_KEY });
            if (cached) {
                set(deepMerge(defaultUserConfig, cached));
            }
        } catch {
            // 首次启动无缓存，使用默认值
        }
    },
}));

export const useUserConfig = () => {
    return {
        store: useUserConfigStore,
        /** 在应用启动时调用，从本地存储读取缓存数据还原到 store */
        init: useUserConfigStore.getState().init,
        /** 直接从存储加载数据（不走缓存），失败返回 null */
        load: async (): Promise<IUserConfig | null> => {
            try {
                return await storage.load({ key: STORAGE_KEY });
            } catch {
                return null;
            }
        },
        /** 直接保存数据到存储 */
        save: (data: IUserConfig) => storage.save({ key: STORAGE_KEY, data }),
        /** 删除存储中的数据 */
        remove: () => storage.remove({ key: STORAGE_KEY }),
    };
};

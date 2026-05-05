import {SchoolTermValue} from "@/type/global.ts";
import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {create} from "zustand/react";

interface PhyExpStoreState {
    phyExpList: PhyExp[];
}

const usePhyExpStore = create<PhyExpStoreState>()(() => ({
    phyExpList: [],
}));

export const usePhyExp = () => {
    async function init(year: number, term: SchoolTermValue) {
        const setData = (raw: any, shouldCache: boolean): void => {
            if (!raw) return;
            const list = Array.isArray(raw.data) ? raw.data : raw;
            if (!Array.isArray(list)) return;

            if (shouldCache) {
                store.save({key: "originalPhyExpList", data: raw});
            }

            const current = usePhyExpStore.getState().phyExpList;
            if (JSON.stringify(current) === JSON.stringify(list)) return;
            usePhyExpStore.setState({phyExpList: list});
        };

        // 从内存中加载缓存
        try {
            const cachedRaw = await store.load({key: "originalPhyExpList"}).catch(() => null);
            if (cachedRaw) {
                setData(cachedRaw, false);
            }
        } catch {}

        // 从统一认证拿详细课表
        try {
            const fetchedRaw = await courseApi.getPhyExpList();
            if (fetchedRaw) {
                setData(fetchedRaw, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        }
    }

    return {
        store: usePhyExpStore,
        init,
    };
};

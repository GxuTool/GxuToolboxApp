import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import {Course, PhyExp} from "@/type/infoQuery/course/course.ts";
import {create} from "zustand/react";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import moment from "moment/moment";

interface PhyExpStoreState {
    phyExpList: PhyExp[];
}

const usePhyExpStore = create<PhyExpStoreState>()(() => ({
    phyExpList: [],
}));

export const usePhyExp = () => {
    async function init() {
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

    function patchItem(item: ScheduleTableItem, day: moment.Moment): ScheduleTableItem {
        if (item.title !== "大学物理实验") return item;
        const list = usePhyExpStore.getState().phyExpList;
        if (list.length === 0) return item;
        const dateStr = day.format("YYYY-MM-DD");
        const exp = list.find(e => e.skrq === dateStr);
        if (!exp) return item;
        return {
            ...item,
            title: exp.xmmc || exp.kcmc,
            location: exp.fjbh || exp.sysmc,
            teacher: exp.zjjsxm || exp.zjjs,
        };
    }

    function patchCourse(course: Course, day: moment.Moment): Course {
        if (course.kcmc !== "大学物理实验") return course;
        const list = usePhyExpStore.getState().phyExpList;
        if (list.length === 0) return course;
        const dateStr = day.format("YYYY-MM-DD");
        const exp = list.find(e => e.skrq === dateStr);
        if (!exp) return course;
        return {
            ...course,
            kcmc: exp.xmmc || exp.kcmc,
            cdmc: exp.fjbh || exp.sysmc,
            xm: exp.zjjsxm || exp.zjjs,
        };
    }

    return {
        store: usePhyExpStore,
        init,
        patchItem,
        patchCourse,
    };
};

import {store} from "@/core/store.ts";
import {courseApi} from "@/js/jw/course.ts";
import {CourseClass} from "@/class/jw/course.ts";
import {PhyExpParsed, PhyExpSchema} from "@/type/infoQuery/course/course.ts";
import {PhyExpQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {create} from "zustand/react";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import moment from "moment/moment";

interface PhyExpStoreState {
    phyExpList: PhyExpParsed[];
}

const usePhyExpStore = create<PhyExpStoreState>()(() => ({
    phyExpList: [],
}));

export const usePhyExp = () => {
    async function init() {
        const setData = (res: PhyExpQueryRes, shouldCache: boolean): void => {
            const list = res.data
                .map(i => PhyExpSchema.safeParse(i))
                .filter(r => {
                    if (!r.success) console.warn("物理实验数据解析失败", r.error);
                    return r.success;
                })
                .map(r => r.data);

            if (shouldCache) {
                store.save({key: "originalPhyExpList", data: res});
            }

            const current = usePhyExpStore.getState().phyExpList;
            if (JSON.stringify(current) === JSON.stringify(list)) return;
            usePhyExpStore.setState({phyExpList: list});
        };

        // 从内存中加载缓存
        try {
            const cachedRaw = await store.load<PhyExpQueryRes>({key: "originalPhyExpList"}).catch(() => null);
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
        const dateStr = day.format("YYYYMMDD");
        const exp = list.find(e => e.classDate === dateStr);
        if (!exp) return item;
        return {
            ...item,
            title: exp.experimentName || exp.courseName,
            location: exp.location || exp.labName,
            teacher: exp.teacherName || exp.teacherFull,
        };
    }

    function patchCourse(course: CourseClass, day: moment.Moment): CourseClass {
        if (course.transformed.courseName !== "大学物理实验") return course;
        const list = usePhyExpStore.getState().phyExpList;
        if (list.length === 0) return course;
        const dateStr = day.format("YYYYMMDD");
        const exp = list.find(e => e.classDate === dateStr);
        if (!exp) return course;
        return new CourseClass({
            ...course._ori,
            kcmc: exp.experimentName || exp.courseName,
            cdmc: exp.location || exp.labName,
            xm: exp.teacherName || exp.teacherFull,
        });
    }

    return {
        store: usePhyExpStore,
        init,
        patchItem,
        patchCourse,
    };
};

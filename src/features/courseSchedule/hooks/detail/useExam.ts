import {store} from "@/core/store.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {IExam} from "@/features/courseSchedule/type/schema/exam.ts";
import {normalizeExam} from "@/features/courseSchedule/utils/normalizeExam.ts";
import {examApi} from "@/js/jw/exam.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import {ExamInfoQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import moment from "moment";
import {create} from "zustand/react";

interface ExamStoreState {
    examRaw: ExamInfo[];
    examList: ScheduleTableItem<ExamInfo>[];
}

const useExamStore = create<ExamStoreState>()(() => ({
    examRaw: [],
    examList: [],
}));

export const useExam = () => {
    async function init(year: number, term: SchoolTermValue, startDay: moment.Moment) {
        const setData = (raw: ExamInfoQueryRes, shouldCache: boolean) => {
            if (!raw) return;

            const parsed = IExam.safeParse(raw.items);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }
            const newModel = normalizeExam(parsed.data, startDay, raw.items);

            if (shouldCache) {
                store.save({key: "originalExamList", data: raw});
            }

            const current = useExamStore.getState().examList;
            if (JSON.stringify(current) === JSON.stringify(newModel)) return;
            useExamStore.setState({
                examRaw: raw.items,
                examList: newModel,
            });
        };

        try {
            const cachedRaw = await store.load<ExamInfoQueryRes>({key: "originalExamList"}).catch(() => null);
            if (cachedRaw) {
                setData(cachedRaw, false);
            }
        } catch {}

        try {
            const fetchedRaw = await examApi.getExamInfo(year, term);
            if (fetchedRaw) {
                setData(fetchedRaw, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        }
    }

    return {
        store: useExamStore,
        init,
    };
};

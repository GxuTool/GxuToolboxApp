import {SchoolTermValue} from "@/type/global.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import moment from "moment";
import {useCallback, useEffect} from "react";
import {store} from "@/core/store.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {courseApi} from "@/js/jw/course.ts";
import {JwMachine} from "@/core/auth/Jw/JwMachine.ts";

export function useStartDay(year: number, term: SchoolTermValue) {
    const {store: ucStore} = useUserConfig();
    const startDay = moment(ucStore(s => s.jw.startDay));

    const getStartDay = useCallback(async () => {
        const userInfo = await store
            .load<UserInfo>({
                key: "userInfo",
            })
            .catch(console.warn);
        const account = await JwMachine.loadAccount();
        if (!userInfo || !account) return;

        const data = await courseApi.getClassCourseScheduleNew(year, term, account.username.slice(2, 8));

        if (!Array.isArray(data?.weekNum) || (data?.weekNum.length ?? 0) < 1) return;
        const firstDay = data?.weekNum[0].rq.split("/")[0];
        const s = ucStore.getState();
        if (s.jw.startDay !== firstDay && typeof firstDay === "string") {
            ucStore.getState().update("jw", {...s.jw, startDay: firstDay});
        }
    }, [year, term]);

    useEffect(() => {
        getStartDay();
    }, [getStartDay]);

    return startDay;
}

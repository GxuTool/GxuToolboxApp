import {SchoolTermValue} from "@/type/global.ts";
import {useUserConfig} from "@/hooks/app.ts";
import moment from "moment";
import {useCallback, useEffect} from "react";
import {store} from "@/core/store.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {JwCore} from "@/core/auth/JwCore.ts";
import {courseApi} from "@/js/jw/course.ts";

export function useStartDay(year: number, term: SchoolTermValue) {
    const {userConfig, updateUserConfig} = useUserConfig();
    const startDay = moment(userConfig.jw.startDay);

    const getStartDay = useCallback(async () => {
        const userInfo = await store
            .load<UserInfo>({
                key: "userInfo",
            })
            .catch(console.warn);
        const account = await JwCore.loadAccount();
        if (!userInfo || !account) return;

        const data = await courseApi.getClassCourseScheduleNew(year, term, account.username.slice(2, 8));

        if (!Array.isArray(data?.weekNum) || (data?.weekNum.length ?? 0) < 1) return;
        const firstDay = data?.weekNum[0].rq.split("/")[0];
        if (userConfig.jw.startDay !== firstDay && typeof firstDay === "string") {
            userConfig.jw.startDay = firstDay;
            updateUserConfig(userConfig);
        }
    }, [year, term]);

    useEffect(() => {
        getStartDay();
    }, [getStartDay]);

    return startDay;
}

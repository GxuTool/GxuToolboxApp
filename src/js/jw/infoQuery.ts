import {http, urlWithParams} from "@/core/http.ts";
import {SchoolValue} from "@/type/global.ts";
import moment from "moment/moment";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {store} from "@/core/store.ts";
import {GetClassListRes, GetSubjectListRes} from "@/type/api/base.ts";

export const defaultYear = moment().isBefore(moment("8", "M"), "M") ? moment().year() - 1 : moment().year();

export const infoQuery = {
    getUserInfo: async (): Promise<UserInfo | null> => {
        return await store
            .load<UserInfo>({
                key: "userInfo",
            })
            .catch(e => {
                console.warn(e);
                return null;
            });
    },
    getSubjectList: async (schoolId: SchoolValue): Promise<GetSubjectListRes> => {
        const res = await http.get(
            urlWithParams("/xtgl/comm_cxZydmList.html", {
                jg_id: schoolId,
            }),
        );
        return res.data;
    },
    getClassList: async (schoolId: SchoolValue, subjectId: string, grade: number): Promise<GetClassListRes> => {
        const res = await http.get(
            urlWithParams("/xtgl/comm_cxBjdmList.html", {
                jg_id: schoolId,
                zyh_id: subjectId,
                njdm_id: grade,
            }),
        );
        return res.data;
    },
};

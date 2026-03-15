import axios from "axios";
import {BaseInfoRes, DetailInfo} from "@/type/api/teacherInfo/info.ts";

const http = axios.create({
    baseURL: "https://prof.gxu.edu.cn/backend/openapi/openSearch",
    headers: {
        "Content-Type": "application/json",
    },
});

const teacherInfoApi = {
    getBaseInfo: async (name: string): Promise<BaseInfoRes> => {
        const res = await http.get<BaseInfoRes>("/findByCondition", {
            params: {
                xm: name,
                pageNum: "1",
                pageSize: "12",
            },
        });
        return res.data;
    },

    getDetailInfo: async (name: string, school: string): Promise<DetailInfo> => {
        const baseRes = await teacherInfoApi.getBaseInfo(name);
        const teacherBaseInfo = baseRes.resData.list.find(item => item.dwmc === school);
        const res = await http.get<DetailInfo>("/getTeachInfoByGH", {
            params: {
                GH: teacherBaseInfo?.GH ?? "",
            },
        });
        return res.data;
    },
};

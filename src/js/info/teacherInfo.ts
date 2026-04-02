import axios from "axios";
import {BaseInfoRes, DetailTeacherInfo} from "@/type/api/teacherInfo/info.ts";

const http = axios.create({
    baseURL: "https://prof.gxu.edu.cn/backend/openapi/openSearch",
    headers: {
        "Content-Type": "application/json",
    },
});

export const teacherInfoApi = {
    /**
     * 获取教师基础信息
     * @param name 教师姓名
     */
    getBaseInfo: async (name: string): Promise<BaseInfoRes> => {
        const res = await http.get<BaseInfoRes>("/findByCondition", {
            params: {
                xm: name,
                pageNum: 1,
                pageSize: 100,
            },
        });
        return res.data;
    },

    /**
     * 获取教师详细信息
     * @param name 教师姓名
     * @param school 所在学院名称
     */
    getDetailInfo: async (name: string, school: string): Promise<DetailTeacherInfo> => {
        const baseRes = await teacherInfoApi.getBaseInfo(name);
        const teacherBaseInfo = baseRes.resData.list.find(item => item.dwmc === school);
        const res = await http.get<DetailTeacherInfo>("/getTeachInfoByGH", {
            params: {
                GH: teacherBaseInfo?.GH ?? "",
            },
        });
        return res.data;
    },
};

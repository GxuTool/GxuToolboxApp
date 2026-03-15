import axios from "axios";

const http = axios.create({
    baseURL: "https://prof.gxu.edu.cn/backend/openapi/openSearch",
    headers: {
        "Content-Type": "application/json",
    },
});

const teacherInfoApi = {
    getBaseInfo: async (name: string, school: string) => {
        const res = await http.get("/findByCondition", {
            params: {
                xm: name,
                pageNum: "1",
                pageSize: "1000",
            },
        });
        return res.data;
    },

    getDetailInfo: async (name: string, school: string) => {
        const baseRes = await teacherInfoApi.getBaseInfo(name, school);
        const teacherBaseInfo = baseRes.resData.list.find(item => item.dwmc === school);
        const res = await http.get(
            "/getTeachInfoByGH",
            {
                params: {
                    GH: teacherBaseInfo.GH
                }
            }
        );
        return res.data;
    },
};

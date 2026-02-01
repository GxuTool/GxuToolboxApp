import {http} from "@/core/http.ts";

export const electiveAPI = {
    getCourses: async (xnm = "", xqm = "") => {
        const res = await http.post("/xkcx/xkmdcx_cxXkmdcxIndex.html?doType=query&gnmkdm=N255010", {
            xnm: xnm,
            xqm: xqm,
            kkzt: 1,
            "queryModel.showCount": 1000,
            "queryModel.currentPage": 1,
            "queryModel.sortName": "kklxmc",
        });
        return res.data;
    },
};

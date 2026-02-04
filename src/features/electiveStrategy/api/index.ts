import {http} from "@/core/http.ts";
import {CourseListResScheme} from "@/features/electiveStrategy/api/schema.ts";
import {ExamApiResScheme} from "@/features/examInfo/api/schema.ts";
import {ToastAndroid} from "react-native";

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
        if (typeof res.data === "object") {
            const valiRes = CourseListResScheme.safeParse(res.data);
            if (!valiRes.success) {
                console.log("API 响应错误", valiRes.error);
                return null;
            }
            return valiRes.data;
        } else {
            ToastAndroid.show("获取考试信息失败", ToastAndroid.SHORT);
            return null;
        }
    },
};

import {EvaListQueryRes} from "@/type/api/eduEvaluataion/studentEvaluationAPI.ts";
import {jwxt} from "@/js/jw/jwxt.ts";
import {http, objectToFormUrlEncoded} from "@/core/http.ts";
import {ToastAndroid} from "react-native";

export const evaluationApi = {
    // 获得评价列表
    getEvaluationList: (): Promise<EvaListQueryRes> => {
        return new Promise(async (resolve, reject) => {
            if (!(await jwxt.testToken())) {
                reject();
                return;
            }
            const reqBody = objectToFormUrlEncoded({
                queryModel: {
                    showCount: 150,
                },
            });
            const res = await http.post("/xspjgl/xspj_cxXspjIndex.html?doType=query&gnmkdm=N401605", reqBody);
            if (typeof res.data === "object") {
                resolve(res.data);
            } else {
                ToastAndroid.show("获取评价信息失败", ToastAndroid.SHORT);
                reject(res);
            }
        });
    },
    // 获得具体的HTML页面
    getEvaluationDetail: (
        shaWord: string,
        classId: string,
        courseId: string,
        xsdm: string,
        pjmbmcb_id: string,
    ): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            if (!(await jwxt.testToken())) {
                reject();
                return;
            }
            const reqBody = objectToFormUrlEncoded({
                jgh_id: shaWord,
                jxb_id: classId,
                kch_id: courseId,
                xsdm,
                pjmbmcb_id,
            });
            const res = await http.post("/xspjgl/xspj_cxXspjDisplay.html?gnmkdm=N401605", reqBody);
            if (typeof res.data === "string") {
                resolve(res.data);
            } else {
                ToastAndroid.show("获取具体评价信息失败", ToastAndroid.SHORT);
                reject(res);
            }
        });
    },
    // 只传 default 参数则会消掉所有已有的评价
    handleEvaResult: (Params1: any, Params2?: any): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            if (!(await jwxt.testToken())) {
                reject();
                return;
            }
            // 可选项，目前发现不提交这些也能评价成功
            const Params3 = {
                jszdpjbl: "0",
                xykzpjbl: "0",
                "modelList[0].pjzt": "0",
                tjzt: "0",
            }
            const reqBody = objectToFormUrlEncoded({...Params1,...Params2});
            console.log(reqBody.replaceAll("&", "\n",));
            const res = await http.post("/xspjgl/xspj_bcXspj.html?gnmkdm=N401605", reqBody);
            if (typeof res.data === "string") {
                // ToastAndroid.show(res.data, ToastAndroid.SHORT);
                resolve(res.data);
            } else {
                ToastAndroid.show("保存失败", ToastAndroid.SHORT);
                reject(res);
            }
        });
    },
    submitEvaResult: (Params1: any, Params2?: any): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            if (!(await jwxt.testToken())) {
                reject();
                return;
            }
            // 这两个参数在提交时必填。。。
            const Params3 = {
                jszdpjbl: "0",
                xykzpjbl: "0",
            };
            const reqBody = objectToFormUrlEncoded({...Params1,...Params2,...Params3});
            console.log(reqBody.replaceAll("&", "\n",));
            const res = await http.post("/xspjgl/xspj_tjXspj.html?gnmkdm=N401605", reqBody);
            if (typeof res.data === "string") {
                ToastAndroid.show(res.data, ToastAndroid.SHORT);
                resolve(res.data);
            } else {
                ToastAndroid.show("保存失败", ToastAndroid.SHORT);
                reject(res);
            }
        });
    },
};

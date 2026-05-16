import {SchoolTerms, SchoolTermValue, SchoolYears} from "@/type/global.ts";
import {jwxt} from "@/js/jw/jwxt.ts";
import {http, objectToFormUrlEncoded} from "@/core/http.ts";
import {defaultYear} from "@/js/jw/infoQuery.ts";
import {ToastAndroid} from "react-native";
import {ExamApiResScheme} from "@/features/examInfo/api/schema.ts";
import {ExamInfoApiResponse} from "@/features/examInfo/type/exam.types.ts";

export async function getExamInfo(
    year: number,
    term: SchoolTermValue,
    page: number = 1,
): Promise<ExamInfoApiResponse | null> {
    const yearIndex = SchoolYears.findIndex(v => +v[0] === year);
    const reqBody = objectToFormUrlEncoded({
        xnm: SchoolYears[yearIndex ?? SchoolYears.findIndex(v => +v[0] === defaultYear)][0],
        xqm: term ?? SchoolTerms[0][0],
        queryModel: {
            showCount: 15,
            currentPage: page > 0 ? page : 1,
            sortName: "",
            sortOrder: "asc",
        },
    });
    const res = await http.post("/kwgl/kscx_cxXsksxxIndex.html?doType=query", reqBody);
    if (typeof res.data === "object") {
        const valiRes = ExamApiResScheme.safeParse(res.data);
        if (!valiRes.success) {
            console.log("API 响应错误", valiRes.error);
            return null;
        }
        return valiRes.data;
    } else {
        return null;
    }
}

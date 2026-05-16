import {http} from "@/core/http.ts";
import {personalInfoParser} from "@/js/HTMLparser/personalInfoParser.ts";

export const getPersonalInfo = async () => {
    const res = await http.post("/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801");
    if (typeof res.data === "string") {
        const html = res.data;
        return personalInfoParser(html);
    }
};

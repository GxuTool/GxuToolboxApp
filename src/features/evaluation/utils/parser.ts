import cheerio from "react-native-cheerio";
import {EvaluationIds, SelectedMap} from "@/features/evaluation/types/evaluation.type.ts";

interface Category {
    name: string; // 大指标名，如“师德表现”
    qzz: number; // 大指标权重
    items: Item[];
}

interface Option {
    label: string; // 选项文字
    score: number; // 对应分值
    pfdjdmxmb_id: string; // 选项 ID
    checked?: boolean; // 是否默认选中
}

interface Item {
    title: string; // 指标标题
    qzz: number; // 权重
    options: Option[];
    // 其它业务字段
    pjzbxm_id: string;
    pfdjdmb_id: string;
}

interface Teacher {
    name: string; // 教师姓名
    categories: Category[];
    comment?: string; // 评语
}
/** 解析HTML为可读的类型 */
export const parseEvaluationHTML = (html: string) => {
    /* ---------- 0. 基本环境 ---------- */
    const $ = cheerio.load(html);
    const idObj: EvaluationIds = {panelId: "", formId: "", sections: []};
    const teachers: Teacher[] = [];
    const selected: SelectedMap = {};

    /* ---------- 1. 课程头部信息 ---------- */

    /* ---------- 2. 教师列表 ---------- */
    const $panels = $(".panel-pjdx");

    $panels.each((teacherIdx: number, panel: any) => {
        const $panel = $(panel);
        idObj.formId = $panel[0].attribs["data-xspfb_id"];
        idObj.panelId = $panel[0].attribs["data-pjmbmcb_id"];
        idObj.sections = [];

        /* 2.1 教师姓名 */
        const rawTitle = $panel.find(".panel-title").text();
        const teacherName = rawTitle.match(/评价对象（教师）(.*?)总分/)?.[1]?.trim() || "";

        /* 2.2 大指标（blockquotes） */
        const categories: Category[] = [];
        const $blockquotes = $panel.find("blockquote");

        $blockquotes.each((catIdx: number, bq: any) => {
            const $bq = $(bq);
            const categoryName = $bq.find("p").text().trim();

            const $table = $bq.next("table");
            if ($table.length === 0) {
                console.error("      ❌ blockquote 后没有 table！");
                return;
            }
            // 拿到了table ID
            idObj.sections.push({
                sectionId: $table[0].attribs["data-pjzbxm_id"],
                questions: [],
            });
            // console.log("tableId",bIdx, $table[0].attribs["data-pjzbxm_id"]);
            const categoryQzz = parseFloat($table.attr("data-qzz") || "1");

            /* 2.3 小指标 tr */
            const items: Item[] = [];
            const $trs = $table.find("tr.tr-xspj");

            $trs.each((itIdx: number, tr: any) => {
                const $tr = $(tr);
                const title = $tr.find("td").first().text().trim();
                const qzz = parseFloat($tr.attr("data-qzz") || "1");
                const question = {
                    optionIds: [],
                    pfId: $tr[0].attribs["data-pfdjdmb_id"],
                    pjId: $tr[0].attribs["data-pjzbxm_id"],
                    zsId: $tr[0].attribs["data-zsmbmcb_id"],
                };
                idObj.sections[catIdx].questions.push(question);
                /* 2.4 选项 */
                const options: Option[] = [];
                const $labels = $tr.find(".radio-inline");

                $labels.each((optIdx: number, label: any) => {
                    const $label = $(label);
                    const input = $label.find("input");
                    const opt: Option = {
                        label: $label.text().trim(),
                        score: parseInt(input.attr("data-dyf")!, 10),
                        pfdjdmxmb_id: input.attr("data-pfdjdmxmb_id")!,
                        checked: input.is("[checked]"),
                    };
                    question.optionIds.push(opt.pfdjdmxmb_id);
                    if (opt.checked) {
                        if (!selected[teacherIdx]) {
                            selected[teacherIdx] = {};
                        }
                        if (!selected[teacherIdx][catIdx]) {
                            selected[teacherIdx][catIdx] = {};
                        }
                        selected[teacherIdx][catIdx][itIdx] = optIdx;
                    }
                    options.push(opt);
                });

                items.push({
                    title,
                    qzz,
                    options,
                    pjzbxm_id: $tr.attr("data-pjzbxm_id")!,
                    pfdjdmb_id: $tr.attr("data-pfdjdmb_id")!,
                });
            });

            categories.push({name: categoryName, qzz: categoryQzz, items});
        });

        /* 2.5 评语 */
        const comment = $panel.find(".form-control").text() || "";
        teachers.push({name: teacherName, categories, comment});
    });
    /* ---------- 3. 返回 ---------- */
    return {
        idObj,
        teachers,
        selected,
    };
};

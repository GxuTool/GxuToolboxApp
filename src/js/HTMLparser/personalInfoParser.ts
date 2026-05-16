import cheerio from "react-native-cheerio";

export function personalInfoParser(html: string) {
    const $ = cheerio.load(html);
    return $("[id^='content_xsxxgl_']")
        .find("div.form-group")
        .map((_: any, group: any) => {
            const prefix = $(group).closest("[id^='content_xsxxgl_']").attr("id")?.replace("content_xsxxgl_", "") || "";
            const label = $(group).find("label.control-label").text().trim().replace("：", "");
            const value = $(group).find("p.form-control-static").text().trim();
            if (value === "") return;
            return {prefix, label, value};
        })
        .get();
}

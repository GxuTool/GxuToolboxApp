import cheerio from "react-native-cheerio";

export function personalInfoParser(html: string) {
    const $ = cheerio.load(html);
    return $("#content_xsxxgl_xsjbxx,#content_xsxxgl_xsxjxx")
        .find("div.form-group")
        .map((_: any, group: any) => {
            const label = $(group).find("label.control-label").text().trim().replace("：", "");
            const value = $(group).find("p.form-control-static").text().trim();
            return {label, value};
        })
        .get();
}

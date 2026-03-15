type StrNum = `${number}`;

export type SimpleInfo = {
    GH: string;
    XM: string;
    dwmc: string;
    pic: string;
};

export interface BaseInfoRes {
    resCode: number;
    resData: {
        list: SimpleInfo[];
        pages: number;
        total: number;
    };
    resMsg: string | null;
}

export interface DetailInfo {
    resCode: number;
    resData: {
        baseInfo: {
            CSRQ: null;
            DWH: StrNum;
            GH: null;
            XBM: StrNum;
            XM: string;
            ZHXWMC: string;
            address: string;
            dslb: string;
            dwUrl: string;
            dwh1: StrNum;
            dwh2: StrNum;
            email: string;
            firstLetter: string;
            forEditDwmc: string;
            isadmin: StrNum;
            iscampus: StrNum;
            isview: StrNum;
            jiguan: null | string;
            jzgdqzt: StrNum;
            pic: string;
            qq: StrNum | null;
            sjgxrq: number;
            tbzrr: string;
            tel: string | null;
            topedu: string;
            weixin: string | null;
            yzbm: StrNum;
            zdejxkbh: StrNum;
            zdejxkbh2: StrNum;
            zdxkChs: {
                category: string;
                xkOne: string;
                xkTwo: string;
            }[];
            zdxkmlbh: StrNum;
            zdxkmlbh2: StrNum;
            zdyjxkbh: StrNum;
            zdyjxkbh2: StrNum;
            zhicheng: string;
            zhiwu: string | null;
            zyyjfx: string | null;
            zzmm: string;
        };
        largeMsg: {
            GH: StrNum;
            lw: string;
            qdcg: null;
            ryyhj: string;
            xsjz: string;
            zckyxm: string;
            zl: string;
            zsxx: string;
            zyxxjx: string;
            zyyjfx: string;
            zyyjskc: string;
            zz: string;
        };
        showAllTab: boolean;
        showInfo: {
            GH: null;
            show_CSRQ: StrNum;
            show_ZHXWMC: StrNum;
            show_address: StrNum;
            show_email: StrNum;
            show_jiguan: StrNum;
            show_qq: StrNum;
            show_tel: StrNum;
            show_topedu: StrNum;
            show_weixin: StrNum;
            show_yzbm: StrNum;
            show_zhicheng: StrNum;
            show_zzmm: StrNum;
        };
    };
    resMsg: string | null;
}

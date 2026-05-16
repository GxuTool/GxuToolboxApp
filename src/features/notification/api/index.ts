import {store} from "@/core/store.ts";
import {jwxt} from "@/js/jw/jwxt.ts";

const getNotifications = async (isRead: number) => {
    const userConfig = await store.load({key: "userConfig"}).catch(e => {
        console.warn(e);
    });
    // setStartDay(userConfig.jw.startDay);
    // setLoading(true);
    // setNotificationList([]);
    // setExpandedIndex(null);
    try {
        const res = await jwxt.getReschedulingNews(isRead);
        let res1: any = [];
        res.data.items.forEach((item: {xxnr: string; cjsj: string}) => {
            let m;
            while ((m = reg.exec(item.xxnr)) !== null) {
                res1.push({...m.groups, time: item.cjsj, text: item.xxnr});
            }
        });
        // setNotificationList(res1);
    } catch (e) {
        console.error("Failed to fetch news:", e);
    } finally {
        // setLoading(false);
    }
};

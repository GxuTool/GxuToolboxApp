import {useEffect, useState} from "react";
import {courseApi} from "@/js/jw/course.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {normalizeCourse} from "@/features/courseSchedule/utils/normalizeCourse.ts";

export const useClassScheduleData = (year, term, school, subject, grade, classId) => {
    const [list, setList] = useState([]);
    const [index, setIndex] = useState(0);
    const [theorySchedule, setTheorySchedule] = useState(null);
    const [practicalSchedule, setPracticalSchedule] = useState(null);

    const [loading, setLoading] = useState<boolean>(false);

    const fetchList = async (year, term, school, subject, grade, classId) => {
        setLoading(true);
        const res = await courseApi.getClassCourseScheduleList(year, term, school, subject, grade, classId);
        setList(res.items);
        setIndex(0);
        setLoading(false);
    };

    const process = (raw: any) => {
        if (!raw) return;
        console.log(raw);

        // 总是解析
        const parsed = ICourse.safeParse(raw);
        if (!parsed.success) {
            console.warn("解析原始数据失败", parsed.error);
            return;
        }

        const theory = normalizeCourse(parsed.data);
        const practical = parsed.data.practiceList;
        setTheorySchedule(theory);
        setPracticalSchedule(practical);
    };

    // list 变了 → 自动拉第一条
    useEffect(() => {
        const item = list[0];
        if (!item) return;
        fetchSchedule(item);
    }, [list]);

    // 手动触发
    const fetchSchedule = (item = list[index]) => {
        setLoading(true);
        if (!item) {
            setLoading(false);
            return;
        }
        courseApi
            .getClassCourseSchedule(+item.xnm, item.xqm, item.jgdm, item.zyh_id, +item.njdm_id, item.bh_id)
            .then(res => {
                if (res) process(res);
                setLoading(false);
            });
    };

    return {list, index, setIndex, fetchList, fetchSchedule, theorySchedule, practicalSchedule, loading};
};

import {useEffect, useState} from "react";
import {courseApi} from "@/js/jw/course.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {normalizeCourse} from "@/features/courseSchedule/utils/normalizeCourse.ts";
import {IClassList} from "@/features/classCourseSchedule/type/schema/classList.ts";
import {SchoolTermValue, SchoolValue} from "@/type/global.ts";

export const useClassScheduleData = () => {
    const [list, setList] = useState<IClassList>([]);
    const [index, setIndex] = useState(0);
    const [theorySchedule, setTheorySchedule] = useState(null);
    const [practicalSchedule, setPracticalSchedule] = useState(null);

    const [trafficBytes, setTrafficBytes] = useState(0);

    const [loading, setLoading] = useState<boolean>(false);

    const fetchList = async (year?, term?, school?, subject?, grade?, classId?) => {
        setLoading(true);
        const res = await courseApi.getClassCourseScheduleList(year, term, school, subject, grade, classId);

        const parsed = IClassList.safeParse(res.items);
        if (!parsed.success) {
            console.warn("解析原始数据失败", parsed.error);
            return;
        }
        setTrafficBytes(prev => prev + new Blob([JSON.stringify(res.items)]).size);
        setList(parsed.data);
        setIndex(0);
        setLoading(false);
    };

    const process = (raw: any) => {
        if (!raw) return;

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
            .getClassCourseSchedule(
                item.year,
                item.term as SchoolTermValue,
                item.schoolId as SchoolValue,
                item.majorId,
                item.gradeId,
                item.classId,
            )
            .then(res => {
                setTrafficBytes(prev => prev + new Blob([JSON.stringify(res)]).size);
                if (res) process(res);
                setLoading(false);
            });
    };

    return {list, index, setIndex, fetchList, fetchSchedule, theorySchedule, practicalSchedule, loading, trafficBytes};
};

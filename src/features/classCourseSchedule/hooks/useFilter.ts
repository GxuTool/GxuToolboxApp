import {useEffect, useState} from "react";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {infoQuery} from "@/js/jw/infoQuery.ts";
import {Schools, SchoolValue} from "@/type/global.ts";
import moment from "moment";

export const useFilter = () => {
    const [school, setSchool] = useState<SchoolValue>(
        Schools[Schools.findIndex(v => v[1] === (userInfo?.school ?? Schools[0][1]))][0],
    );
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState(moment().year());
    const [classId, setClassId] = useState("");

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [subjectList, setSubjectList] = useState<string[][]>([]);
    const [classList, setClassList] = useState<string[][]>([]);
    const fetchSubjectList = async (schoolId: SchoolValue) => {
        const res = await infoQuery.getSubjectList(schoolId);
        return res?.map(item => [item.zyh_id, item.zymc]) ?? [];
    };

    const fetchClassList = async (schoolId: SchoolValue, subjectId: string, gradeId: number) => {
        const res = await infoQuery.getClassList(schoolId, subjectId, gradeId);
        return res?.map(item => [item.bh_id, item.bj]) ?? [];
    };

    useEffect(() => {
        (async () => {
            const info = await infoQuery.getUserInfo();
            if (!info) return;

            // 通过学院名反查对应的代码
            const schoolIndex = Schools.findIndex(v => v[1] === (info.school ?? Schools[0][1]));
            const school = Schools[schoolIndex][0];

            // 通过学院对应的代码查该学院有什么专业
            const subjectList = await fetchSubjectList(school);

            // 用户的专业对应的代码
            const subjectIndex = subjectList.findIndex(v => v[1].indexOf(info.subject_id) > -1);
            const subject = subjectList[subjectIndex][0];

            // 用户所在的这一届
            const grade = info.grade ?? moment().year();

            // 所在专业有哪些班级
            const classList = await fetchClassList(school, subject, grade);

            // 用户所在的班级
            const newClassIndex = classList.findIndex(v => v[1].indexOf(info.class) > -1);

            setUserInfo(info);
            setSchool(school);
            setSubjectList(subjectList);
            setSubject(subject);
            setGrade(grade);
            setClassList(classList);
            setClassId(classList[newClassIndex][0]);
        })();
    }, []);

    const changeSchool = async (newSchool: SchoolValue) => {
        setSchool(newSchool);
        setSubject("");
        setClassId("");
        setSubjectList(await fetchSubjectList(newSchool));
        setClassList([]);
    };

    const changeSubject = async (newSubject: string) => {
        setSubject(newSubject);
        setClassId("");
        setClassList(await fetchClassList(school, newSubject, grade));
    };

    const changeGrade = async (newGrade: number) => {
        setGrade(newGrade);
        setClassId("");
        setClassList(await fetchClassList(school, subject, newGrade));
    };

    return {
        userInfo,
        school,
        changeSchool,
        subject,
        changeSubject,
        grade,
        changeGrade,
        classId,
        classList,
        subjectList,
        setClassId,
    };
};

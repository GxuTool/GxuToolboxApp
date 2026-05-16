import {SchoolTerms, SchoolTermValue, SchoolYears, SchoolYearValue} from "@/type/global.ts";
import {useState} from "react";
import {useUserConfig} from "@/hooks/useUserConfig.ts";

/**
 * 自定义Hook，用于管理学校学期信息的状态
 *
 * @param yearV - 学年值，可选参数，如果未提供则使用用户配置中的学年
 * @param termV - 学期值，可选参数，如果未提供则使用用户配置中的学期
 *
 * @returns 包含学年学期状态和相关操作方法的对象：
 * - year: 当前学年状态值
 * - setYear: 设置学年状态的方法
 * - term: 当前学期状态值
 * - setTerm: 设置学期状态的方法
 * - SchoolYears: 可用的学年选项列表
 * - SchoolTerms: 可用的学期选项列表
 * - userConfigYear: 用户配置中的学年值
 * - userConfigTerm: 用户配置中的学期值
 */
export function useSchoolTerm(yearV?: SchoolYearValue, termV?: SchoolTermValue) {
    const {store} = useUserConfig();
    const jwYear = store(s => s.jw.year);
    const jwTerm = store(s => s.jw.term);
    const [year, setYear] = useState<SchoolYearValue>(yearV ?? +jwYear);
    const [term, setTerm] = useState<SchoolTermValue>(termV ?? jwTerm);

    function setBoth(newYear: SchoolYearValue, newTerm: SchoolTermValue) {
        setYear(newYear);
        setTerm(newTerm);
    }

    return {
        year,
        setYear,
        term,
        setTerm,
        SchoolYears,
        SchoolTerms,
        userConfigYear: +jwYear,
        userConfigTerm: jwTerm,
        setBoth,
    };
}

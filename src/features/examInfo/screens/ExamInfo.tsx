import {ScrollView, StyleSheet, View} from "react-native";
import {Divider, Text, useTheme} from "@rneui/themed";
import React, {useEffect, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {SchoolTermValue} from "@/type/global.ts";
import {NumberInput} from "@/components/un-ui/NumberInput.tsx";
import {store} from "@/core/store.ts";
import {Color} from "@/shared/color.ts";
import {useUserConfig} from "@/hooks/app.ts";
import {getExamInfo} from "@/features/examInfo/api";
import {ExamInfoCard} from "@/features/examInfo/components/ExamInfoCard.tsx";
import {ExamInfoApiResponse} from "@/features/examInfo/type/exam.types.ts";
import {ChooseTerm} from "@/components/tool/infoQuery/examInfo/ChooseTerm.tsx";

const initRes: ExamInfoApiResponse = {
    currentPage: 1,
    totalPage: 1,
    totalCount: 0,
    items: [],
};

export function ExamInfo() {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const [apiRes, setApiRes] = useState<ExamInfoApiResponse>(initRes as ExamInfoApiResponse);
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const [page, setPage] = useState(1);

    const style = StyleSheet.create({
        container: {
            padding: "5%",
            paddingTop: 0,
        },
        tableText: {
            color: theme.colors.black,
            margin: 5,
        },
        tableBorder: {
            borderWidth: 2,
            borderColor: Color.mix(theme.colors.primary, theme.colors.grey4, 0.4).rgbaString,
        },
        tableHeader: {
            backgroundColor: Color.mix(
                Color(theme.colors.primary),
                Color(theme.colors.background),
                theme.mode === "dark" ? 0.7 : 0.2,
            ).setAlpha(theme.mode === "dark" ? 0.3 : 0.6).rgbaString,
        },
        tableHeaderText: {},
    });

    function init() {
        store
            .load({key: "examInfo"})
            .then(data => {
                setApiRes(data);
            })
            .catch(console.warn);
    }

    async function query() {
        const res = await getExamInfo(year, term, page);
        if (!res) return;

        res.items.sort((a, b) => {
            // 1. 定义 status 优先级：upcoming(0) > tbd(1) > past(2)
            const statusOrder: Record<string, number> = {
                upcoming: 0,
                tbd: 1,
                past: 2,
            };

            const orderA = statusOrder[a.status] ?? 3;
            const orderB = statusOrder[b.status] ?? 3;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            // upcoming 升序，其他状态降序
            const sortDirection = orderA === 0 ? 1 : -1;
            return (a.examDate - b.examDate) * sortDirection;
        });

        console.log(res);
        setApiRes(res);
        await store.save({key: "examInfo", data: res});
    }

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        query();
    }, [year, term, page]);

    return (
        <ScrollView>
            <ChooseTerm
                onTermSelect={(Year, Term) => {
                    setYear(Year);
                    setTerm(Term);
                }}
                includeWholeLife={false}
                includeWholeYear={false}
            />
            <View style={style.container}>
                <Divider />
                <Flex direction="column" gap={15} align="flex-start">
                    <Flex align="flex-end" gap={5}>
                        <Text h4>查询结果</Text>
                        <Text>{`第${apiRes.currentPage ?? 1}/${apiRes.totalPage ?? 1}页，共有${
                            apiRes.totalCount ?? 0
                        }条结果`}</Text>
                    </Flex>
                    <Flex gap={10}>
                        <Text>页数</Text>
                        <Flex inline>
                            <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                        </Flex>
                        <Text>每页15条记录</Text>
                    </Flex>

                    <View style={{width: "100%", gap: 15}}>
                        {apiRes.items.map((item, index) => (
                            <ExamInfoCard key={item.courseId + index} item={item} />
                        ))}
                    </View>

                    {apiRes.items.length > 5 && (
                        <Flex gap={10}>
                            <Text>页数</Text>
                            <Flex inline>
                                <NumberInput value={page} onChange={setPage} min={1} max={apiRes.totalPage ?? 1} />
                            </Flex>
                            <Text>每页15条记录</Text>
                        </Flex>
                    )}
                </Flex>
            </View>
        </ScrollView>
    );
}

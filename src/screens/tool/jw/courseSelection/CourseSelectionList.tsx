import {ScrollView, View} from "react-native";
import {Button, Input, Text, useTheme} from "@rneui/themed";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {CourseListTypeId, CourseSelectionListItem} from "@/type/infoQuery/course/course.ts";
import {Picker} from "@react-native-picker/picker";
import React, {useEffect, useState} from "react";
import {courseApi} from "@/js/jw/course.ts";
import Flex from "../../../../components/un-ui/Flex.tsx";
import {UnText} from "@/components/un-ui";
import {SchoolTerms} from "@/type/global.ts";
import {Color} from "@/js/color.ts";

const listTypeMap: Record<CourseListTypeId, string> = {
    "01": "主修课程",
    "05": "体育分项",
    "09": "特殊课程",
    "10": "通识选修课",
    "11": "其他特殊课程",
};

type CourseListGroup = Record<
    CourseSelectionListItem["kch"],
    {
        initInfo: CourseSelectionListItem;
        list: CourseSelectionListItem[];
        totalCapacity: number;
        selectedCount: number;
    }
>;
export default function CourseSelectionList() {
    const [year, setYear] = useState(2025);
    const [term, setTerm] = useState(SchoolTerms[1][0]);

    const [keyword, setKeyword] = useState("");
    const [listType, setListType] = useState<CourseListTypeId>(CourseListTypeId.Optional);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(1000);

    const [courseList, setCourseList] = useState<CourseSelectionListItem[]>([]);
    const [courseListGroup, setCourseListGroup] = useState<CourseListGroup>({});

    const getList = async () => {
        const res = await courseApi.courseSelection.getList(year, term, listType, page, pageSize, keyword);
        if (res?.tmpList) {
            setCourseList(res.tmpList);
            const newGroup: CourseListGroup = {};
            res.tmpList.forEach(course => {
                if (newGroup[course.kch]) {
                    newGroup[course.kch].list.push(course);
                } else {
                    newGroup[course.kch] = {
                        initInfo: course,
                        list: [course],
                        selectedCount: 0,
                        totalCapacity: 0,
                    };
                }
            });
            for (const kch in newGroup) {
                const group = newGroup[kch];
                group.totalCapacity = group.list.map(course => +course.jxbzls).reduce((pv, cv) => pv + cv);
                group.selectedCount = group.list.map(course => +course.yxzrs).reduce((pv, cv) => pv + cv);
            }
            setCourseListGroup(newGroup);
        }
    };

    useEffect(() => {
        getList();
    }, [page, pageSize, listType]);

    return (
        <>
            <ScrollView
                contentContainerStyle={{
                    padding: "5%",
                }}>
                <Text>课程名称筛选</Text>
                <Input placeholder="输入关键词" value={keyword} onChangeText={setKeyword} />
                <Text>课程类型</Text>
                <UnPicker<CourseListTypeId> selectedValue={listType} onValueChange={setListType}>
                    {Object.entries(listTypeMap).map(([id, name]) => (
                        <Picker.Item label={name} key={id} value={id} />
                    ))}
                </UnPicker>
                <Button onPress={getList}>查询</Button>

                <Flex direction="column" gap={10} align="flex-start" style={{marginTop: 10}}>
                    <Flex align="flex-end" gap={5}>
                        <Text h4>查询结果</Text>
                        <Text>
                            {`共有${Object.entries(courseListGroup).length ?? 0}门课程，${courseList.length}个教学班`}
                        </Text>
                    </Flex>

                    {Object.entries(courseListGroup).map(([kch, courseGroup]) => (
                        <CourseListItemEle key={kch} item={[kch, courseGroup]} />
                    ))}
                </Flex>
            </ScrollView>
        </>
    );
}

const CourseListItemEle = ({item: [kch, courseGroup]}: {item: [string, CourseListGroup[string]]}) => {
    const {theme} = useTheme();
    return (
        <Flex
            direction="column"
            align="flex-start"
            gap={4}
            style={{
                backgroundColor: Color(theme.colors.primary).setAlpha(0.2).rgbaString,
                width: "100%",
                paddingHorizontal: 4,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Color(theme.colors.primary).setAlpha(0.6).rgbaString,
            }}>
            <Flex gap={16} justify="space-between" style={{width: "100%"}}>
                <UnText
                    numberOfLines={1}
                    style={{
                        maxWidth: "80%",
                    }}
                    color={theme.colors.primary}>
                    {`${kch} - ${courseGroup.list.length}个教学班（${courseGroup.selectedCount}人已选）`}
                </UnText>
                <UnText color={theme.colors.primary}>{`${courseGroup.initInfo.xf} 学分`}</UnText>
            </Flex>
            <UnText size={16} color={theme.colors.primary} style={{fontWeight: "bold"}}>
                {courseGroup.initInfo.kcmc}
            </UnText>
            <Flex gap={4}>
                {courseGroup.initInfo.kzmc.split(",").map(tag => (
                    <View
                        style={{
                            maxWidth: "50%",
                            paddingHorizontal: 2,
                            paddingVertical: 1,
                            borderRadius: 2,
                            borderWidth: 1,
                            borderColor: Color(theme.colors.primary).setAlpha(0.6).rgbaString,
                        }}>
                        <UnText color={theme.colors.primary} size={10} numberOfLines={1}>
                            {tag}
                        </UnText>
                    </View>
                ))}
            </Flex>
        </Flex>
    );
};

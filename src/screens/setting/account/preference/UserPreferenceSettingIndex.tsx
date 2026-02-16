import {UnListSection, UnSectionList} from "@/components/un-ui/UnSectionList.tsx";
import {useUserConfig} from "@/hooks/app.ts";

export function UserPreferenceSettingIndex() {
    const {userConfig, updateUserConfig} = useUserConfig();

    const settingList: UnListSection[] = [
        {
            title: "信息显示",
            data: [
                {
                    label: "课程元素详情显示",
                    type: "navigation",
                    value: "CourseItemDetailSetting",
                },
                {
                    label: "考试元素详情显示",
                    type: "navigation",
                    value: "ExamItemDetailSetting",
                },
            ],
        },
    ];

    return <UnSectionList sections={settingList} contentContainerStyle={{padding: "5%"}} />;
}

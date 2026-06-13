import {useRef} from "react";
import {Button, ScrollView, View} from "react-native";
import {FormProvider, useForm} from "react-hook-form";
import * as FormItem from "@/features/feedback/components/formItem";

type CreateFeedback = {
    type: string;
    feature: string;
    tags: string[];
    content: string;
    contactType: string;
    contact: string;
};

export function FeedbackView() {
    const scrollRef = useRef<ScrollView>(null);
    const form = useForm<CreateFeedback>({
        defaultValues: {
            type: "",
            feature: "",
            content: "",
            contactType: "",
            contact: "",
        },
    });

    const onSubmit = (data: CreateFeedback) => {
        console.log(data);
    };

    function scrollToContentInput() {
        setTimeout(() => {
            scrollRef.current?.scrollTo({y: 220, animated: true});
        }, 250);
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView
                ref={scrollRef}
                style={{flex: 1}}
                contentContainerStyle={{padding: 16, paddingBottom: 48}}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={{borderRadius: 16, backgroundColor: "#fff", padding: 16}}>
                    <FormProvider {...form}>
                        <FormItem.Pick
                            name="type"
                            label="反馈类型"
                            placeholder="请选择"
                            units={[
                                {label: "Bug 反馈", value: "bug"},
                                {label: "功能建议", value: "suggestion"},
                                {label: "体验问题", value: "experience"},
                                {label: "其他", value: "other"},
                            ]}
                            rules={{
                                required: "请选择反馈类型",
                            }}
                        />

                        <FormItem.Chooser
                            name="feature"
                            label="问题模块"
                            options={[
                                {label: "课表", value: "schedule"},
                                {label: "成绩", value: "score"},
                                {label: "考试", value: "exam"},
                                {label: "账号登录", value: "auth"},
                                {label: "其他", value: "other"},
                            ]}
                            rules={{
                                required: "请选择问题模块",
                            }}
                        />

                        <FormItem.MultilineInput
                            name="content"
                            label="反馈内容"
                            placeholder="请描述你遇到的问题、操作步骤和期望结果"
                            onFocus={scrollToContentInput}
                            rules={{
                                required: "请填写反馈内容",
                                minLength: {
                                    value: 10,
                                    message: "反馈内容至少 10 个字",
                                },
                            }}
                        />

                        <FormItem.Pick
                            name="contactType"
                            label="联系方式类型"
                            placeholder="请选择联系方式"
                            units={[
                                {label: "QQ", value: "qq"},
                                {label: "微信", value: "wechat"},
                                {label: "邮箱", value: "email"},
                            ]}
                        />

                        <FormItem.Input name="contact" label="联系方式" placeholder="选填，方便我们联系你" />
                    </FormProvider>

                    <View style={{marginTop: 24}}>
                        <Button title="提交" onPress={form.handleSubmit(onSubmit)} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

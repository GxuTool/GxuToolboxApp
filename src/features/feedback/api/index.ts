import {feedbackHttp}from"@/features/feedback/api/client.ts";
import {
    FeedbackRes,
    FeedbackListData,
    SubmitFeedbackBody,
    SubmitFeedbackData,
} from "@/features/feedback/api/feedback.ts";
import {washFeedbackList,FeedbackItemVM} from "@/api/schema/feedbackSchema.ts";

export const feedbackApi={
    submit:async(body:SubmitFeedbackBody):Promise<number>=>{
        const res=await feedbackHttp.post<FeedbackRes<SubmitFeedbackData>>("/feedback",body);
        return res.data.data.id;
    },
    getMyList:async(
        userId:string,
        page:number=1,
        pageSize:number=10,
    ):Promise<FeedbackItemVM[]>=>{
        const res=await feedbackHttp.get<FeedbackRes<FeedbackListData>>(
            `/feedback/${userId}`,
            {params:{page,pageSize}},
        );
        return washFeedbackList(res.data.data.list);
    }
}

import {z}from "zod";
import {FeedbackItem,FeedbackStatus} from "@/features/feedback/api/feedback.ts";

const feedbackItemSchema=z.object({
    id:z.number(),
    userId:z.string(),
    type:z.string(),
    feature:z.string(),
    content:z.string(),
    contactType:z.string(),
    contact:z.string(),
    deviceModel:z.string(),
    appVersion:z.string(),
    adminNote:z.string().nullable(),
    createdAt:z.string(),
    updatedAt:z.string(),
});

export interface FeedbackItemVM extends FeedbackItem {
    status:FeedbackStatus;
}

export function washFeedbackItem(raw:unknown):FeedbackItemVM|null {
    const result = feedbackItemSchema.safeParse(raw);
    if (!result.success) return null;
    const item=result.data;
    return {
        ...item,
        status:item.adminNote?"replied":"pending",
    };
}

export function washFeedbackList(rawList:unknown):FeedbackItemVM[]{
    if(!Array.isArray(rawList))return [];
    const out:FeedbackItemVM[]=[];
    for(const raw of rawList){
        const item=washFeedbackItem(raw);
        if(item)out.push(item);
    }
    return out;
}

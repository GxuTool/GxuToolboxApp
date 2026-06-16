export interface FeedbackRes<T>{
    code:number;
    message:string;
    data:T;
}

//一条反馈的完整数据
export interface FeedbackItem{
    id:number;
    userId:string;
    type:string;
    feature:string;
    content:string;
    contactType:string;
    contact:string;
    deviceModel:string;
    appVersion:string;
    adminNote:string|null;
    createdAt:string;
    updatedAt:string;
}

//列表接口数据的结构
export interface FeedbackListData{
    list:FeedbackItem[];
    meta:{
        total:number;
        page:number;
        pageSize:number;
        totalPages:number;
    },
}

//传给后端的东西
export interface SubmitFeedbackBody{
    userId:string;
    type:string;
    feature:string;
    content:string;
    contactType:string;
    contact:string;
    deviceModel:string;
    appVersion:string;
}

//传给后端后，后端传回的东西
export interface SubmitFeedbackData{
    id:number;
}

//回复状态
export type FeedbackStatus="pending"|"replied";

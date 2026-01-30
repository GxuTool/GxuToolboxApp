import {ExamStatus} from "@/features/examInfo/utils/timeParser.ts";

export interface ExamInformation {
    course: string;
    classroom: string;
    time: string;
    courseId: string;
    seat: string | null;
    type: string;

    examDate: Date | null;
    status: ExamStatus;
}

export interface ExamInfoApiResponse {
    currentPage: number;
    totalPage: number;
    totalCount: number;
    items: ExamInformation[];
}

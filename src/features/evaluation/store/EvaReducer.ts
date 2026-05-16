import {EvaluationIds, EvaluationRequest} from "@/features/evaluation/types/evaluation.type.ts";
import {Category, Teacher} from "@/features/evaluation/types/evaDetail.ts";

export type SelectedMap = Record<number, Record<number, Record<number, number>>>;

export interface EvaluationState {
    loading: boolean;
    error: string | null;
    teachers: Teacher[];
    comment: string;
    ids: EvaluationIds | null;
    selected: SelectedMap;
    defaultReq: EvaluationRequest | null;
}

export const initialState: EvaluationState = {
    loading: true,
    error: null,
    teachers: [],
    comment: "",
    ids: null,
    selected: {},
    defaultReq: null,
};

export type EvaluationAction =
    | {type: "FETCH_START"}
    | {
          type: "FETCH_SUCCESS";
          payload: {
              teachers: Teacher[];
              selected: SelectedMap;
              ids: EvaluationIds;
              defaultReq: EvaluationRequest;
          };
      }
    | {type: "FETCH_ERROR"; payload: string}
    | {type: "SELECT_OPTION"; payload: {catIdx: number; itIdx: number; optIdx: number}}
    | {type: "SET_SELECTED"; payload: SelectedMap}
    | {type: "SET_COMMENT"; payload: string}
    | {type: "RESET"};

export function evaluationReducer(state: EvaluationState, action: EvaluationAction): EvaluationState {
    switch (action.type) {
        case "FETCH_START":
            return {
                ...initialState,
                loading: true,
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                error: null,
                teachers: action.payload.teachers,
                selected: action.payload.selected,
                ids: action.payload.ids,
                defaultReq: action.payload.defaultReq,
                comment: action.payload.teachers[0].comment,
            };
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case "SELECT_OPTION": {
            const {catIdx, itIdx, optIdx} = action.payload;
            const teacherIdx = 0; // Hardcoded as before
            const newSelected = {
                ...state.selected,
                [teacherIdx]: {
                    ...(state.selected[teacherIdx] || {}),
                    [catIdx]: {
                        ...(state.selected[teacherIdx]?.[catIdx] || {}),
                        [itIdx]: optIdx,
                    },
                },
            };
            return {
                ...state,
                selected: newSelected,
            };
        }
        case "SET_SELECTED":
            return {
                ...state,
                selected: action.payload,
            };
        case "SET_COMMENT":
            return {
                ...state,
                comment: action.payload,
            };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, Text, useTheme} from "@rneui/themed";
import {useCallback, useEffect, useLayoutEffect, useReducer, useRef} from "react";
import {Color} from "@/shared/color.ts";
import {parseEvaluationHTML} from "@/features/evaluation/utils/parser.ts";
import {EvaCategory} from "@/features/evaluation/components/EvaCategory.tsx";
import {evaluationApi} from "@/features/evaluation/api";
import {evaluationReducer, initialState} from "@/features/evaluation/store/EvaReducer.ts";
import {createDefaultReq, fillReq} from "@/features/evaluation/utils/reqBuilder.ts";
import {EvaTeacherList} from "@/features/evaluation/types/schema/TeacherList.ts";

export function EvaluationDetail({navigation, route}) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [state, dispatch] = useReducer(evaluationReducer, initialState);
    const {loading, error, teachers, comment, ids, selected, defaultReq} = state;
    const {theme} = useTheme();

    const {evaluationItem} = route.params as {evaluationItem: EvaTeacherList};

    const onSelect = useCallback((catIdx: number, itIdx: number, optIdx: number) => {
        dispatch({type: "SELECT_OPTION", payload: {catIdx, itIdx, optIdx}});
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${evaluationItem.teacherName}（${evaluationItem.courseName}）`,
        });
    }, [navigation, evaluationItem]);

    const defaultColor = Color.mix(
        theme.colors.primary,
        theme.colors.black,
        theme.mode === "dark" ? 0.2 : 0.1,
    ).setAlpha(theme.mode === "dark" ? 0.5 : 0.8).rgbaString;

    const styles = StyleSheet.create({
        header: {fontSize: 24, fontWeight: "bold", marginBottom: 4},
        card: {padding: 12, marginVertical: 8, borderRadius: 8},
        category: {marginBottom: 10},
        categoryName: {fontSize: 16, fontWeight: "500", color: defaultColor, marginBottom: 4},
        item: {marginBottom: 8},
        itemTitle: {fontSize: 14, marginBottom: 4, marginLeft: 10, marginRight: 10},
        commentInput: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: defaultColor,
            backgroundColor: theme.colors.background,
            borderRadius: 8,
            marginBottom: 9,
            marginHorizontal: "3%",
            height: "auto",
        },
        optionButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: defaultColor,
            borderRadius: 8,
            marginBottom: 9,
        },
        optionButtonChecked: {
            backgroundColor: defaultColor,
        },
        optionText: {fontSize: 15, color: theme.colors.black},
        optionTextChecked: {color: "#fff", fontWeight: "bold"},
        comment: {marginTop: 8, fontSize: 13, fontStyle: "italic", color: defaultColor},
        submitButton: {
            backgroundColor: defaultColor,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 10,
            marginHorizontal: 20,
        },
        submitButtonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
        },
    });

    const FastSubmit = () => {
        const goodSelected = {
            0: {
                0: {0: 0, 1: 0, 2: 0, 3: 0},
                1: {0: 0, 1: 0, 2: 0},
                2: {0: 0, 1: 0, 2: 1},
                3: {0: 0, 1: 0, 2: 0},
                4: {0: 0, 1: 0, 2: 0},
            },
        };
        dispatch({type: "SET_SELECTED", payload: goodSelected});
        const defaultComment =
            "老师专业功底深厚，治学态度严谨。在教学中，您逻辑清晰，重点突出，" +
            "善于运用启发式教学引导我们独立思考，将理论与实践紧密结合。课堂富有感染力，" +
            "不仅传授了我们前沿的知识，更点燃了我们对该领域的探索热情。是我们学术道路上当之无愧的引路人。" +
            "老师的悉心栽培令我们受益匪浅！";
        dispatch({type: "SET_COMMENT", payload: defaultComment});
        handleSave(goodSelected, defaultComment);
    };
    /** 点击提交按钮触发提交
     * @param submitSelected 提交的选项
     * @param submitComment 提交的评语
     *
     * @description 两个参数都是可选项，如不填则提交屏幕上的参数
     *
     * 一般在适用快速评价（如一键评价、一键清空等）时传入特定的参数
     * */
    const handleSave = async (submitSelected = selected, submitComment: string = comment) => {
        console.log("start-saving");

        const reqToSend = fillReq(defaultReq, submitSelected, submitComment, ids);

        if (reqToSend.modelList[0]) {
            reqToSend.modelList[0].py = submitComment;
        }

        const res = await evaluationApi.handleEvaResult(defaultReq, reqToSend);
        console.log(res);
        dispatch({type: "SET_SELECTED", payload: submitSelected});
        init();
    };

    // init，一点开页面就调用
    async function init() {
        dispatch({type: "FETCH_START"});
        try {
            const HtmlText = await evaluationApi.getEvaluationDetail(
                evaluationItem.securityToken,
                evaluationItem.teachingClassId,
                evaluationItem.courseId,
                evaluationItem.courseTypeCode,
                evaluationItem.rubricId,
            );
            const {idObj, teachers, selected} = parseEvaluationHTML(HtmlText);

            const defReq = createDefaultReq(evaluationItem, idObj);

            dispatch({
                type: "FETCH_SUCCESS",
                payload: {teachers, selected: selected || {}, ids: idObj, defaultReq: defReq},
            });
        } catch (e: any) {
            dispatch({type: "FETCH_ERROR", payload: e.message});
        }
    }

    useEffect(() => {
        init();
    }, []);

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text style={{color: theme.colors.error}}>评教页面加载失败: {error}</Text>
                <Button onPress={init}>重试</Button>
            </View>
        );
    }

    return (
        <ScrollView ref={scrollViewRef}>
            {1 && (
                <>
                    <TouchableOpacity onPress={FastSubmit} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>应用默认评价示例</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSave()} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>保存</Text>
                    </TouchableOpacity>
                </>
            )}
            <View style={styles.card}>
                <Text style={styles.header}>
                    {evaluationItem.courseName}——{evaluationItem.teacherName}：{evaluationItem.submitStatus}
                </Text>
                {teachers![0].categories.map((cat: any, catIdx: number) => (
                    <EvaCategory key={cat.name + cat.qzz} cat={cat} catIdx={catIdx} onSelect={onSelect} />
                ))}
            </View>
            <View>
                <Text style={[styles.categoryName, {paddingLeft: "3%"}]}>评语</Text>
                <TouchableOpacity
                    style={styles.commentInput}
                    onPress={() => {
                        navigation.navigate("EvaluationComment", {
                            initialComment: comment,
                            onSave: (newComment: string) => {
                                dispatch({type: "SET_COMMENT", payload: newComment});
                                setTimeout(() => scrollViewRef.current?.scrollToEnd({animated: true}), 100);
                            },
                        });
                    }}>
                    <Text style={{color: "#999"}}>{comment || "请输入评语"}</Text>
                </TouchableOpacity>
            </View>
            {1 && (
                <TouchableOpacity onPress={() => handleSave()} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>保存</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

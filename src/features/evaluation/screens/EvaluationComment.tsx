import {Text, useTheme} from "@rneui/themed";
import {Button, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import {useState, useLayoutEffect, useCallback} from "react";
import Flex from "@/components/un-ui/Flex.tsx";

// 定义路由参数的类型
type CommentRouteParams = {
    initialComment?: string;
    onSave: (comment: string) => void;
};

// 为 useRoute 指定类型
type CommentScreenRouteProp = RouteProp<{params: CommentRouteParams}, "params">;

export function EvaluationComment() {
    const {theme} = useTheme();
    const navigation = useNavigation();
    const route = useRoute<CommentScreenRouteProp>();

    // 从路由参数中获取初始评语和保存函数
    const {initialComment, onSave} = route.params;

    // 使用本地 state 来控制 TextInput
    const [text, setText] = useState(initialComment || "");

    const handleSave = useCallback(() => {
        // 调用从 EvaluationDetail 传来的 onSave 函数
        onSave(text);
        // 返回上一页
        navigation.goBack();
    }, [navigation, onSave, text]);

    // 在导航栏添加保存按钮
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.background,
                        borderWidth:1,
                        borderColor: theme.colors.primary,
                        padding: 8,
                }}
                    onPress={handleSave} >
                    <Text>保存</Text>
                </TouchableOpacity>,
        });
    }, [navigation, handleSave, theme.colors.background, theme.colors.primary]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        textInput: {
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            margin: "3%",
            backgroundColor: theme.colors.background,
            textAlignVertical: "top", // 让光标从左上角开始
            fontSize: 13,
            height: "50%",
            color: theme.colors.black,
        },
    });

    return (
            <View style={styles.container}>
                <TextInput
                    style={styles.textInput}
                    value={text}
                    onChangeText={setText}
                    placeholder="请输入评语..."
                    multiline={true}
                    autoFocus={false} // 不自动弹出键盘
                />
                <Text
                    style={{
                        textAlign: "right",
                        marginRight: "3%",
                        fontSize: 16,
                        fontWeight: "bold",
                        color: theme.colors.primary,
                    }}>
                    字数：{text.length}/500
                </Text>
                <Flex column gap={20}>
                    <TouchableOpacity>
                        <Text>通用真诚模板</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>侧重学术启发</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>侧重个人情感</Text>
                    </TouchableOpacity>
                </Flex>
            </View>
    );
}

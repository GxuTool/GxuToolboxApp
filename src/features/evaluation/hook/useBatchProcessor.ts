import {useRef, useState} from "react";
import {ToastAndroid} from "react-native";

type ProcessTask<T> = (item: T, index: number, total: number) => Promise<void>;

export function useBatchProcessor<T>() {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const isCancelled = useRef(false);

    const run = async (items: T[], task: ProcessTask<T>) => {
        if (items.length === 0) {
            ToastAndroid.show("没有需要处理的项目。", ToastAndroid.SHORT);
            return;
        }

        setIsRunning(true);
        isCancelled.current = false;
        setProgress(0);
        setProgressText("准备开始...");

        try {
            for (let i = 0; i < items.length; i++) {
                if (isCancelled.current) {
                    ToastAndroid.show("操作已取消", ToastAndroid.SHORT);
                    break;
                }
                // 调用外部传入的具体任务逻辑
                await task(items[i], i, items.length);
            }
        } catch (error) {
            console.error("批量处理时发生错误:", error);
            ToastAndroid.show(`发生错误: ${error.message}`, ToastAndroid.LONG);
        } finally {
            setIsRunning(false);
        }
    };

    const cancel = () => {
        isCancelled.current = true;
    };

    return {isRunning, progress, progressText, setProgress, setProgressText, run, cancel};
}

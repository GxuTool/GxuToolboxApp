import React, {useCallback, useMemo, useSyncExternalStore} from "react";
import {UnCard, UnCardProps} from "@/components/un-ui/UnCard.tsx";
import {StyleSheet, View} from "react-native";
import {UnText} from "@/components/un-ui/UnText.tsx";
import {LinearProgress, useTheme} from "@rneui/themed";

// ==================== 类型定义 ====================

export interface ToastData {
    id: string;
    content: React.ReactNode;
    title?: string;
    color: UnCardProps["color"];
    progress?: number;
}

// ==================== 全局状态管理（支持查询） ====================

class ToastStateManager {
    private toasts: Map<string, ToastData> = new Map();
    private listeners: Set<() => void> = new Set();
    // 缓存数组引用，避免无限渲染
    private cachedArray: ToastData[] = [];

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    private notify = () => {
        // 更新缓存数组
        this.cachedArray = Array.from(this.toasts.values());
        this.listeners.forEach(l => l());
    };

    addToast = (data: Omit<ToastData, "id">): string => {
        const id = Math.random().toString(36).substring(2, 9);
        this.toasts.set(id, {...data, id});
        this.notify();
        return id;
    };

    updateToast = (id: string, data: Partial<Omit<ToastData, "id">>) => {
        const toast = this.toasts.get(id);
        if (toast) {
            this.toasts.set(id, {...toast, ...data});
            this.notify();
        }
    };

    removeToast = (id: string) => {
        if (this.toasts.delete(id)) {
            this.notify();
        }
    };

    getToast = (id: string): ToastData | undefined => {
        return this.toasts.get(id);
    };

    // 返回缓存的数组，保持引用稳定
    getAllToasts = (): ToastData[] => {
        return this.cachedArray;
    };
}

const toastManager = new ToastStateManager();

// ==================== Toast 组件（响应式） ====================

const ToastItem: React.FC<ToastData> = ({content, title, color, progress, ...props}) => {
    const {theme} = useTheme();
    const mainColor = ["primary", "success", "secondary", "warning", "error", undefined].includes(color)
        ? theme.colors[color ?? "primary"]
        : color;
    return (
        <UnCard disableOpacityBg color={color} title={title} titleStyle={{fontSize: 10}} {...props}>
            <View style={{gap: 4}}>
                {typeof content === "string" || typeof content === "number" ? <UnText>{content}</UnText> : content}
                {progress !== undefined && (
                    <LinearProgress value={progress} color={mainColor} animation={{duration: 250}} />
                )}
            </View>
        </UnCard>
    );
};

// ==================== Provider ====================

export const UnToastContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    // 使用 useSyncExternalStore 订阅外部状态
    const toasts = useSyncExternalStore(
        toastManager.subscribe,
        toastManager.getAllToasts,
        toastManager.getAllToasts, // SSR 快照
    );

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    position: "absolute",
                    left: "50%",
                    transform: [{translateX: "-50%"}],
                    bottom: "20%",
                    zIndex: 9999,
                    width: "80%",
                    gap: 10,
                },
            }),
        [],
    );

    return (
        <>
            {children}
            <View style={styles.container}>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} {...toast} />
                ))}
            </View>
        </>
    );
};

// ==================== Hook API（支持查询） ====================

export interface UnToastRef {
    id: string;
    getProgress: () => number | undefined;
    setProgress: (v: number | undefined) => void;
    getContent: () => React.ReactNode;
    setContent: (v: React.ReactNode) => void;
    setColor: (v: ToastData["color"]) => void;
    setData: (v: Partial<Omit<ToastData, "id">>) => void;
    close: (delay?: number, cb?: () => void) => void;
}

export const useUnToast = () => {
    const createToast = useCallback(
        (content?: React.ReactNode, title?: string, color: UnCardProps["color"] = "primary"): UnToastRef => {
            const id = toastManager.addToast({
                content: typeof content === "string" ? <UnText>{content}</UnText> : content,
                title,
                color,
            });

            return {
                id,
                getProgress: () => toastManager.getToast(id)?.progress,
                setProgress: v => toastManager.updateToast(id, {progress: v}),
                getContent: () => toastManager.getToast(id)?.content,
                setContent: v => toastManager.updateToast(id, {content: v}),
                setColor: v => toastManager.updateToast(id, {color: v}),
                setData: v => toastManager.updateToast(id, v),
                close: (delay = 4000, cb) =>
                    setTimeout(() => {
                        toastManager.removeToast(id);
                        cb?.();
                    }, delay),
            };
        },
        [],
    );

    return {createToast};
};

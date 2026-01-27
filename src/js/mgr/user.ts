import {store} from "@/core/store.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";

export const userMgr = {
    // 教务系统相关
    jw: {
        storeAccount: (username: string, password: string) => {
            return store.save({
                key: "userAccount",
                data: {
                    username,
                    password,
                },
            });
        },
        getAccount: async () => {
            try {
                return await store.load<{username: string; password: string}>({
                    key: "userAccount",
                });
            } catch (e) {
                console.warn(e);
                return null;
            }
        },
    },
    // 认证系统相关
    auth: {
        storeAccount: (username: string, password: string) => {
            return store.save({
                key: "userAuthAccount",
                data: {
                    username,
                    password,
                },
            });
        },
        getAccount: async () => {
            try {
                return await store.load<{username: string; password: string}>({
                    key: "userAuthAccount",
                });
            } catch (e) {
                console.warn(e);
                return null;
            }
        },
    },
    // 考勤系统相关
    attendanceSystem: {
        storeAccount: (username: string, password: string) => {
            return store.save({
                key: "attendanceSystemAccount",
                data: {
                    username,
                    password,
                },
            });
        },
        getAccount: async () => {
            try {
                return await store.load<{username: string; password: string}>({
                    key: "attendanceSystemAccount",
                });
            } catch (e) {
                console.warn(e);
                return null;
            }
        },
        storeLoginRes: (res: AST.ResRoot<AST.LoginData>) => {
            return store.save({
                key: "attendanceSystemLoginRes",
                data: res,
            });
        },
        getLoginRes: async () => {
            try {
                return await store.load<AST.ResRoot<AST.LoginData>>({
                    key: "attendanceSystemLoginRes",
                });
            } catch (e) {
                console.warn(e);
                return null;
            }
        },
    },
};

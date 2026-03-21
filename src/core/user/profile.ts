import {store} from "@/core/store.ts";
import {JwAuthClient} from "@/core/auth/Jw/JwAuthClient.ts";

export const userProfile = {
    saveUserInfo() {
        const info = JwAuthClient.getUserInfo();
        store.save({
            key: "userInfo",
            data: info,
        });
    },
    loadUserInfo() {
        return (
            store.load({
                key: "userInfo",
            }) || null
        );
    },
};

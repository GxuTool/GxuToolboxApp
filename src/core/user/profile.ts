import {store} from "@/core/store.ts";
import {JwClient} from "@/core/auth/JwClient.ts";

export const userProfile = {
    saveUserInfo() {
        const info = JwClient.getUserInfo();
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

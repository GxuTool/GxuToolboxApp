import {userProfileRepo} from "@/core/repo/userProfileRepo.ts";
import {getProfile} from "@/features/backend/api/profile.ts";

// 30天
const PROFILE_TTL = 30 * 24 * 60 * 60 * 1000;

export async function syncIfStale(account: string) {
    const local = await userProfileRepo.get(account);

    if (local && Date.now() - local.updated_at * 1000 < PROFILE_TTL) {
        return local;
    }

    return forceSync();
}

async function forceSync() {
    const profile = await getProfile();
    await userProfileRepo.upsert({
        ...profile,
        updated_at: Date.now(),
    });

    return profile;
}

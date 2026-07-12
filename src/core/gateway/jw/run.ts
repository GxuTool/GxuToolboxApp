import {getJwMode} from "./mode";

export async function runJw<T>(remote: () => Promise<T>, local: () => Promise<T>): Promise<T> {
    const mode = getJwMode();

    if (mode === "local_only") return local();
    if (mode === "remote_only") return remote();

    try {
        return await remote();
    } catch (e) {
        if (!canFallback(e)) throw e;
        return local();
    }
}

function canFallback(e: any) {
    const status = e?.response?.status;

    return !e?.response || status === 502 || status === 503 || status === 504;
}

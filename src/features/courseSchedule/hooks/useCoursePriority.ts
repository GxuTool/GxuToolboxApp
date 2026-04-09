import {useCallback, useEffect, useState} from "react";
import {store} from "@/core/store.ts";

const STORE_KEY = "coursePriority";

export function useCoursePriority() {
    const [priorities, setPriorities] = useState<Record<string, number>>({});

    useEffect(() => {
        store
            .load({key: STORE_KEY})
            .then(data => {
                if (data) setPriorities(data);
            })
            .catch(() => {});
    }, []);

    const setPriority = useCallback((id: string, priority: number) => {
        setPriorities(prev => {
            const next = {...prev, [id]: priority};
            store.save({key: STORE_KEY, data: next});
            return next;
        });
    }, []);

    const getPriority = useCallback((id: string) => priorities[id] ?? 0, [priorities]);

    return {getPriority, setPriority};
}

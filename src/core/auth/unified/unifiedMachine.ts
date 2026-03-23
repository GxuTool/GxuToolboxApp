import {createAuthCore} from "@/core/auth/createAuthCore.ts";
import {unifiedAdapter} from "@/core/auth/unified/unifiedAdapter.ts";
import {Account} from "@/core/auth/auth.type.ts";

export const unifiedMachine = createAuthCore<Account>(unifiedAdapter);

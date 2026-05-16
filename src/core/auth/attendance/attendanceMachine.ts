import {createAuthCore} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {attendanceAdapter} from "@/core/auth/attendance/attendanceAdapter.ts";

export const attendanceMachine = createAuthCore<Account>(attendanceAdapter);

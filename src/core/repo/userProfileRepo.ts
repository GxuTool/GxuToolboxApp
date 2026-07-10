import {getDB} from "@/core/db.ts";

export interface UserProfile {
    /** 学号 */
    student_id: string;
    /** 姓名 */
    name: string;
    id_card: string;
    grade: string;
    college: string;
    major: string;
    class_name: string;
    study_years: number;
    updated_at: number;
}

export const userProfileRepo = {
    async upsert(profile: UserProfile): Promise<void> {
        const db = getDB();
        await db.execute(
            `
                INSERT INTO user_profiles (student_id, name, id_card, grade, college, major, class_name, study_years)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id) DO UPDATE
                    SET name        = excluded.name,
                        id_card     = excluded.id_card,
                        grade       = excluded.grade,
                        college     = excluded.college,
                        major       = excluded.major,
                        class_name  = excluded.class_name,
                        study_years = excluded.study_years,
                        updated_at  = strftime('%s', 'now')
            `,
            [
                profile.student_id,
                profile.name,
                profile.id_card,
                profile.grade,
                profile.college,
                profile.major,
                profile.class_name,
                profile.study_years,
            ],
        );
    },
    async get(student_id: string): Promise<UserProfile | null> {
        const db = getDB();

        const result = await db.execute("SELECT * FROM user_profiles WHERE student_id = ? LIMIT 1", [student_id]);

        return (result.rows[0] as unknown as UserProfile | undefined) ?? null;
    },
};

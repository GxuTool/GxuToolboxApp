import {open} from "@op-engineering/op-sqlite";

export function getDB() {
    let db: ReturnType<typeof open> | null;
    db = open({name: "gxu_tool.db"});
    return db;
}

export async function initDB() {
    const db = getDB();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS evaluation_templates (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL UNIQUE,
            data        TEXT NOT NULL,
            created_at  INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at  INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            student_id  TEXT                                    NOT NULL PRIMARY KEY,
            name        TEXT,
            id_card     TEXT,
            grade       TEXT,
            college     TEXT,
            major       TEXT,
            class_name  TEXT,
            study_years INTEGER,
            updated_at  INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
        );
    `);
}

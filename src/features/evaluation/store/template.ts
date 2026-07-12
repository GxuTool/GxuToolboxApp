import {getDB} from "@/core/db";

export interface TemplateData {
    selected: Record<number, Record<number, Record<number, number>>>;
    comment: string;
}

export interface TemplateRow {
    id: number;
    name: string;
    data: TemplateData;
    created_at: number;
    updated_at: number;
}

// 列出所有模板（只取 id + name，不加载 data）
export function listTemplates(): {id: number; name: string}[] {
    const db = getDB();
    const result = db.execute("SELECT id, name FROM evaluation_templates ORDER BY updated_at DESC");
    return result.rows?._array ?? [];
}

// 按 id 获取完整模板
export function getTemplate(id: number): TemplateRow | null {
    const db = getDB();
    const result = db.execute("SELECT * FROM evaluation_templates WHERE id = ?", [id]);
    const row = result.rows?._array?.[0];
    if (!row) return null;
    return {...row, data: JSON.parse(row.data)};
}

// 按名称获取（用于检查重名）
export function getTemplateByName(name: string): TemplateRow | null {
    const db = getDB();
    const result = db.execute("SELECT * FROM evaluation_templates WHERE name = ?", [name]);
    const row = result.rows?._array?.[0];
    if (!row) return null;
    return {...row, data: JSON.parse(row.data)};
}

// 新建模板
export function createTemplate(name: string, data: TemplateData): number {
    const db = getDB();
    const json = JSON.stringify(data);
    const result = db.execute("INSERT INTO evaluation_templates (name, data) VALUES (?, ?)", [name, json]);
    return result.insertId!;
}

// 更新模板（按 id）
export function updateTemplate(id: number, name: string, data: TemplateData): void {
    const db = getDB();
    const json = JSON.stringify(data);
    db.execute("UPDATE evaluation_templates SET name = ?, data = ?, updated_at = strftime('%s', 'now') WHERE id = ?", [
        name,
        json,
        id,
    ]);
}

// 删除模板
export function deleteTemplate(id: number): void {
    const db = getDB();
    db.execute("DELETE FROM evaluation_templates WHERE id = ?", [id]);
}

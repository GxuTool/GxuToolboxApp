import {z} from "zod";

/** 基础类，原始数据存储在 `_ori` 属性中 */
export class BaseClass<T> {
    /** 原始数据 */
    readonly _ori: T;

    constructor(ori: T) {
        this._ori = ori;
    }
}

/**
 * Zod 解析后的基础类。
 *
 * 通过 declaration merging 将 Zod schema 的解析类型属性合并到 class 类型上，
 * 子类 extends 时可获得完整的属性提示。
 *
 * @typeParam S — Zod schema 类型
 * @typeParam O — 原始数据类型，存储在 `_ori` 属性中
 *
 * @example
 * ```ts
 * const CourseZod = z.object({ kcmc: z.string(), kch: z.string() });
 *
 * class CourseClass extends BaseZodClass<typeof CourseZod, RawCourse> {}
 * const c = new CourseClass(zodData, rawData);
 * c.kcmc; // ✅ 有类型提示，来自 z.infer<typeof CourseZod>
 * c._ori;  // ✅ RawCourse，来自 O
 * ```
 */
// @ts-expect-error TS2430 — 泛型 S 的解析属性通过构造器中 Object.assign 动态赋值，
// TypeScript 在泛型层面无法静态验证，但在具体子类实例化时类型合并是正确的。
export interface BaseZodClass<S extends z.ZodType<any>, O> extends z.infer<S> {}
export class BaseZodClass<S extends z.ZodType<any>, O> extends BaseClass<O> {
    constructor(zodData: z.infer<S>, ori: O) {
        super(ori);
        Object.assign(this, zodData);
    }
}

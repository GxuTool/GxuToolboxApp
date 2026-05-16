/** 基础类，原始数据存储在 `_ori` 属性中 */
export class BaseClass<T>{
    /** 原始数据 */
    readonly _ori: T;

    constructor(ori: T) {
        this._ori = ori;
    }
}

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

export enum DirtyLevels {
    // 脏值, 意味着取值要运行计算属性
    Dirty = 4,
    // 不脏就用上一次的返回结果
    NoDirty = 0
}
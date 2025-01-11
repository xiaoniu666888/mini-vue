export enum ReactiveFlags {
    // 表示一个对象是响应式的
    IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        // 依赖收集 => 取值的时候, 应该让 响应式属性 和 effect 映射起来

        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        // 触发更新 => 找到属性, 让对应的 effect 重新执行 
        return Reflect.set(target, key, value, receiver)
    }
}
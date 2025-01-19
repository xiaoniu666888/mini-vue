import { isObject } from "@vue/shared"
import { ReactiveFlags } from "./constants"
import { track, trigger } from "./reactiveEffect"
import { reactive } from "./reactive"




export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        // 依赖收集 => 取值的时候, 应该让 响应式属性 和 effect 映射起来
        // 收集这个对象上的这个属性, 和effect关联在一起
        // 取值的时候, 递归取值, 取值的时候, 会进行取值操作, 取值操作会触发getter
        track(target, key)
        let res = Reflect.get(target, key, receiver)
        // 如果是对象, 则递归代理
        if (isObject(res)) {
            return reactive(res)
        }
        return res
    },
    set(target, key, value, receiver) {
        // 触发更新 => 找到属性, 让对应的 effect 重新执行 

        let oldValue = target[key]
        let result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
            trigger(target, key, value, oldValue)
        }
        return result
    }
}
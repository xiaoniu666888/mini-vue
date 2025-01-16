import { isObject } from "@vue/shared"
import { mutableHandlers } from "./baseHandler"
import { ReactiveFlags } from "./constants"

// 用来存储代理过的对象
const reactiveMap = new WeakMap()
function createReactiveObject(target) {
    // 如果目标不是对象，就没法进行代理了
    if (!isObject(target)) {
        return target
    }
    // 如果已经代理过了，就不要再次代理了（可能是父级代理了子级）
    const existingProxy = reactiveMap.get(target)
    if (existingProxy) {
        return existingProxy
    }
    // 防止重复代理, 这里指的是代理了一个已经reactive的对象又被reactive了
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }
    let proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)
    return proxy
}
export function reactive(target) {
    return createReactiveObject(target)
}
export function toReactive(value) {
    return isObject(value) ? reactive(value) : value
}
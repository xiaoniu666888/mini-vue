import { activeEffect, trackEffect, triggerEffects } from "./effect";

// 存放依赖收集的关系
const targetMap = new WeakMap()

export const createDep = (cleanup, key) => {
    const dep = new Map() as any
    dep.cleanup = cleanup
    dep.name = key
    return dep
}
export function track(target, key) {
    // activeEffect 有这个属性, 说明这个key是在effect中访问的, 没有在effect中访问, 就不需要收集
    if (activeEffect) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
            // 说明这个target第一次被收集
            depsMap = new Map()
            targetMap.set(target, depsMap)
        }
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)))
        }
        trackEffect(activeEffect, dep)
    }

}

export function trigger(target, key, value, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        return
    }
    const dep = depsMap.get(key)
    if (dep) {
        triggerEffects(dep)
    }
}



// Map: { obj: { 属性: Map: { effect, effect ,effect } }}
// {
//     {name: '张三', age: 18}: {
//         name: {
//             effect, effect
//         },
//         age: {
//             effect, effect
//         }
//     }
// }
import { activeEffect } from "./effect";

// 存放依赖收集的关系
const targetMap = new Map()
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
            depsMap.set(key, new Map())
        }

    }
    console.log(targetMap)

}
import { isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';

export function watch(source, cb, options = {} as any) {
    return doWatch(source, cb, options)
}

function traverse(source, depth, currentDepth = 0, seen = new Set()) {

    if (!isObject(source)) {
        return source
    }
    if (depth) {
        if (currentDepth >= depth) {
            return source
        }
        currentDepth++
    }
    if (seen.has(source)) {
        return source
    }
    seen.add(source)
    for (const key in source) {
        traverse(source[key], depth, currentDepth, seen)
    }
    // 遍历就会触发每个属性的setter
    return source
}

function doWatch(source, cb, { deep }) {
    // source => 变成getter

    const reactiveGetter = (source) => traverse(source, deep === false ? 1 : undefined)
    // 产生一个可以给ReactiveEffect来使用的getter, 需要对这个对象进行取值操作, 会关联当前的ReactiveEffect
    let getter = () => reactiveGetter(source)
    let oldValue
    const job = () => {
        const newValue = effect.run()
        cb(newValue, oldValue)
        oldValue = newValue
    }
    const effect = new ReactiveEffect(getter, job)
    oldValue = effect.run()
}

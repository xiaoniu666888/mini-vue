import { isObject, isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';
import { isRef } from './ref';

export function watch(source, cb, options = {} as any) {
    return doWatch(source, cb, options)
}

export function watchEffect(getter, options = {} as any) {
    return doWatch(getter, null, options)

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

function doWatch(source, cb, { deep, immediate }) {
    // source => 变成getter

    const reactiveGetter = (source) => traverse(source, deep === false ? 1 : undefined)
    let getter
    if (isReactive(source)) {
        getter = () => reactiveGetter(source)
    } else if (isRef(source)) {
        getter = () => source.value
    } else if (isFunction(source)) {
        getter = source
    }
    // 产生一个可以给ReactiveEffect来使用的getter, 需要对这个对象进行取值操作, 会关联当前的ReactiveEffect
    let oldValue
    let clean
    const onCleanup = (fn) => {
        clean = () => {
            fn()
            clean = undefined
        }
    }
    const job = () => {
        if (cb) {
            const newValue = effect.run()
            if (clean) {
                // 在执行回调, 先调用上一次的清理操作进行清理
                clean()
            }
            cb(newValue, oldValue, onCleanup)
            oldValue = newValue
        } else {
            // watchEffect
            effect.run()
        }
    }
    const effect = new ReactiveEffect(getter, job)
    if (cb) {
        if (immediate) {
            job()
        } else {
            oldValue = effect.run()
        }
    } else {
        // watchEffect
        effect.run()
    }

    const unwatch = () => {
        effect.stop()
    }
    return unwatch
}


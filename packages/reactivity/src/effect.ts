import { DirtyLevels } from "./constants"

export function effect(fn, options?) {
    // 创建一个响应式effect 数据变化后可以重新执行

    // 创建一个effect, 只要依赖的属性变化了就要执行回调
    const _effect = new ReactiveEffect(fn, () => {
        // scheduler
        _effect.run()
    })
    _effect.run()

    if (options) {
        // 用户传递的覆盖掉内置的
        Object.assign(_effect, options)
    }
    const runner = _effect.run.bind(_effect)
    // 可以在run方法上获取到effect的引用
    runner.effect = _effect
    // 外界可以自己让其重新run
    return runner
}
function preCleanEffect(effect) {
    effect._depsLength = 0
    // 每次执行 id 都 +1 如果当前同一个effect执行 id就是相同的
    effect._trackId++
}
function postCleanEffect(effect) {
    if (effect.deps.length > effect._depsLength) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            // 删除映射表中对应的effect
            cleanDepEffect(effect.deps[i], effect)
        }
        // 更新依赖列表的长度
        effect.deps.length = effect._depsLength
    }
}
export let activeEffect;
export class ReactiveEffect {
    // 用于记录当前effect执行了几次
    _trackId = 0
    _depsLength = 0
    _running = 0;
    _dirtyLevel = DirtyLevels.Dirty
    public active = true
    deps = []

    // fn 用户编写的函数
    // 如果fn中依赖的数据发生变化后, 需要重新调用 => run() 
    constructor(public fn, public scheduler) { }

    public get dirty() {
        return this._dirtyLevel === DirtyLevels.Dirty
    }
    public set dirty(value) {
        this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty
    }
    run() {
        // 每次运行过后effect变为no_dirty
        this._dirtyLevel = DirtyLevels.NoDirty
        // 让fn执行
        if (!this.active) {
            // 如果不是激活状态, 执行后, 什么都不用做
            return this.fn()
        }
        let lastEffect = activeEffect
        try {
            activeEffect = this
            // effect 重新执行前, 要将上一次的effect清除掉 effect.deps
            preCleanEffect(this)
            this._running++;
            // 依赖收集
            return this.fn()
        } finally {
            this._running--;
            postCleanEffect(this)
            // 执行完后, 重置
            activeEffect = lastEffect
        }
    }
    stop() {
        if (this.active) {
            this.active = false
            preCleanEffect(this)
            postCleanEffect(this)
        }
    }
}
function cleanDepEffect(dep, effect) {
    dep.delete(effect)
    if (dep.size === 0) {
        // map为空, 删除这个属性
        dep.cleanup()
    }
}
// 存储依赖, 双向收集
// 1. _trackId 用于记录当前effect执行了几次, 防止一个属性在当前effect中执行多次, 导致重复收集
// 2. 拿到上一次的依赖和当前的依赖进行比较, 如果不同, 则进行收集, 如果相同, 则不需要收集
export function trackEffect(activeEffect, dep) {
    // 双向收集 让effect和dep关联起来
    if (dep.get(activeEffect) !== activeEffect._trackId) {
        // 更新id
        dep.set(activeEffect, activeEffect._trackId++)
        let oldDep = activeEffect.deps[activeEffect._depsLength]
        if (oldDep !== dep) {
            if (oldDep) {
                // 清除老的
                cleanDepEffect(oldDep, activeEffect)
            }
            // 换成新的
            // 永远按照本次最新的来存放
            activeEffect.deps[activeEffect._depsLength++] = dep
        } else {
            activeEffect._depsLength++
        }
    }
}
// 触发更新
export function triggerEffects(dep) {
    for (const effect of dep.keys()) {
        // 当前这个值是不脏的, 但是触发更新需要将值变为脏值
        // 属性依赖了计算属性, 需要让计算属性的dirty变为true
        if (effect._dirtyLevel < DirtyLevels.Dirty) {
            effect._dirtyLevel = DirtyLevels.Dirty
        }
        if (!effect._running) {
            if (effect.scheduler) {
                // 如果不是正在执行, 才能执行
                effect.scheduler() // => effect.run()
            }
        }
    }
}
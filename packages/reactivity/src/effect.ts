export function effect(fn, options?) {
    // 创建一个响应式effect 数据变化后可以重新执行

    // 创建一个effect, 只要依赖的属性变化了就要执行回调
    const _effect = new ReactiveEffect(fn, () => {
        // scheduler
        _effect.run()
    })
    _effect.run()
    return _effect
}
export let activeEffect;
class ReactiveEffect {
    public active = true
    // fn 用户编写的函数
    // 如果fn中依赖的数据发生变化后, 需要重新调用 => run() 
    constructor(public fn, public scheduler) { }
    run() {
        // 让fn执行
        if (!this.active) {
            // 如果不是激活状态, 执行后, 什么都不用做
            return this.fn()
        }
        let lastEffect = activeEffect
        try {
            activeEffect = this
            // 依赖收集
            return this.fn()
        }
        finally {
            activeEffect = lastEffect
        }
    }



}
import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";


class ComputedRefImpl {
    public _value
    public effect
    constructor(getter, public setter) {
        // 我们需要创建一个effect 来关联管理当前计算属性的dirty属性
        this.effect = new ReactiveEffect(() => getter(this._value), () => {
            // 计算属性依赖的值变化了, 我们应该触发effect重新执行
            triggerRefValue(this)
        })
    }
    get value() {
        if (this.effect.dirty) {
            // 默认值一定是脏的, 但是执行一次run后就不脏了
            this._value = this.effect.run()
            trackRefValue(this)
            // 如果当前在effect中访问了计算属性, 计算属性是可以收集这个effect的
        }
        return this._value
    }
    set value(newValue) {
        this.setter(newValue)
    }
}

export function computed(getterOptions) {
    let onlyGetter = isFunction(getterOptions);
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOptions;
        setter = () => { }
    } else {
        getter = getterOptions.get;
        setter = getterOptions.set;
    }
    return new ComputedRefImpl(getter, setter)
}
import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { createDep } from "./reactiveEffect";
import { toReactive } from "./reactivity";

export function ref(value) {
    return createRef(value)
}

export function createRef(value) {
    return new RefImpl(value)

}

class RefImpl {
    // 增加ref标识
    public _v_isRef = true
    // 用来保存ref的值的
    public _value;
    // 收集对应的effect
    public dep;
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            // 更新值
            this.rawValue = newValue
            this._value = newValue
            // 触发更新
            triggerRefValue(this)
        }
    }
}

function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect(activeEffect, ref.dep = createDep(() => ref.dep = undefined, "undefined"))
    }
}
function triggerRefValue(ref) {
    let dep = ref.dep
    if (dep) {
        // 触发依赖更新
        triggerEffects(dep)
    }
}
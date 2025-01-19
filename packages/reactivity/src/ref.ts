import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { createDep } from "./reactiveEffect";
import { toReactive } from "./reactive";

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

export function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect(activeEffect, (ref.dep = ref.dep || createDep(() => (ref.dep = undefined), "undefined")))
    }
}
export function triggerRefValue(ref) {
    let dep = ref.dep
    if (dep) {
        // 触发依赖更新
        triggerEffects(dep)
    }
}

class ObjectRefImpl {
    public _v_isRef = true
    constructor(public object, public key) { }
    get value() {
        return this.object[this.key]
    }
    set value(newValue) {
        this.object[this.key] = newValue
    }
}

export function toRef(object, key) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
    const res = {}
    for (const key in object) {
        res[key] = toRef(object, key)
    }
    return res
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver)
            // 自动脱ref
            return r._v_isRef ? r.value : r
        },
        set(target, key, value, receiver) {
            let oldValue = target[key]
            if (oldValue._v_isRef) {
                // 如果老值是ref, 需要给ref赋值
                oldValue.value = value
                return true
            } else {
                return Reflect.set(target, key, value, receiver)
            }
        }
    })
}

export function isRef(value) {
    return value && value._v_isRef
}
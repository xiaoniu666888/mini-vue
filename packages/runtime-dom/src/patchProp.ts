// 主要是对节点元素的操作 class style event 普通属性

import patchAttr from "./modules/patchAttr"
import patchClass from "./modules/patchClass"
import patchEvent from "./modules/patchEvent"
import patchStyle from "./modules/patchStyle"

// diff
export default function patchProp(el, key, preValue, nextValue) {
    if (key === 'class') {
        return patchClass(el, nextValue)
    } else if (key === 'style') {
        return patchStyle(el, preValue, nextValue)
    } else if (/^on[^a-z]/.test(key)) {
        // 事件 onClick
        // el.addEventListener(key, preValue) // () => preValue()
        // el.addEventListener(key, nextValue) // () => nextValue()
        return patchEvent(el, key, nextValue)
    } else {
        return patchAttr(el, key, nextValue)
    }
}
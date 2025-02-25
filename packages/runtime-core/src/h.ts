import { isObject } from "@vue/shared";
import { createVNode, isVnode } from "./createVnode";

export function h(type, propsOrChildren?, children?) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 属性
      if (isVnode(propsOrChildren)) {
        // h('div', h('p'))
        return createVNode(type, null, [propsOrChildren]);
      } else {
        // h('div', {})
        return createVNode(type, propsOrChildren);
      }
    }
    // 儿子 => 数组, h('div', []) 或 文本h('div', 'hello')
    return createVNode(type, null, propsOrChildren);
  } else {
    if (l > 3) {
      // h('div', {}, p1, p2)
      children = Array.prototype.slice.call(arguments, 2);
      //   children = Array.from(arguments).slice(2);
    }
    // 儿子是数组, h('div', {}, [p1, p2])
    if (l === 3 && isVnode(children)) {
      children = [children];
    }
    // === 3 || === 1
    return createVNode(type, propsOrChildren, children);
  }
}

import { isString, ShapeFlags } from "@vue/shared";

export function isVnode(value) {
  return value?.__v_isVNode;
}
export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
export function createVNode(type, props?, children?) {
  // h函数的重载
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    key: props?.key, // diff算法后边需要的key
    el: null, // 虚拟节点对应的真实节点
    shapeFlag,
  };
  if (children) {
    // 处理children
    if (Array.isArray(children)) {
      // h('div', [h('p'), h('p')])
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }
  return vnode;
}

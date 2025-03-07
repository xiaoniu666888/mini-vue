import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./createVnode";

export function createRenderer(renderOptions) {
  // core中不关心如何渲染
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    patchProp: hostPatchProp,
    nextSibling: hostNextSibling,
  } = renderOptions;

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      // children[i] 可能是纯文本, 随后考虑
      patch(null, children[i], container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    // 第一渲染的时候我们让虚拟节点和真实的dom创建关联, vnode.el = 真实dom
    // 第二次渲染新的vnode, 可以和上一次的vnode做对比, 之后更新对应的el元素, 可以后续再复用这个dom元素
    let el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 9 & 8 > 0 说明是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组
      mountChildren(children, el);
    }

    hostInsert(el, container);
  };
  // 初始化
  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container);
    } else {
      // 比对
      patchElement(n1, n2);
    }
  };
  // 比较属性
  const patchProps = (oldProps, newProps, el) => {
    // 新的全部要生效

    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    // 老的有的新的没有的要删掉
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }
  // 比较子节点
  const patchChildren = (n1, n2, el) => {
    // 新的是文本, 老的是数组
    const { shapeFlag: prevShapeFlag, shapeFlag } = n2;
  }
  // 比较元素
  const patchElement = (n1, n2) => {
    // 1. 比较元素的差异, 需要复用dom元素
    // 2. 比较属性和元素的子节点
    let el = (n2.el = n1.el);
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // 比较属性
    patchProps(oldProps, newProps, el);
    // 比较子节点
    patchChildren(n1, n2, el);
  }
  // 渲染走这里, 更新也走这里
  const patch = (n1, n2, container) => {
    // 两次渲染同一个元素直接跳过即可
    if (n1 == n2) {
      return;
    }
    // 直接移除旧的dom元素, 重新渲染新的dom元素
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    processElement(n1, n2, container);

  };
  const unmount = (vnode) => {
    hostRemove(vnode.el);
  }
  // 多次调用render会进行虚拟节点的比较, 再进行更新
  const render = (vnode, container) => {

    if (vnode == null) {
      // 移除当前容器中的dom元素
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render,
  };
}
// 完全不关心api层面, 可以跨平台

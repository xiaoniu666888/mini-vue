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
  const mountElement = (vnode, container, anchor) => {
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

    hostInsert(el, container, anchor);
  };
  // 初始化
  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container, anchor);
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
        console.log('key', key);
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      unmount(child);
    }
  }
  const patchKeyedChildren = (c1, c2, container) => {
    // [a,b,c]
    // [a,b,d,e]
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 从左往右比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        // 递归比较
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }
    // 到c终止
    // 到d终止
    // 从右往左比较
    // console.log(i, e1, e2) // 比对范围

    // 从右往左比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      // [a,b,c]
      // [d,e,b,c]
      if (isSameVnode(n1, n2)) {
        // 递归比较
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // console.log(i, e1, e2) // 比对范围

    // [a, b] [a, b, c] | [a, b] [c, a, b] 
    // 处理增加和删除的特殊情况   [a, b, c] [a, b] | [c, a, b] [a, b] 

    // 最终比较乱序的情况

    // a b
    // a b c -> i = 2, e1 = 1, e2 = 0   i > e1 && i <= e2

    // a b
    // c a b -> i = 0, e1 = -1, e2 = 0   i > e1 && i <= e2
    if (i > e1) { // 新的多
      if (i <= e2) {
        // 插入
        const nextPos = e2 + 1;
        const anchor = c2[nextPos]?.el;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
        console.log('插入', anchor);
      }
    }

    // a b c
    // a b -> i = 2, e1 = 2, e2 = 1  i > e2 && i <= e1

    // c a b
    // a b -> i = 0, e1 = 1, e2 = -1  i > e2 && i <= e1


  }
  // 比较子节点
  const patchChildren = (n1, n2, el) => {
    // 新的是文本, 老的是数组
    // text array null
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    // 1. 新的是文本, 老的是数组, 移除老的
    // 2. 新的是文本, 老的也是文本, 内容不相同进行替换
    // 3. 新的是数组, 老的是数组, 全量 diff 算法
    // 4. 新的不是数组, 老师是数组, 移除老的
    // 5. 新的是空, 老的是文本
    // 6. 新的是数组, 老的是文本

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //  1. 新的是文本, 老的是数组, 移除老的
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 移除老的
        unmountChildren(c1);
      }
      // 2. 新的是文本, 老的也是文本, 内容不相同进行替换
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 3. 新的是数组, 老的是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 全量diff算法
          // 两个数组的对比
          patchKeyedChildren(c1, c2, el);
        } else {
          // 4. 新的不是数组, 老的是数组, 移除老的
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 5. 新的是空, 老的是文本
          hostSetElementText(el, '');
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 6. 新的是数组, 老的是文本
          mountChildren(c2, el);
        }
      }

    }
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
  const patch = (n1, n2, container, anchor = null) => {
    // 两次渲染同一个元素直接跳过即可
    if (n1 == n2) {
      return;
    }
    // 直接移除旧的dom元素, 重新渲染新的dom元素
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    processElement(n1, n2, container, anchor);

  };
  // 移除
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

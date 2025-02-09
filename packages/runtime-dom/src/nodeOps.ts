// 主要是对元素的增删改查

export const nodeOps = {
  // 插入元素
  // 第三个元素不存在等价于appendChild
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  //   删除元素
  remove(el) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  // 创建元素
  createElement(type) {
    return document.createElement(type);
  },
  // 创建文本节点
  createText(text) {
    return document.createTextNode(text);
  },
  // 设置文本
  setText(node, text) {
    node.nodeValue = text;
  },
  // 设置文本节点
  setElementText(el, text) {
    el.textContent = text;
  },
  // 获取当前节点的父元素
  parentNode(node) {
    return node.parentNode;
  },
  // 获取下一个兄弟节点
  nextSibling(node) {
    return node.nextSibling;
  }
}

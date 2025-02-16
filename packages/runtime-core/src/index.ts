import { ShapeFlags } from "@vue/shared"

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
        nextSibling: hostNextSibling
    } = renderOptions

    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // children[i] 可能是纯文本, 随后考虑
            patch(null, children[i], container)
        }
    }
    const mountElement = (vnode, container) => {
        const { type, children, props, shapeFlag } = vnode

        let el = hostCreateElement(type)
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        // 9 & 8 > 0 说明是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 数组
            mountChildren(children, el)
        }

        hostInsert(el, container)

    }
    // 渲染走这里, 更新也走这里
    const patch = (n1, n2, container) => {
        // 两次渲染同一个元素直接跳过即可
        if (n1 == n2) {
            return
        }
        if (n1 === null) {
            // 初始化操作
            mountElement(n2, container)
        }
    }
    // 多次调用render会进行虚拟节点的比较, 再进行更新
    const render = (vnode, container) => {
        // 将虚拟节点变成真实节点进行渲染
        patch(null, vnode, container)

    }
    return {
        render
    }
}
// 完全不关心api层面, 可以跨平台
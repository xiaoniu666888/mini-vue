export default function patchEvent(el, name, nextValue) {
    // 先获取事件名
    const invokers = el._vei || (el._vei = {})
    const eventName = name.slice(2).toLowerCase()
    // 是否存在同名的事件绑定
    const existingInvokers = invokers[name]

    if (nextValue && existingInvokers) {
        return existingInvokers.value = nextValue
    }
    if (nextValue) {
        // 创建一个调用函数, 并且内部调用传入的函数
        const invoker = (invokers[name] = createInvoker(nextValue))
        return el.addEventListener(eventName, invoker)
    }
    // 现在没有, 之前有
    if (existingInvokers) {
        el.removeEventListener(eventName, existingInvokers)
        invokers[name] = undefined
    }
}

function createInvoker(value) {
    const invoker = (e) => {
        return invoker.value(e)
    }
    invoker.value = value
    return invoker
}
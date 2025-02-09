export default function patchStyle(el, preValue, nextValue) {
    const style = el.style
    // 新样式要全部生效
    for (let key in nextValue) {
        style[key] = nextValue[key]
    }
    // 老样式中有的新样式没有的要移除
    if (preValue) {
        for (let key in preValue) {
            if (nextValue[key] == null) {
                style[key] = ''
            }
        }
    }
}
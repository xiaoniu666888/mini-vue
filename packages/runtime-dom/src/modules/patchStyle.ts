export default function patchStyle(el, preValue, nextValue) {
    if (!el || !el.style) return;

    const style = el.style;

    // 新样式要全部生效
    if (nextValue) {
        Object.keys(nextValue).forEach(key => {
            style.setProperty(key, nextValue[key]);
        });
    } else {
        // 如果 nextValue 为空，直接移除整个 style 属性
        el.removeAttribute('style');
        return; // 直接返回，无需处理旧样式
    }

    // 老样式中有的新样式没有的要移除
    if (preValue && nextValue) {
        Object.keys(preValue).forEach(key => {
            if (nextValue[key] == null) {
                style[key] = '';
            }
        });
    }
}
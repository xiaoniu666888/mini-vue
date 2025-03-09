function getSequence(arr) {
    const result = [0]; // 用来记录索引
    const p = result.slice(0);  // p为前驱节点的列表, 我们要根据它来追溯
    let start;
    let end;
    let middle;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            // 为了vue3的diff算法, 我们需要把0排除掉
            let resultLastIndex = result[result.length - 1]; // 取到最后一个
            if (arr[resultLastIndex] < arrI) { // 如果比最后一个大
                p[i] = result[result.length - 1];
                result.push(i);
                continue;
            }
        }
        // 二分查找
        start = 0;
        end = result.length - 1;
        while (start < end) {
            middle = ((start + end) / 2) | 0;
            if (arr[result[middle]] < arrI) {
                start = middle + 1;
            } else {
                end = middle;
            }
        }
        if (arrI < arr[result[start]]) {
            p[i] = result[start - 1]; // 找到的那个节点的前一个
            result[start] = i; // 替换
        }
    }


    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
        result[i] = last;
        last = p[last];
    }
    console.log(p);
    // 需要创建一个前驱节点, 进行倒序追溯
    return result;
}

console.log(getSequence([3, 2, 8, 9, 5, 6, 7, 11, 15, 4]))

// export default getSequence;



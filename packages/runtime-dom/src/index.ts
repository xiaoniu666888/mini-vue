import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";


// 将节点操作和属性操作合并在一起
const renderOptions = Object.assign({ patchProp }, nodeOps);

// function createRenderer(options: any) {

//     return {
//         render() {
//             // patch(null, vnode, container, null, null);
//         }
//     }
// }

// createRenderer(renderOptions).render();

export { renderOptions };
export * from "@vue/reactivity";

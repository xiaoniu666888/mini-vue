import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";
import { createRenderer } from "@vue/runtime-core"

// 将节点操作和属性操作合并在一起
const renderOptions = Object.assign({ patchProp }, nodeOps);
export { renderOptions };
export * from "@vue/runtime-core";

// 引用关系 runtime-dom -> runtime-core -> reactivity

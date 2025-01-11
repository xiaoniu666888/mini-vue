// 这个文件会帮我们打包 packages下的模块 最终打包出js文件
// node dev.js 要打包的名字 -f 打包的格式
// node中esm中没有__dirname  __filename

import minimist from "minimist"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"
import esbuild from "esbuild"

// node中的命令行参数通过process来获取 process.argv
const args = minimist(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url) // 当前文件的绝对路径
const __dirname = dirname(__filename) // 当前文件的目录
const require = createRequire(import.meta.url) // 引入模块的方法

const target = args._[0] || "reactivity" // 打包的模块
const format = args.f || "iife" // 打包后的模块规范
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const pkg = require(`../packages/${target}/package.json`)
// 根据需要进行打包
esbuild
  .context({
    entryPoints: [entry],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    bundle: true, // 所有的依赖打包成一个文件
    platform: "browser", // 打包后给浏览器使用
    sourcemap: true, // 可以调试源代码
    format, // 打包后的模块格式
    globalName: pkg.buildOptions?.name // 打包后的模块名
  })
  .then((ctx) => {
    console.log("start dev")
    return ctx.watch() // 监听入口文件持续进行打包处理
  })

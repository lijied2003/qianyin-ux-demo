# 趣丸千音 · 视频翻译工作台 UI/UX Demo

React + TypeScript + Vite + Tailwind CSS + Lucide。纯前端，无后端、无 AI 接口。

## 启动与构建

要求 Node.js 22.12+。在本 README 所在目录执行：

```bash
npm ci
npm run dev
```

打开终端打印的本地地址。生产构建与预览：

```bash
npm run build
npm run preview
```

`dist/` 是完整静态产物，请使用 HTTP 静态服务器打开。

## 演示步骤

1. 顶部切换「原版页面」：查看截图中的导航、顶栏、双 Tab、空数据表头及大型教学封面。为方便反复对比，原版固定呈现参考截图的空状态。
2. 切换「优化页面」：无效表头隐藏，展示创建入口、三步引导与紧凑教程卡片。
3. 展开教程：显示原封面与图文步骤。参考素材只有截图，没有教学视频源，未伪造可播放教程。
4. 创建原剧：输入剧名，选择或拖入本地视频；确认后自动进入原剧列表。
5. 列表支持剧名搜索、创建时间排序、每页条数、分页、查看详情及导出任务信息 JSON。
6. 详情可预览本次选择的视频；刷新后任务保留，重新选择原视频即可恢复预览。
7. 顶部「清空示例数据」经确认后恢复首次使用空状态；不会删除本地视频文件。

## 校验与数据边界

- localStorage 键：`qianyin-demo-tasks-v1`，保存 ID、剧名、文件名、大小、创建时间。
- 剧名必填，去除首尾空格，最多 50 字；选择视频可自动填充剧名。
- 校验 MP4/MOV/WebM 扩展名、浏览器提供的 MIME、空文件及 2 GB 大小上限。格式校验不等于媒体解码，视频编码支持由浏览器决定。
- 视频不上传、不写入 localStorage；通过临时 Object URL 预览，重置时释放。刷新后需选择文件名和大小一致的原视频恢复预览。
- 存储损坏时安全回退并提示；写入失败时保留创建窗口，不提示创建成功。
- 任务固定为「待译制」，无虚构翻译、配音、处理进度或成片。积分与容量上限为截图演示信息。
- 演示控制栏与产品区域独立；弹窗支持焦点循环、焦点返回、Escape 及遮罩关闭。
- 原版按截图保留 200px 侧栏、64px 顶栏、表头和教学区域，Lucide 替代原产品图标；品牌及教程封面从用户截图提取。非视频翻译模块提供范围说明。

## GitHub Pages 部署

将**本 README 所在目录的全部项目内容**作为 GitHub 仓库根目录上传，确保根目录包含 `package.json`、`package-lock.json` 和 `.github/workflows/deploy.yml`。

1. 推送到 `main` 分支。如使用其他分支，修改 workflow 的 `on.push.branches`。
2. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
3. Actions 中运行或等待「Deploy to GitHub Pages」，自动执行 `npm ci`、`npm run build` 并部署 `dist/`。
4. 成功后在工作流 environment 或仓库 Pages 页面打开部署地址。

Vite 设置 `base: './'`，脚本、样式与图片采用相对路径，兼容 `https://用户名.github.io/仓库名/`。无客户端路由，无需 404 重定向。

若将项目放在已有仓库的子目录，请同步设置 workflow 的 `defaults.run.working-directory`、`setup-node` 的 `cache-dependency-path` 以及上传产物的 `dist` 路径。

## 本地测试

```bash
# 测试使用 Chrome，若未安装：
npx playwright install chrome
npm test
```

Playwright 自动启动测试服务器。当前 4 条端到端用例全部通过，覆盖版本切换、表头隐藏、教程、必填/格式/空文件校验、创建列表、详情预览入口、刷新持久化、搜索、译制空状态、取消/确认清空、390px 窄屏无整页横向溢出、弹窗焦点循环、存储失败及损坏数据恢复。

生产构建 `npm run build` 通过。桌面 1920×1080 四个交付状态已逐张视觉检查。测试上传使用内存元数据夹具，验证任务流程及预览元素，不验证真实媒体编解码。线上地址：https://lijied2003.github.io/qianyin-ux-demo/ 。仓库：https://github.com/lijied2003/qianyin-ux-demo 。

## 主要文件

- `src/main.tsx`：页面、弹窗、存储和交互。
- `src/styles.css`：截图复刻、优化布局与响应式样式；Tailwind 由 Vite 插件集成。
- `public/`：品牌及教程封面。
- `tests/workbench.spec.ts`：端到端测试。
- `.github/workflows/deploy.yml`：Pages 部署工作流。


## 最终交付检查

- 三步流程改为有序列表，使用细线及箭头连接；保持原有尺寸、位置和黑白风格。
- 原版与优化版统一显示“体验用户”。优化版仅任务列表显示分页；空状态隐藏分页控件，保留页脚布局。
- 复核字体、步骤标题对齐、教程卡片、弹窗和列表；补齐按钮按下态及上传区悬停/键盘焦点状态。
- 全部 4 项 Playwright 测试通过，生产构建成功。新增交付测试会自动输出 4 张原生 PNG（1920×1080、设备像素比 1），文件位于项目相邻的 `screenshots/` 目录。
- 截图包括原版、优化版、创建弹窗、任务列表。任务列表截图使用测试元数据，无真实 AI 译制结果；测试不会改动日常演示服务器中的用户数据。

### 部署前最后一步

项目使用独立公开仓库 `lijied2003/qianyin-ux-demo`，GitHub Pages 采用 GitHub Actions 部署。推送 `main` 即可触发生产构建与发布。`node_modules/`、本地构建产物、测试输出和环境文件由 `.gitignore` 排除。

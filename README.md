# 共生战线 · Parti 双人自走棋

基于 Vite、TypeScript 与 Three.js 的双人同盘自走棋。2 名真人各自运营商店与经济，共享棋盘羁绊和 100 生命，与 7 支机器人队竞争。当前实现 62 枚棋子、24 个羁绊、10 件装备、野怪、淘汰排名和完整回合循环。

所有战斗与运营规则为独立 TypeScript 模块。Parti 房主 Worker 持有唯一权威状态，客户端 Worker 重算正在观看的一场战斗，Three.js 只负责表现。当前不需要独立后端，不实现跨设备战斗委派。

## 开发与试玩

环境：Node.js 22.12+、pnpm 10+。依赖版本由 `pnpm-lock.yaml` 固定。

```sh
pnpm install
pnpm dev
```

打开终端中的本地地址，默认 [http://localhost:5173](http://localhost:5173)。开发模式会在专用 Worker 中运行**实际房间定义**，创建 A / B 两个本地席位。由 A 席点击「开始远征」，左上角设置 → 开发工具 → 切换本地席位，可切换两席，分别买棋、部署和准备。未操作的另一席不会自动托管。

本地预览只用于开发和人工试玩，刷新会重开房间；它不是跨设备联机服务，也不模拟 Parti 持久化。生产包不包含本地房间替代逻辑。

## 打包导入 Parti

```sh
pnpm pack:room
```

生成：

- `dist/`：完整 filesystem Room Package，包括 manifest、HTML、JS、CSS、权威 Worker 和客户端回放 Worker。
- `artifacts/parti.room.zip`：可以导入 Parti 的 ZIP，manifest 位于压缩包根目录。

在 Parti 的房间导入入口选择 ZIP，然后由房主创建房间并邀请另一设备。房主本身占 1 席，房间上限 2 席；14 名机器人只是房间内的数据实体。

直接用 `pnpm preview` 打开生产页面会提示需要 Parti，这是预期行为。生产包依赖 Parti 注入 `parti`，不能用普通静态网页替代房间 Runtime。

代码不依赖 Parti 内部源码。`src/parti/contracts.ts` 与 `sdk.d.ts` 只声明公开契约，运行时的 `defineRoom` 由 Parti 加载器注入。Vite 的 SDK alias **只服务本地预览**；权威 Worker 由独立 esbuild 打包，并保留 SDK external import。

如果将来接入 Parti 仓库的 Harness，脚本也支持由调用者注入输出目录：

```sh
PARTI_ROOM_DEV_OUT_DIR=/absolute/path/to/dev-package pnpm dev:room
PARTI_ROOM_BUILD_OUT_DIR=/absolute/path/to/production-package pnpm build:room
```

当前项目保持独立仓库，不自动修改 Parti 主仓库或注册为其内置应用。

## 操作

全屏 Three.js 战场，实体备战区位于棋盘下沿：A 席在左，B 席在右，中央金色四格用于交换。顶部显示对阵、生命和倒计时，屏幕下沿集中经济和准备操作。

- 单击招募卡购买到自己的备战区，卡面来自实际低多边形棋子模型。商店可收起，准备阶段自动展开，战斗开始自动收起。
- 鼠标或触摸拖动棋子到己方半场部署；也可点选棋子，再点空格。拖动中商店临时收起，松手恢复。
- 拖到已有棋子的格子进行合法换位。触控点选模式先选棋子，再点详情中的「换位」，最后点目标棋子。直接点击另一棋子只切换选择。
- 可交换自己的备战棋子、自己的场上和备战棋子，以及同队两枚场上棋子。队友私人备战区和公共区不能换位。
- 中央金色格用于交付。队友选中公共棋子，再点自己的空备战格领取；交付者可用同样方式撤回。同一拥有者的公共棋子参与自动合成，且合成结果留在公共区。
- 拖动自己的非公共区棋子时，底部操作栏会切换为出售区；松手后需再次确认。也可在选中浮层中直接出售；装备返回背包。棋盘上的队友棋子只能调整站位。
- 屏幕边缘背包可展开；拖装备到自己的棋子，或先点装备再点棋子穿戴。选中装备显示效果说明，无须悬停。
- 详情中「需要」标记会提示队友招募栏，再次标记同一种可取消。点击空白、Escape 或右键取消选择，手机长按棋子查看详情。
- D 刷新，F 买经验，Space 开关商店，Escape 取消；没有单键出售。
- 双方准备完成提前进入战斗。右侧队伍头像切换观战，左上返回按钮回到本队；手机通过排名按钮展开队伍列表。
- 日志、AI 决策和本地双席切换位于开发工具，正常战场不展示表单或调试输出。

新界面与输入架构说明见 [界面与操作系统](docs/ui-interaction.md)。横竖屏布局及触控手感待真实设备验收。

## 验证

```sh
pnpm check          # TypeScript strict、模块依赖边界、内容表校验
pnpm test           # 有价值的纯逻辑测试
pnpm simulate 20    # 用同一套规则跑 20 局，逐命令校验卡池/人口/位置守恒
pnpm bench          # Node 环境战斗 CPU 基准，输出设备信息和 P95
pnpm format:check   # 源码格式检查
pnpm build          # 生产构建 + Parti 产物契约检查
```

模拟和基准报告写入 `reports/`。设备上的实际调度开销可查看 Parti DevTools 的 `game:performance` 日志，包含整轮计算时间、最大计算切片、切片数、快照字节数。这不是实际网络流量统计；传输量需以浏览器 Network 或 Parti Runtime 日志为准。

自动测试不代替真实联机、触控、画面与刷新恢复验收。详细步骤见 [人工验收清单](docs/acceptance.md)。

## 开发文档

- [界面与操作系统](docs/ui-interaction.md)：HUD、输入状态机、取景、回放与交互验收。
- [架构与决策](docs/architecture.md)：依赖方向、状态生命周期、恢复、计算调度。
- [规则与内容扩展](docs/rules-and-content.md)：自定义数值、卡池、技能与添加内容流程。
- [本轮验证结果](docs/verification.md)：测试、20 局模拟、CPU 基准和未实测边界。
- [人工验收清单](docs/acceptance.md)：桌面、手机、双设备与恢复场景。
- [交付范围与后续阶段](docs/roadmap.md)：首版已实现内容与尚未完成的验收。
- [原始复原手册](战争艺术无限进化_双人PVE复原手册_v1.md)：机制参考；当前内容不是原作数值级复刻。

目前所有模型均为程序生成的低多边形棋子，未使用参考图中的原作模型或贴图。部分棋子标签和技能按当前 24 羁绊池进行了改编。后续仍需玩法平衡与真人设备验收；肉鸽模式属于后续阶段。

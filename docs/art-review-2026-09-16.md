# 棋子模型视觉复查：铁巨神、神威塔

本轮使用 headless-visual-qa，对实际 Three.js 渲染截图进行检查和两轮修正。范围为这两枚棋子，不代表其余 60 枚通过美术验收。采用深青装甲／黄铜机械、象牙石材／鎏金神殿的风格化美术方向。

## 缺陷与修改

| 棋子 | 实际观察到的问题 | 修改结果 |
| --- | --- | --- |
| 铁巨神 | 脚埋入底座，肩炮朝天，胸腹与双臂是方块拼装，所有材质观感相同 | 重建腿脚高度和炮管坐标；独立绘制倒角胸甲、肩甲、护臂、脚甲轮廓；增加炮口内膛、套筒、散热片、膝肘轴、指节和装甲嵌线；分离釉面、钢与黄铜材质 |
| 神威塔 | 第一轮重做后，扶壁挡窗、中心柱遮挡内部、塔尖侧面呈平板 | 扶壁移动至四角；缩窄中心承重轴；拱窗使用真实孔洞；增加窗框镶边、柱槽、台基线脚、内核与双轴环仪；塔尖改为立体结构 |

模型仍通过原有资源入口加载，游戏与验收台使用相同模型。动作关节和技能挂点名称保留。没有修改规则、数值、战斗计算或机器人。

## 有效截图

- 铁巨神原始截图：`../.tmp/art-review-before/titan.png`
- 铁巨神最终斜前方：`../.tmp/art-review-final/titan-front.png`
- 铁巨神最终背面：`../.tmp/art-review-final2/titan-back.png`
- 铁巨神普攻 58%：`../.tmp/art-review-final/titan-attack.png`
- 神威塔最终斜前方：`../.tmp/art-review-final2/tower-front.png`
- 神威塔最终侧面：`../.tmp/art-review-final2/tower-side.png`
- 神威塔技能 50%（附七格动作胶片）：`../.tmp/art-review-final2/tower-skill.png`

所有以上有效截图均已直接查看。原始神威塔和第一轮最终背面捕获为空白，已排除，不能作为通过证据。截图目录中的 manifest 保留 URL、角度、阶段和分辨率；各轮使用新的输出目录，避免捕获脚本误读已有 PNG。

复现：`pnpm dev` 后访问 `/?art-playground=1&unit=titan&inspect=model&paused=1&yaw=2.65`。神威塔替换为 `unit=divine_tower`；背面 `yaw=-0.65`，侧面 `yaw=1.57`。动作检查移除 `inspect=model`，设置 `mode=attack&phase=0.58` 或 `mode=skill&phase=0.5`。

## 验证与发布边界

`pnpm check`、`pnpm test`（53 项）、`pnpm build` 全部通过。新增测试验证脚底与底座位置、炮口前向、窗洞射线贯通，以及不同轮廓的几何缓存隔离。部件数量和测试通过不等于美术质量通过。

已检查上述角度和动作关键帧中的轮廓、接地、遮挡和材料区分。当前为可运行的风格化模型改进版本，尚未完成真机棋盘尺寸辨识度、密集阵容 GPU 性能及全部动作连续播放验收，因此不据此宣称已通过最终上线验收。仍需在目标设备确认；本轮未验证实际玩法、手机性能或 Parti 恢复。


## 后续批次进度（2026-09-16）

详细记录见 [art-batches.md](art-batches.md)。目前已完成 33/62 枚选定视角的桌面造型复查，余 29 枚。本次新增 turtle、bull、venom、pangolin；最终合成图为 `../.tmp/beasts-b-final/sheet.png`。所有 62 种模型继续使用无统一彩色底座、无底部星级环方案，星级使用头顶标记；建筑自身承重结构保留。旧截图中的底座仅为历史状态。check、test（60 项）、build 通过。下一批为 bat、killerbee、burstbug、eye、spider、toad。桌面复查不等于真机或最终上线验收。

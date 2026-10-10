# 全棋子特效制作清单

素材：本项目 Canvas 程序化绘制的 4×4 折面灰度图集（无 AI 图片、无外部资源），运行时按配方着色。所有动作共用战斗特效运行时。

| 棋子 | 普攻 | 技能 |
|---|---|---|
| kong | 拳锋气压 | 金刚护体金纹 |
| shield | 盾棍电击 | 盾击震慑 |
| lion | 狮爪三痕 | 石化怒吼岩纹 |
| shield_slave | 木盾横击 | 傀儡盾篆 |
| staff_slave | 长棍圆扫 | 撼地棍裂纹 |
| sage | 飞符灵矢 | 天师雷暴 |
| dog | 双管曳光 | 双炮交替轰击 |
| burstbug | 虫颚酸星 | 腹囊爆裂酸焰 |
| ape | 钢拳冲压 | 重拳碎地 |
| motor | 骑枪短焰 | 焦油弹烟焰 |
| bomber | 航弹坠落 | 燃烧弹幕 |
| titan | 巨神铁拳 | 核子重炮熔爆 |
| child | 灵珠星尾 | 灵珠回能流光 |
| medic | 注射针弹 | 医疗微粒缝合 |
| repair | 焊枪电星 | 维修焊花束 |
| deer | 鹿角叶矢 | 长生花露 |
| gunner | 步枪细曳光 | 超频枪膛充能 |
| bird_rider | 弩箭羽尾 | 飞羽连弩 |
| thunder | 雷锤电矢 | 雷鼓霹雳 |
| arhat | 罗汉掌印 | 破妄掌印 |
| commando | 消焰精确射击 | 超距狙杀穿甲线 |
| bat | 翼振声纹 | 回声音爆 |
| killerbee | 蜂针细线 | 连刺蜂针尾迹 |
| aircrab | 蟹炮水雾 | 威胁锁定炮弹 |
| tank | 抛石碎屑 | 架炮压力蒸汽 |
| dragon | 龙息火舌 | 翔龙震荡气浪 |
| ark | 舰炮航迹 | 甲板机群放飞 |
| bone_dragon | 亡骨魂矛 | 亡骨幽魂风暴 |
| whale | 鳍击水涌 | 幻海卷浪潮汐 |
| eye | 瞳光细束 | 凝视锁魂 |
| spider | 蛛丝毒滴 | 魅惑织网 |
| vine | 藤鞭抽击 | 荆棘攀缠 |
| eel | 电鳗游弧 | 电海分叉雷瀑 |
| grenadier | 榴弹弧线 | 灵能手雷爆燃 |
| zen_panda | 禅掌涟纹 | 禅意莲华爆发 |
| toad | 长舌黏液 | 吞噬旋吸 |
| axe_slave | 斧刃重弧 | 回旋双斧痕 |
| pangolin | 鳞爪刮痕 | 钻地破土突进 |
| osprey | 灵鹫爪风 | 扑杀羽流 |
| ghost | 相位翼刃 | 幽灵折跃残像 |
| ninja_panda | 双刃交错 | 影分身交叉斩 |
| iron_chicken | 钢喙穿刺 | 钢羽突刺翼痕 |
| master | 操偶丝刃 | 刀奴符纸幻象 |
| wolf | 幽爪双痕 | 狼群幽影裂隙 |
| shark | 鲨鳍破浪 | 须弥化身水门 |
| monk_panda | 武僧拳风 | 护身气劲 |
| mammoth | 象牙撼击 | 巨象奔袭尘浪 |
| sword_slave | 直剑冷光 | 剑势锋芒 |
| flame | 喷口火舌 | 持续火焰喷流 |
| venom | 腐液吐沫 | 腐蚀吐息毒雾 |
| blade_slave | 阔刀斩痕 | 狂刃燃锋 |
| blood_eagle | 血羽爪痕 | 血鹰展翼蜕变 |
| tree | 老枝敲击 | 古树破土禁锢 |
| alchemy_tower | 无普攻 | 炼金蒸馏灵雾 |
| divine_tower | 神威光矢 | 神威封锁刻印 |
| transform_tower | 变形炮弹 | 四瓣装甲能量重构 |
| ukyo | 居合薄刃 | 秘剑细雪 |
| nakoruru | 短刀羽痕 | 飞鹰俯冲翼影 |
| athena | 灵能晶矢 | 闪光水晶波 |
| turtle | 玄甲水击 | 玄水流纹结界 |
| bull | 重棍裂击 | 撼地怒吼裂隙 |
| buddha | 金箍棍风 | 斗战金焰横扫 |

## 风格与来源

最终版本完全使用项目代码绘制的折面图集（1024×1024，16 格）和定制网格。图集位于 `src/client/art/effects/atlas.ts`，水晶、骨片承载体与无人机轮廓位于 `sculptures.ts`。没有联网加载、AI 栅格图片或新增第三方素材许可依赖。曾生成的写实图集已退出实现并从项目删除。

几何承载面使用明确独立的 BufferGeometry，不经过按 parameters 自动合并的 GameResources 缓存。图集与 ShaderMaterial 由 EffectLibrary 持有；实例由池复用，结束移出场景，退出统一释放。每个实例最多 64 个贴片、6 条 24 段拖尾及有限折面装饰；80 个瞬态实例、96 个状态实例是上限。超过 20/40 个瞬态时降低次要粒子量，优先保留技能主体；这些是实现预算，不是真机性能结论。

## 时间与规则边界

蓄势/释放/命中取自 CombatAction。战斗插值最多覆盖现有四 tick 快照间隔；命中等待回放帧或 actionImpact 确认，取消事件清理实例。EffectInstance.sample 是绝对时间采样，回退重采样结果一致。跳转超过八 tick 或回退时清场并根据当前 actions 重建；历史已结束的短暂余韵不会在跳转后补播。

内容表是技能数值、范围和触发条件的唯一来源。无普攻的炼金塔不渲染攻击；其技能展示是结算意象，实际战斗不会虚构施法事件。爆裂虫由死亡事件触发。护盾和能量的实际受益单位来自对应事件，不绘制虚假的全屏伤害。持续灼烧与中毒按来源区分；跨越回放跳转缺少历史来源时显示通用毒性状态。

## 本轮验证（2026-10-10）

- `pnpm check`：通过；内容 hash 保持 `0cef8f99`。
- `pnpm test`：72 项通过。新增零飞行时长边界、事件去重、绝对时间回采样、资源释放/复用、目标跟随、回退清场、无攻击单位、真实模型挂点和命中确认/取消测试。
- `pnpm build`：通过；包契约通过。Three.js 分包仍有大于 500 kB 的构建提示。
- 技能截图：`.tmp/vfx-final/`，8 张合成图，覆盖 62 枚棋子的普攻命中与技能四阶段。已经逐张查看，修正初版高亮、全队护盾遮挡、部分技能语义与范围取景。
- 普攻序列：`.tmp/vfx-attacks/`，同样使用固定 seed 7，按蓄势、传播、命中、余韵检查。
- 真实战斗回放：`.tmp/vfx-battle/` 的 tick 24/64；`.tmp/vfx-battle-final/shields.png` 的 tick 112；`.tmp/vfx-crowded-retry/` 的 tick 152。32 枚起始棋子，使用现有 buildReplay 和 CombatEffects。一次加载尚未完成的纯色截图作废，重拍后查看。
- 未修改战斗引擎、规则、数值或 bots，未运行规则/机器人模拟基准；混战验收只消费现有引擎生成的回放。

## 复现入口

运行 `pnpm dev --port 4178` 后：

- `/?vfx-review=whale,bone_dragon,tree,turtle,bull,buddha&seed=7`：棋盘尺度关键帧。
- 同一地址加 `&mode=attack`：普攻序列。
- `/?vfx-battle=1&tick=112&seed=7`：真实回放混战。
- `/?art-playground=1&unit=whale&mode=skill&phase=0.52&paused=1`：可逐帧检查的现有预览台，已改用共享渲染器和内容时序。

上述验收页仅存在于开发入口，生产包不含它们。离屏静态序列不能证明连续动态观感、移动设备帧率、触摸体验或 Parti 恢复行为；这些仍交由人工实机验收，不据此宣称已获得上线美术认证。

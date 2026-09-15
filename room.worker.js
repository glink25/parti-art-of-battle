// src/parti/room.ts
import { defineRoom } from "@parti/worker-sdk";

// src/domain/placement.ts
function samePosition(a, b) {
  return a.zone === b.zone && (a.zone === "board" && b.zone === "board" ? a.x === b.x && a.y === b.y : a.zone !== "board" && b.zone !== "board" && a.slot === b.slot);
}
function isPosition(pos, limits) {
  if (!pos || typeof pos !== "object") return false;
  return pos.zone === "board" ? Number.isInteger(pos.x) && Number.isInteger(pos.y) && pos.x >= 0 && pos.x < limits.boardSize && pos.y >= limits.deploymentRow && pos.y < limits.boardSize : (pos.zone === "bench" || pos.zone === "public") && Number.isInteger(pos.slot) && pos.slot >= 0 && pos.slot < (pos.zone === "bench" ? limits.benchSize : limits.publicSize);
}
function assessPlacement(s, actor, intent, limits) {
  const fail = (reason) => ({ ok: false, reason });
  const p = s.players[actor], u = s.units[intent.unitId];
  if (s.phase !== "prep") return fail("\u5F53\u524D\u4E0D\u80FD\u5E03\u9635");
  if (!p || s.teams[p.teamId]?.hp <= 0) return fail("\u6CA1\u6709\u53EF\u64CD\u4F5C\u7684\u5E2D\u4F4D");
  if (!u || u.teamId !== p.teamId) return fail("\u53EA\u80FD\u64CD\u4F5C\u672C\u961F\u68CB\u5B50");
  if (u.version !== intent.unitVersion) return fail("\u68CB\u5B50\u5DF2\u53D8\u5316");
  if (!isPosition(u.position, limits)) return fail("\u6E90\u68CB\u5B50\u4F4D\u7F6E\u65E0\u6548");
  if (intent.kind === "swap") {
    const other = s.units[intent.targetId ?? ""];
    if (!other || other.id === u.id) return fail("\u8BF7\u9009\u62E9\u53E6\u4E00\u679A\u68CB\u5B50");
    if (other.teamId !== p.teamId) return fail("\u4E0D\u80FD\u4E0E\u654C\u65B9\u6362\u4F4D");
    if (other.version !== intent.targetVersion) return fail("\u76EE\u6807\u68CB\u5B50\u5DF2\u53D8\u5316");
    if (!isPosition(other.position, limits)) return fail("\u76EE\u6807\u68CB\u5B50\u4F4D\u7F6E\u65E0\u6548");
    if (u.position.zone === "public" || other.position.zone === "public")
      return fail("\u516C\u5171\u533A\u68CB\u5B50\u8BF7\u5148\u9886\u53D6");
    if (!(u.position.zone === "board" && other.position.zone === "board") && (u.ownerId !== actor || other.ownerId !== actor))
      return fail("\u4E0D\u80FD\u64CD\u4F5C\u961F\u53CB\u79C1\u4EBA\u5907\u6218\u533A");
    for (const id of /* @__PURE__ */ new Set([u.ownerId, other.ownerId])) {
      const count = Object.values(s.units).filter(
        (v) => v.ownerId === id && (v.id === u.id ? other.position.zone : v.id === other.id ? u.position.zone : v.position.zone) === "board"
      ).length;
      if (count > s.players[id].level) return fail("\u4EA4\u6362\u540E\u4EBA\u53E3\u8D85\u51FA\u4E0A\u9650");
    }
    return { ok: true, reason: "" };
  }
  const pos = intent.position;
  if (!isPosition(pos, limits)) return fail("\u8BF7\u653E\u5165\u5DF1\u65B9\u6709\u6548\u683C\u5B50");
  if (u.position.zone === "bench" && u.ownerId !== actor) return fail("\u4E0D\u80FD\u64CD\u4F5C\u961F\u53CB\u79C1\u4EBA\u5907\u6218\u533A");
  if (u.ownerId !== actor && u.position.zone === "board" && pos.zone !== "board")
    return fail("\u961F\u53CB\u573A\u4E0A\u68CB\u5B50\u4EC5\u53EF\u8C03\u6574\u7AD9\u4F4D");
  if (u.position.zone === "public" && pos.zone !== "bench") return fail("\u8BF7\u5148\u9886\u53D6\u5230\u79C1\u4EBA\u5907\u6218\u533A");
  const ownerId = u.position.zone === "public" ? actor : u.ownerId;
  if (pos.zone === "bench" && intent.benchOwnerId && intent.benchOwnerId !== ownerId)
    return fail("\u8BF7\u653E\u5165\u81EA\u5DF1\u7684\u5907\u6218\u533A");
  if (Object.values(s.units).some(
    (v) => v.id !== u.id && v.teamId === p.teamId && samePosition(v.position, pos) && (pos.zone !== "bench" || v.ownerId === ownerId)
  ))
    return fail("\u76EE\u6807\u683C\u5DF2\u6709\u68CB\u5B50\uFF0C\u53EF\u62D6\u62FD\u6362\u4F4D");
  if (pos.zone === "board" && u.position.zone !== "board" && Object.values(s.units).filter((v) => v.ownerId === ownerId && v.position.zone === "board").length >= s.players[ownerId].level)
    return fail("\u4E0A\u9635\u4EBA\u53E3\u5DF2\u6EE1");
  return { ok: true, reason: "", ownerId };
}

// src/domain/random.ts
function nextRandom(seed) {
  let x = seed >>> 0 || 2654435769;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
function hashText(text, initial = 2166136261) {
  let hash = initial >>> 0;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}
function deriveSeed(seed, key) {
  return hashText(key, seed || 2166136261);
}
function hashValue(value) {
  return hashText(JSON.stringify(value)).toString(16).padStart(8, "0");
}
function compareId(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// src/content/items.ts
var item = (value) => {
  const effects2 = [];
  if (value.attack)
    effects2.push({ trigger: "battleStart", target: "self", kind: "attack", value: value.attack });
  if (value.hp)
    effects2.push({ trigger: "battleStart", target: "self", kind: "heal", value: value.hp });
  if (value.haste)
    effects2.push({ trigger: "battleStart", target: "self", kind: "haste", value: value.haste });
  if (value.skillResist)
    effects2.push({
      trigger: "battleStart",
      target: "self",
      kind: "shield",
      value: value.skillResist
    });
  if (value.skillBonus)
    effects2.push({
      trigger: "battleStart",
      target: "self",
      kind: "skillDamage",
      value: value.skillBonus
    });
  if (value.cooldown)
    effects2.push({ trigger: "battleStart", target: "self", kind: "haste", value: value.cooldown });
  if (value.damageTakenSkill)
    effects2.push({
      trigger: "damaged",
      target: "self",
      kind: "skillDamage",
      value: value.damageTakenSkill
    });
  if (value.onHitRamp)
    effects2.push({ trigger: "attackHit", target: "self", kind: "attack", value: value.onHitRamp });
  if (value.silenceEnergy)
    effects2.push({
      trigger: "attackHit",
      target: "current",
      kind: "silence",
      value: value.silenceEnergy,
      duration: 30
    });
  return { ...value, effects: effects2 };
};
var ITEMS = [
  item({
    id: "blade",
    name: "\u4FEE\u7F57\u5200",
    description: "\u653B\u51FB +25\uFF0C\u523A\u6740\u66B4\u51FB\u5F3A\u5316",
    attack: 25,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0
  }),
  item({
    id: "shield",
    name: "\u5438\u6536\u78C1\u76FE",
    description: "\u751F\u547D +160\uFF0C\u62A4\u7532 +4\uFF1B\u53D7\u51FB\u53E0\u52A0\u6280\u80FD\u6548\u679C",
    attack: 0,
    hp: 160,
    armor: 4,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    damageTakenSkill: 2
  }),
  item({
    id: "blood",
    name: "\u8840\u6C60\u4E4B\u4E3B",
    description: "\u5438\u8840 20%\uFF0C\u653B\u51FB +10",
    attack: 10,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 20,
    skillBonus: 0
  }),
  item({
    id: "clock",
    name: "\u5149\u9634\u62A4\u7B26",
    description: "\u653B\u51FB\u95F4\u9694 -10%\uFF0C\u6280\u80FD\u51B7\u5374 -15%",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 10,
    lifesteal: 0,
    skillBonus: 0,
    cooldown: 15
  }),
  item({
    id: "book",
    name: "\u795E\u6069\u96C6",
    description: "\u6280\u80FD\u6548\u679C +30%\uFF0C\u6280\u80FD\u51B7\u5374 -10%",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 30,
    cooldown: 10
  }),
  item({
    id: "capsule",
    name: "\u751F\u547D\u80F6\u56CA",
    description: "\u751F\u547D +250\uFF1B\u9996\u6B21\u4F4E\u751F\u547D\u83B7\u5F97\u77ED\u6682\u65E0\u63A7\u4E0E\u6280\u80FD\u51CF\u4F24",
    attack: 0,
    hp: 250,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    emergencyImmunity: 30
  }),
  item({
    id: "spicy",
    name: "\u8FA3\u59B9",
    description: "\u6280\u80FD\u6548\u679C +45%",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 45
  }),
  item({
    id: "splitter",
    name: "\u65A9\u88C2\u5251",
    description: "\u653B\u51FB\u95F4\u9694 -35%\uFF0C\u4F46\u65E0\u6CD5\u4E3B\u52A8\u65BD\u6CD5",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 35,
    lifesteal: 0,
    skillBonus: 0,
    noSkill: true
  }),
  item({
    id: "scythes",
    name: "\u53CC\u9570",
    description: "\u8FDE\u7EED\u653B\u51FB\u540C\u4E00\u76EE\u6807\u9010\u5C42\u589E\u4F24\uFF0C\u6362\u76EE\u6807\u91CD\u7F6E",
    attack: 8,
    hp: 0,
    armor: 0,
    haste: 8,
    lifesteal: 0,
    skillBonus: 0,
    onHitRamp: 8
  }),
  item({
    id: "silence",
    name: "\u6C89\u5BC2\u62A4\u7B26",
    description: "\u6280\u80FD\u9632\u5FA1\u5F3A\u5316\uFF0C\u5E76\u6C89\u9ED8\u9AD8\u80FD\u91CF\u76EE\u6807",
    attack: 0,
    hp: 80,
    armor: 2,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    skillResist: 20,
    silenceEnergy: 70
  })
];
var ITEM_BY_ID = Object.fromEntries(ITEMS.map((value) => [value.id, value]));

// src/content/rules.ts
var RULES = {
  id: "twins-original-03",
  simulationVersion: "3",
  tickRate: 20,
  maxTicks: 900,
  entityCap: 64,
  triggerCap: 64,
  prepMs: 25e3,
  maxRounds: 50,
  maxLevel: 8,
  benchSize: 8,
  publicSize: 4,
  salePercent: 75,
  refreshCost: 2,
  xpCost: 5,
  xpGain: 5,
  experience: [0, 1, 3, 7, 15, 27, 45, 69],
  shopOdds: [
    [100, 0, 0, 0, 0],
    [80, 20, 0, 0, 0],
    [65, 30, 5, 0, 0],
    [50, 35, 15, 0, 0],
    [35, 35, 25, 5, 0],
    [25, 30, 30, 14, 1],
    [18, 25, 32, 20, 5],
    [12, 20, 30, 28, 10]
  ],
  starScale: [100, 180, 320],
  poolByCost: [36, 30, 24, 18, 12],
  neutralDropChance: 70,
  damageArmorBase: 100,
  armorCoefficient: 6,
  attackEnergy: 20,
  hitEnergy: 10,
  earlyIncome: [1, 2, 3],
  baseIncome: 5,
  interestStep: 10,
  interestCap: 5,
  streakRewards: [
    [3, 1],
    [5, 2],
    [7, 3]
  ],
  itemSlots: 3,
  minAttackTicks: 5,
  maxHaste: 70,
  botCommandBudget: 24,
  botRefreshBudget: 8
};
var PLACEMENT_LIMITS = {
  boardSize: 10,
  deploymentRow: 5,
  benchSize: RULES.benchSize,
  publicSize: RULES.publicSize
};

// src/content/synergies.ts
var synergy = (id, name, thresholds, effect, values, description, scope = "selfTag") => ({ id, name, thresholds, effect, values, description, scope });
var SYNERGIES = [
  synergy("infantry", "\u6B65\u5175", [2, 4, 6], "hpPercent", [12, 24, 38], "\u6B65\u5175\u751F\u547D\u63D0\u9AD8 12% / 24% / 38%"),
  synergy("cavalry", "\u9A91\u5175", [2], "enemyArmor", [4], "\u654C\u65B9\u62A4\u7532\u964D\u4F4E 4", "allEnemies"),
  synergy("armor", "\u88C5\u7532", [3, 5], "armor", [4, 8], "\u88C5\u7532\u62A4\u7532 +4 / +8"),
  synergy("airforce", "\u7A7A\u519B", [2, 4], "dodge", [15, 25], "\u7A7A\u519B\u95EA\u907F +15% / +25%"),
  synergy(
    "puppet",
    "\u5080\u5121",
    [2, 4, 6],
    "attackPercent",
    [10, 20, 35],
    "\u5080\u5121\u653B\u51FB +10% / +20% / +35%"
  ),
  synergy("psionic", "\u7075\u80FD\u8005", [2, 4], "reflect", [20, 35], "\u7075\u80FD\u8005\u53D7\u4F24\u53CD\u5F39 20 / 35 \u70B9\u4F24\u5BB3"),
  synergy(
    "walker",
    "\u9646\u884C\u8005",
    [1],
    "groundBonus",
    [1],
    "\u4EC5\u6709\u4E00\u79CD\u9646\u884C\u8005\u65F6\uFF0C\u5176\u666E\u653B\u9020\u6210\u771F\u5B9E\u4F24\u5BB3",
    "rule"
  ),
  synergy("marine", "\u6D77\u795E", [2, 4], "skillResist", [20, 35], "\u6D77\u795E\u53D7\u5230\u7684\u6280\u80FD\u4F24\u5BB3\u964D\u4F4E 20% / 35%"),
  synergy("beast", "\u91CE\u517D", [2, 4, 6], "haste", [10, 20, 35], "\u91CE\u517D\u653B\u51FB\u95F4\u9694\u964D\u4F4E 10% / 20% / 35%"),
  synergy("raptor", "\u731B\u79BD", [2, 4], "groundBonus", [20, 40], "\u7A7A\u4E2D\u731B\u79BD\u5BF9\u5730\u4F24\u5BB3 +20% / +40%"),
  synergy("insectoid", "\u5F02\u866B", [2, 4], "merge", [2, 4], "2/4 \u5F02\u866B\u542F\u7528\u4E00\u661F/\u4E8C\u661F\u4E8C\u5408\u4E00", "rule"),
  synergy("immortal", "\u4E0D\u673D\u8005", [2, 3], "linger", [80, 120], "\u6B7B\u4EA1\u540E\u7EE7\u7EED\u6218\u6597 4 / 6 \u79D2"),
  synergy("panda", "\u718A\u732B", [3], "fullEnergy", [100], "\u718A\u732B\u5F00\u6218\u65F6\u83B7\u5F97\u6EE1\u80FD\u91CF"),
  synergy("guard", "\u62A4\u536B", [2, 4], "shield", [100, 220], "\u62A4\u536B\u5F00\u573A\u62A4\u76FE 100 / 220"),
  synergy(
    "blast",
    "\u7206\u7834",
    [3, 6],
    "enemySkillResist",
    [15, 30],
    "\u654C\u65B9\u6280\u80FD\u9632\u5FA1\u964D\u4F4E 15% / 30%",
    "allEnemies"
  ),
  synergy("support", "\u652F\u63F4", [2, 4], "deathHeal", [60, 130], "\u652F\u63F4\u6B7B\u4EA1\u65F6\u6CBB\u7597\u53CB\u519B\u5E76\u6062\u590D\u80FD\u91CF"),
  synergy("sniper", "\u72D9\u51FB", [3, 6], "armorPen", [4, 9], "\u72D9\u51FB\u83B7\u5F97 4 / 9 \u70B9\u62A4\u7532\u7A7F\u900F"),
  synergy("siege", "\u653B\u57CE", [3, 6], "siegeBonus", [25, 50], "\u653B\u57CE\u5BF9\u91CD\u578B\u79CD\u65CF\u4F24\u5BB3 +25% / +50%"),
  synergy(
    "ability",
    "\u5F02\u80FD\uFF08\u6CD5\u672F\uFF09",
    [2, 4, 6],
    "enemyEnergyGain",
    [10, 20, 35],
    "\u654C\u65B9\u80FD\u91CF\u83B7\u5F97\u964D\u4F4E 10% / 20% / 35%",
    "allEnemies"
  ),
  synergy("assassin", "\u523A\u6740", [3, 6], "critical", [20, 35], "\u523A\u6740\u666E\u653B\u83B7\u5F97\u66B4\u51FB\u7387\u4E0E\u5F00\u573A\u5207\u540E"),
  synergy("summoner", "\u53EC\u5524", [3], "summonEnergy", [25], "\u53EC\u5524\u7269\u9020\u6210\u4F24\u5BB3\u65F6\u4E3B\u4EBA\u83B7\u5F97\u80FD\u91CF"),
  synergy("vanguard", "\u5148\u950B\uFF08\u6218\u58EB\uFF09", [3, 6], "regen", [3, 7], "\u5148\u950B\u6BCF\u79D2\u56DE\u590D 3% / 7% \u6700\u5927\u751F\u547D"),
  synergy(
    "building",
    "\u5EFA\u7B51",
    [2, 3],
    "cooldown",
    [15, 30],
    "\u5168\u961F\u6280\u80FD\u51B7\u5374 -15% / -30%",
    "allAllies"
  ),
  synergy(
    "fighter",
    "\u683C\u6597\u5BB6",
    [2, 3],
    "extreme",
    [25, 45],
    "\u4F4E\u751F\u547D\u8FDB\u5165\u6781\u9650\u6A21\u5F0F\uFF0C\u5F3A\u5316\u653B\u901F\u3001\u653B\u51FB\u4E0E\u56DE\u80FD"
  )
];

// src/content/units.ts
var rows = [
  {
    id: "kong",
    name: "\u91D1\u521A",
    cost: 1,
    tags: ["walker", "guard"],
    kind: "shield",
    skill: "\u91D1\u521A\u62A4\u4F53",
    description: "\u83B7\u5F97\u62A4\u76FE\u5E76\u575A\u5B88\u524D\u7EBF\u3002",
    shape: "soldier"
  },
  {
    id: "shield",
    name: "\u62A4\u76FE\u5175",
    cost: 1,
    tags: ["infantry", "guard"],
    kind: "stun",
    skill: "\u76FE\u51FB",
    description: "\u7729\u6655\u5F53\u524D\u76EE\u6807\u3002",
    shape: "soldier"
  },
  {
    id: "lion",
    name: "\u72C2\u72EE",
    cost: 3,
    tags: ["beast", "guard"],
    kind: "stun",
    skill: "\u77F3\u5316\u6012\u543C",
    description: "\u77F3\u5316\u5468\u56F4\u654C\u4EBA\u3002",
    shape: "beast",
    radius: 2
  },
  {
    id: "shield_slave",
    name: "\u76FE\u5974",
    cost: 1,
    tags: ["puppet", "guard"],
    kind: "shield",
    skill: "\u5080\u5121\u58C1\u5792",
    description: "\u83B7\u5F97\u9AD8\u989D\u62A4\u76FE\u3002",
    shape: "soldier"
  },
  {
    id: "staff_slave",
    name: "\u68CD\u5974",
    cost: 4,
    tags: ["puppet", "guard"],
    kind: "stun",
    skill: "\u64BC\u5730\u68CD",
    description: "\u91CD\u51FB\u5E76\u7729\u6655\u4E00\u7247\u654C\u4EBA\u3002",
    shape: "soldier",
    radius: 2
  },
  {
    id: "sage",
    name: "\u5929\u5E08",
    cost: 2,
    tags: ["psionic", "blast"],
    kind: "damage",
    skill: "\u96F7\u66B4",
    description: "\u53EC\u4E0B\u77ED\u51B7\u5374\u8303\u56F4\u96F7\u66B4\u3002",
    shape: "mystic",
    radius: 2
  },
  {
    id: "dog",
    name: "\u94C1\u72D7",
    cost: 1,
    tags: ["armor", "blast"],
    kind: "damage",
    skill: "\u706B\u70AE\u9F50\u5C04",
    description: "\u53D1\u5C04\u88C5\u7532\u7206\u7834\u5F39\u3002",
    shape: "mech"
  },
  {
    id: "burstbug",
    name: "\u7206\u88C2\u866B",
    cost: 1,
    tags: ["insectoid", "blast"],
    kind: "damage",
    skill: "\u7206\u88C2\u9057\u4EA7",
    description: "\u6B7B\u4EA1\u540E\u5EF6\u65F6\u81EA\u7206\u3002",
    shape: "insect",
    deathBurst: 130
  },
  {
    id: "ape",
    name: "\u94C1\u733F",
    cost: 3,
    tags: ["armor", "blast"],
    kind: "damage",
    skill: "\u9707\u8361\u62F3",
    description: "\u5BF9\u8FD1\u8EAB\u654C\u4EBA\u9020\u6210\u8303\u56F4\u4F24\u5BB3\u3002",
    shape: "mech",
    range: 1,
    radius: 2
  },
  {
    id: "motor",
    name: "\u6469\u6258\u9A91\u5175",
    cost: 3,
    tags: ["cavalry", "blast"],
    kind: "poison",
    skill: "\u7126\u6CB9\u5F39",
    description: "\u7126\u6CB9\u8303\u56F4\u6301\u7EED\u4F24\u5BB3\u5E76\u51CF\u7F13\u654C\u4EBA\u3002",
    shape: "soldier",
    radius: 2
  },
  {
    id: "bomber",
    name: "\u8F70\u70B8\u673A",
    cost: 3,
    tags: ["airforce", "blast"],
    kind: "damage",
    skill: "\u7A7A\u88AD",
    description: "\u4ECE\u7A7A\u4E2D\u8F70\u70B8\u76EE\u6807\u533A\u57DF\u3002",
    shape: "mech",
    layer: "air",
    radius: 2
  },
  {
    id: "titan",
    name: "\u94C1\u5DE8\u795E",
    cost: 5,
    tags: ["armor", "blast"],
    kind: "damage",
    skill: "\u6838\u5B50\u91CD\u70AE",
    description: "\u957F\u524D\u6447\u540E\u8F70\u51FB\u5927\u8303\u56F4\u533A\u57DF\u3002",
    shape: "mech",
    radius: 3,
    power: 360
  },
  {
    id: "child",
    name: "\u7AE5\u5B50",
    cost: 1,
    tags: ["psionic", "support"],
    kind: "buff",
    skill: "\u7075\u80FD\u704C\u6CE8",
    description: "\u4E3A\u5168\u961F\u6062\u590D\u80FD\u91CF\u3002",
    shape: "mystic"
  },
  {
    id: "medic",
    name: "\u519B\u533B",
    cost: 2,
    tags: ["infantry", "support"],
    kind: "heal",
    skill: "\u6218\u5730\u6CBB\u7597",
    description: "\u6CBB\u7597\u751F\u547D\u6BD4\u4F8B\u6700\u4F4E\u7684\u53CB\u519B\u3002",
    shape: "soldier"
  },
  {
    id: "repair",
    name: "\u7EF4\u4FEE\u673A",
    cost: 2,
    tags: ["airforce", "support"],
    kind: "shield",
    skill: "\u7EF4\u4FEE\u5149\u675F",
    description: "\u4FDD\u62A4\u5E76\u4FEE\u590D\u751F\u547D\u6700\u4F4E\u7684\u53CB\u519B\u3002",
    shape: "mech",
    layer: "air"
  },
  {
    id: "deer",
    name: "\u957F\u751F\u9E7F",
    cost: 1,
    tags: ["beast", "support"],
    kind: "heal",
    skill: "\u957F\u751F\u82B1",
    description: "\u4E3A\u53D7\u4F24\u53CB\u519B\u63D0\u4F9B\u56DE\u590D\u3002",
    shape: "beast"
  },
  {
    id: "gunner",
    name: "\u795E\u67AA\u624B",
    cost: 1,
    tags: ["infantry", "sniper"],
    kind: "buff",
    skill: "\u8D85\u9891\u5C04\u51FB",
    description: "\u77ED\u65F6\u95F4\u63D0\u9AD8\u81EA\u8EAB\u706B\u529B\u3002",
    shape: "soldier",
    range: 5
  },
  {
    id: "bird_rider",
    name: "\u9E1F\u9A91\u5175",
    cost: 1,
    tags: ["cavalry", "sniper"],
    kind: "damage",
    skill: "\u4FEF\u51B2\u5C04\u51FB",
    description: "\u8FDC\u7A0B\u5C04\u51FB\u5F53\u524D\u76EE\u6807\u3002",
    shape: "soldier",
    range: 5
  },
  {
    id: "thunder",
    name: "\u96F7\u9707\u5B50",
    cost: 3,
    tags: ["psionic", "sniper"],
    kind: "damage",
    skill: "\u8FDE\u73AF\u96F7",
    description: "\u9020\u6210\u8303\u56F4\u96F7\u7535\u4F24\u5BB3\u3002",
    shape: "mystic",
    range: 5,
    radius: 2
  },
  {
    id: "arhat",
    name: "\u7F57\u6C49",
    cost: 3,
    tags: ["walker", "sniper"],
    kind: "damage",
    skill: "\u7834\u5984\u4E00\u51FB",
    description: "\u5BF9\u5355\u4F53\u9020\u6210\u9AD8\u989D\u4F24\u5BB3\u3002",
    shape: "soldier",
    range: 5,
    power: 230
  },
  {
    id: "commando",
    name: "\u7279\u79CD\u5175",
    cost: 4,
    tags: ["infantry", "sniper"],
    kind: "damage",
    skill: "\u8D85\u8DDD\u72D9\u6740",
    description: "\u4ECE\u4E03\u683C\u5C04\u7A0B\u72D9\u51FB\u76EE\u6807\u3002",
    shape: "soldier",
    range: 7,
    power: 280
  },
  {
    id: "bat",
    name: "\u8759\u8760",
    cost: 2,
    tags: ["raptor", "sniper"],
    kind: "damage",
    skill: "\u58F0\u6CE2\u51B2\u51FB",
    description: "\u91CA\u653E\u6280\u80FD\u5F3A\u5316\u7684\u8FDC\u7A0B\u51B2\u51FB\u3002",
    shape: "beast",
    layer: "air",
    range: 5
  },
  {
    id: "killerbee",
    name: "\u6740\u4EBA\u8702",
    cost: 2,
    tags: ["insectoid", "sniper"],
    kind: "buff",
    skill: "\u591A\u6BB5\u8702\u9488",
    description: "\u5F3A\u5316\u8FDE\u7EED\u666E\u653B\u3002",
    shape: "insect",
    layer: "air",
    range: 5
  },
  {
    id: "aircrab",
    name: "\u7A7A\u87F9",
    cost: 1,
    tags: ["marine", "siege"],
    kind: "damage",
    skill: "\u5A01\u80C1\u70AE\u51FB",
    description: "\u70AE\u51FB\u653B\u51FB\u529B\u6700\u9AD8\u7684\u654C\u4EBA\u3002",
    shape: "beast",
    range: 5,
    power: 180
  },
  {
    id: "tank",
    name: "\u6295\u77F3\u8F66",
    cost: 3,
    tags: ["armor", "siege"],
    kind: "buff",
    skill: "\u67B6\u70AE",
    description: "\u67B6\u8D77\u540E\u63D0\u9AD8\u653B\u51FB\u4E0E\u5C04\u7A0B\u3002",
    shape: "mech",
    range: 5
  },
  {
    id: "dragon",
    name: "\u7FD4\u9F99",
    cost: 4,
    tags: ["walker", "siege"],
    kind: "stun",
    skill: "\u7FD4\u9F99\u9707\u8361",
    description: "\u8303\u56F4\u4F24\u5BB3\u5E76\u63A7\u5236\u654C\u4EBA\u3002",
    shape: "beast",
    radius: 2
  },
  {
    id: "ark",
    name: "\u65B9\u821F",
    cost: 4,
    tags: ["airforce", "siege"],
    kind: "summon",
    skill: "\u65E0\u4EBA\u673A\u7FA4",
    description: "\u91CA\u653E\u6301\u7EED\u4F5C\u6218\u7684\u5C0F\u98DE\u673A\u3002",
    shape: "mech",
    layer: "air",
    summonId: "bomber"
  },
  {
    id: "bone_dragon",
    name: "\u9AA8\u9F99",
    cost: 5,
    tags: ["raptor", "immortal", "siege"],
    kind: "stun",
    skill: "\u4EA1\u9AA8\u98CE\u66B4",
    description: "\u5927\u8303\u56F4\u4F24\u5BB3\u5E76\u7729\u6655\u3002",
    shape: "beast",
    layer: "air",
    radius: 3
  },
  {
    id: "whale",
    name: "\u5E7B\u9CB8",
    cost: 5,
    tags: ["marine", "siege"],
    kind: "stun",
    skill: "\u5E7B\u6D77\u6F6E\u6C50",
    description: "\u5927\u8303\u56F4\u6F6E\u6C50\u4F24\u5BB3\u4E0E\u63A7\u5236\u3002",
    shape: "beast",
    layer: "air",
    radius: 3
  },
  {
    id: "eye",
    name: "\u773C\u866B",
    cost: 1,
    tags: ["insectoid", "ability"],
    kind: "stun",
    skill: "\u51DD\u89C6",
    description: "\u538B\u5236\u5E76\u7729\u6655\u5173\u952E\u76EE\u6807\u3002",
    shape: "insect"
  },
  {
    id: "spider",
    name: "\u8718\u86DB",
    cost: 3,
    tags: ["insectoid", "ability"],
    kind: "charm",
    skill: "\u9B45\u60D1\u86DB\u7F51",
    description: "\u5F3A\u5236\u654C\u4EBA\u8F6C\u706B\u5176\u540C\u4F34\u3002",
    shape: "insect",
    radius: 2
  },
  {
    id: "vine",
    name: "\u85E4\u5996",
    cost: 3,
    tags: ["immortal", "ability"],
    kind: "stun",
    skill: "\u7F20\u7ED5",
    description: "\u7F20\u7ED5\u8303\u56F4\u654C\u4EBA\u3002",
    shape: "mystic",
    radius: 2
  },
  {
    id: "eel",
    name: "\u7535\u86DF",
    cost: 4,
    tags: ["marine", "ability"],
    kind: "damage",
    skill: "\u7535\u6D77",
    description: "\u7206\u53D1\u6027\u8303\u56F4\u6280\u80FD\u4F24\u5BB3\u3002",
    shape: "beast",
    radius: 2,
    power: 270
  },
  {
    id: "grenadier",
    name: "\u6295\u5F39\u624B",
    cost: 2,
    tags: ["infantry", "ability"],
    kind: "damage",
    skill: "\u7075\u80FD\u624B\u96F7",
    description: "\u6295\u63B7\u8303\u56F4\u4F24\u5BB3\u624B\u96F7\u3002",
    shape: "soldier",
    radius: 2
  },
  {
    id: "zen_panda",
    name: "\u7985\u5E08\u718A\u732B",
    cost: 4,
    tags: ["panda", "ability"],
    kind: "damage",
    skill: "\u7985\u610F\u7206\u53D1",
    description: "\u91CA\u653E\u5927\u8303\u56F4\u80FD\u91CF\u51B2\u51FB\u3002",
    shape: "panda",
    radius: 3
  },
  {
    id: "toad",
    name: "\u98DE\u5929\u86E4\u87C6",
    cost: 5,
    tags: ["raptor", "ability"],
    kind: "execute",
    skill: "\u541E\u566C",
    description: "\u65A9\u6740\u751F\u547D\u4F4E\u4E8E\u6280\u80FD\u9608\u503C\u7684\u76EE\u6807\u3002",
    shape: "beast",
    layer: "air",
    power: 32
  },
  {
    id: "axe_slave",
    name: "\u65A7\u5974",
    cost: 1,
    tags: ["puppet", "assassin"],
    kind: "damage",
    skill: "\u65CB\u65A7",
    description: "\u77ED\u51B7\u5374\u8FD1\u6218\u65A9\u51FB\u3002",
    shape: "soldier",
    range: 1,
    assassin: true
  },
  {
    id: "pangolin",
    name: "\u7A7F\u5C71\u7532",
    cost: 2,
    tags: ["beast", "assassin"],
    kind: "dash",
    skill: "\u7A7F\u5C71\u7A81\u88AD",
    description: "\u7A81\u8FDB\u540E\u6392\u5E76\u9020\u6210\u4F24\u5BB3\u3002",
    shape: "beast",
    range: 1,
    assassin: true
  },
  {
    id: "osprey",
    name: "\u7075\u9E6B",
    cost: 3,
    tags: ["marine", "assassin"],
    kind: "dash",
    skill: "\u7075\u7A7A\u6251\u6740",
    description: "\u98DE\u8DC3\u5207\u5165\u654C\u65B9\u540E\u6392\u3002",
    shape: "beast",
    layer: "air",
    range: 1,
    assassin: true
  },
  {
    id: "ghost",
    name: "\u5E7D\u7075\u673A",
    cost: 5,
    tags: ["airforce", "assassin"],
    kind: "dash",
    skill: "\u5E7D\u7075\u7A81\u88AD",
    description: "\u9AD8\u901F\u5207\u540E\u5E76\u9020\u6210\u8303\u56F4\u4F24\u5BB3\u3002",
    shape: "mech",
    layer: "air",
    range: 1,
    radius: 2,
    assassin: true
  },
  {
    id: "ninja_panda",
    name: "\u5FCD\u8005\u718A\u732B",
    cost: 4,
    tags: ["panda", "assassin"],
    kind: "damage",
    skill: "\u5F71\u5206\u8EAB\u65A9",
    description: "\u5F00\u5C40\u5145\u80FD\u540E\u5FEB\u901F\u8303\u56F4\u5207\u6740\u3002",
    shape: "panda",
    range: 1,
    radius: 2,
    assassin: true
  },
  {
    id: "iron_chicken",
    name: "\u94C1\u9E21",
    cost: 4,
    tags: ["armor", "assassin"],
    kind: "dash",
    skill: "\u94A2\u7FBD\u7A81\u523A",
    description: "\u88C5\u7532\u7A81\u8FDB\u65A9\u51FB\u3002",
    shape: "mech",
    range: 1,
    assassin: true
  },
  {
    id: "master",
    name: "\u771F\u4EBA",
    cost: 4,
    tags: ["psionic", "puppet", "summoner"],
    kind: "summon",
    skill: "\u5200\u5974\u5E7B\u8C61",
    description: "\u53EC\u5524\u5200\u5974\u5E7B\u8C61\u3002",
    shape: "mystic",
    summonId: "blade_slave"
  },
  {
    id: "wolf",
    name: "\u9B3C\u72FC",
    cost: 2,
    tags: ["beast", "summoner"],
    kind: "summon",
    skill: "\u72FC\u7FA4\u88C2\u9699",
    description: "\u53EC\u5524\u9B3C\u72FC\u534F\u540C\u4F5C\u6218\u3002",
    shape: "beast",
    summonId: "wolf"
  },
  {
    id: "shark",
    name: "\u987B\u5F25\u9CA8",
    cost: 4,
    tags: ["marine", "puppet", "summoner"],
    kind: "summon",
    skill: "\u987B\u5F25\u5316\u8EAB",
    description: "\u53EC\u5524\u6D77\u795E\u5080\u5121\u3002",
    shape: "beast",
    summonId: "shield_slave"
  },
  {
    id: "monk_panda",
    name: "\u6B66\u50E7\u718A\u732B",
    cost: 1,
    tags: ["panda", "vanguard"],
    kind: "shield",
    skill: "\u6B66\u50E7\u67B6\u52BF",
    description: "\u83B7\u5F97\u62A4\u76FE\u5E76\u6301\u7EED\u4F5C\u6218\u3002",
    shape: "panda",
    range: 1
  },
  {
    id: "mammoth",
    name: "\u5DE8\u9F7F\u8C61",
    cost: 2,
    tags: ["beast", "vanguard"],
    kind: "dash",
    skill: "\u5DE8\u8C61\u51B2\u950B",
    description: "\u6CBF\u8DEF\u5F84\u51B2\u950B\u5E76\u7729\u6655\u3002",
    shape: "beast",
    range: 1
  },
  {
    id: "sword_slave",
    name: "\u5251\u5974",
    cost: 2,
    tags: ["puppet", "vanguard"],
    kind: "buff",
    skill: "\u5251\u52BF",
    description: "\u77ED\u65F6\u95F4\u5F3A\u5316\u81EA\u8EAB\u653B\u51FB\u3002",
    shape: "soldier",
    range: 1
  },
  {
    id: "flame",
    name: "\u706B\u7130\u5175",
    cost: 2,
    tags: ["infantry", "vanguard"],
    kind: "poison",
    skill: "\u706B\u7130\u55B7\u5C04",
    description: "\u6301\u7EED\u707C\u70E7\u524D\u65B9\u654C\u4EBA\u3002",
    shape: "soldier",
    range: 2,
    radius: 2
  },
  {
    id: "venom",
    name: "\u731B\u6BD2\u517D",
    cost: 4,
    tags: ["beast", "vanguard"],
    kind: "armorBreak",
    skill: "\u8150\u8680\u5410\u606F",
    description: "\u8303\u56F4\u4F24\u5BB3\u5E76\u964D\u4F4E\u654C\u4EBA\u62A4\u7532\u3002",
    shape: "beast",
    range: 1,
    radius: 2
  },
  {
    id: "blade_slave",
    name: "\u5200\u5974",
    cost: 3,
    tags: ["puppet", "vanguard"],
    kind: "buff",
    skill: "\u72C2\u5203",
    description: "\u5F3A\u5316\u8FD1\u6218\u8FDE\u7EED\u653B\u51FB\u3002",
    shape: "soldier",
    range: 1
  },
  {
    id: "blood_eagle",
    name: "\u8840\u9E70",
    cost: 4,
    tags: ["beast", "raptor", "vanguard"],
    kind: "transform",
    skill: "\u8840\u9E70\u53D8\u8EAB",
    description: "\u5207\u6362\u5F62\u6001\u5E76\u5F3A\u5316\u591A\u6BB5\u653B\u51FB\u3002",
    shape: "beast",
    layer: "air",
    range: 1
  },
  {
    id: "tree",
    name: "\u6811\u5996",
    cost: 5,
    tags: ["immortal", "vanguard"],
    kind: "stun",
    skill: "\u53E4\u6811\u7981\u9522",
    description: "\u5927\u8303\u56F4\u63A7\u5236\u654C\u4EBA\u3002",
    shape: "mystic",
    range: 1,
    radius: 3
  },
  {
    id: "alchemy_tower",
    name: "\u70BC\u91D1\u5854",
    cost: 3,
    tags: ["building", "support"],
    kind: "buff",
    skill: "\u70BC\u91D1\u534F\u8BAE",
    description: "\u65E0\u6CD5\u653B\u51FB\uFF1B\u80DC\u5229\u4E14\u5B58\u6D3B\u65F6\u6309\u661F\u7EA7\u63D0\u4F9B\u91D1\u5E01\u3002",
    shape: "building",
    immobile: true,
    noAttack: true
  },
  {
    id: "divine_tower",
    name: "\u795E\u5A01\u5854",
    cost: 4,
    tags: ["building", "sniper"],
    kind: "silence",
    skill: "\u795E\u5A01\u5C01\u9501",
    description: "\u9501\u5B9A\u653B\u51FB\u6700\u9AD8\u654C\u4EBA\u5E76\u4F7F\u5176\u88C5\u5907\u5931\u6548\u3002",
    shape: "building",
    immobile: true,
    range: 7
  },
  {
    id: "transform_tower",
    name: "\u53D8\u5F62\u5854",
    cost: 4,
    tags: ["building", "blast"],
    kind: "transform",
    skill: "\u7A7A\u5730\u53D8\u5F62",
    description: "\u6309\u654C\u6211\u8DDD\u79BB\u5207\u6362\u7A7A\u5730\u5F62\u6001\u5E76\u5F3A\u5316\u3002",
    shape: "building",
    immobile: true,
    range: 5
  },
  {
    id: "ukyo",
    name: "\u6A58\u53F3\u4EAC",
    cost: 4,
    tags: ["fighter", "assassin"],
    kind: "dash",
    skill: "\u79D8\u5251\u7EC6\u96EA",
    description: "\u7A81\u8FDB\u540E\u8FDE\u7EED\u65A9\u51FB\u3002",
    shape: "fighter",
    range: 1,
    assassin: true
  },
  {
    id: "nakoruru",
    name: "\u5A1C\u53EF\u9732\u9732",
    cost: 4,
    tags: ["fighter", "assassin"],
    kind: "dash",
    skill: "\u98DE\u9E70\u7A81\u88AD",
    description: "\u9AD8\u673A\u52A8\u5207\u5165\u654C\u65B9\u540E\u6392\u3002",
    shape: "fighter",
    range: 1,
    assassin: true
  },
  {
    id: "athena",
    name: "\u9EBB\u5BAB\u96C5\u5178\u5A1C",
    cost: 5,
    tags: ["fighter", "ability"],
    kind: "execute",
    skill: "\u95EA\u5149\u6C34\u6676\u6CE2",
    description: "\u9020\u6210\u771F\u5B9E\u4F24\u5BB3\u5E76\u65A9\u6740\u4F4E\u8840\u76EE\u6807\u3002",
    shape: "fighter",
    power: 28,
    radius: 2
  },
  {
    id: "turtle",
    name: "\u7384\u9F9F",
    cost: 5,
    tags: ["psionic", "guard"],
    kind: "shield",
    skill: "\u7384\u6C34\u7ED3\u754C",
    description: "\u4E3A\u5168\u961F\u63D0\u4F9B\u62A4\u76FE\u5E76\u9707\u6151\u8FD1\u654C\u3002",
    shape: "mystic",
    range: 1,
    radius: 2
  },
  {
    id: "bull",
    name: "\u725B\u9B54\u738B",
    cost: 5,
    tags: ["beast", "guard"],
    kind: "stun",
    skill: "\u64BC\u5730\u6012\u543C",
    description: "\u627F\u4F24\u5E76\u5927\u8303\u56F4\u63A7\u5236\u654C\u4EBA\u3002",
    shape: "beast",
    range: 1,
    radius: 3
  },
  {
    id: "buddha",
    name: "\u6597\u6218\u80DC\u4F5B",
    cost: 5,
    tags: ["vanguard"],
    kind: "damage",
    skill: "\u6597\u6218\u6A2A\u626B",
    description: "\u9AD8\u9636\u5148\u950B\u8303\u56F4\u6A2A\u626B\u3002",
    shape: "fighter",
    range: 1,
    radius: 3,
    power: 300
  }
];
var colors = {
  infantry: 7915696,
  cavalry: 13212517,
  armor: 10136248,
  airforce: 7720942,
  puppet: 12163698,
  psionic: 11441368,
  walker: 14660463,
  marine: 6798036,
  beast: 15055215,
  raptor: 12480909,
  insectoid: 9095263,
  immortal: 8356518,
  panda: 15326928,
  building: 8561832,
  fighter: 15232604
};
function effects(row) {
  if (row.id === "alchemy_tower")
    return [{ trigger: "victory", target: "self", kind: "gold", value: 1 }];
  if (row.id === "burstbug")
    return [
      {
        trigger: "death",
        target: "areaEnemies",
        kind: "skillDamage",
        value: row.deathBurst ?? 130,
        radius: 1
      }
    ];
  const target = row.id === "child" || row.id === "turtle" ? "allAllies" : row.kind === "heal" || row.id === "repair" ? "lowestHealthAlly" : row.kind === "shield" ? "self" : row.id === "aircrab" || row.id === "divine_tower" ? "highestAttackEnemy" : "areaEnemies";
  const kind = {
    damage: "skillDamage",
    heal: "heal",
    shield: "shield",
    stun: "stun",
    poison: "poison",
    summon: "summon",
    dash: "dash",
    buff: "attack",
    charm: "taunt",
    execute: "execute",
    silence: "disableItems",
    armorBreak: "armor",
    transform: "transform"
  }[row.kind];
  const actualKind = row.id === "child" ? "energy" : kind;
  return [
    {
      trigger: "cast",
      target,
      kind: actualKind,
      value: row.power ?? 80 + row.cost * 45,
      duration: row.duration ?? 35,
      radius: row.radius ?? 1,
      summonId: row.summonId
    }
  ];
}
var UNITS = rows.map((row, index) => {
  const ranged = row.range ?? (row.tags.includes("guard") || row.tags.includes("vanguard") || row.tags.includes("assassin") ? 1 : row.tags.includes("sniper") || row.tags.includes("siege") ? 5 : 3);
  const attackTiming = {
    windupTicks: 4,
    travelTicks: ranged > 1 ? 3 + index % 3 : 0,
    recoveryTicks: 4
  };
  const skillTiming = {
    windupTicks: 5 + row.cost,
    travelTicks: ranged > 1 ? 2 + index % 5 : 0,
    recoveryTicks: 4 + index % 4
  };
  return {
    id: row.id,
    name: row.name,
    cost: row.cost,
    poolCount: RULES.poolByCost[row.cost - 1],
    tags: row.tags,
    hp: 260 + row.cost * 95 + (row.tags.includes("guard") || row.tags.includes("vanguard") ? 160 : 0),
    attack: 30 + row.cost * 14,
    armor: row.tags.includes("guard") ? 8 : row.tags.includes("blast") ? 3 : 4,
    range: ranged,
    attackTicks: row.tags.includes("sniper") ? 17 : 23,
    attackTiming,
    moveTicks: 7,
    layer: row.layer ?? "ground",
    targets: ["ground", "air"],
    skill: {
      name: row.skill,
      description: row.description,
      kind: row.kind,
      power: row.power ?? 80 + row.cost * 45,
      radius: row.radius ?? 1,
      duration: row.duration ?? (row.kind === "poison" ? 80 : 35),
      cooldown: 100,
      timing: skillTiming,
      effects: effects(row)
    },
    assassin: row.assassin,
    deathBurst: row.deathBurst,
    immobile: row.immobile,
    noAttack: row.noAttack,
    summonId: row.summonId,
    shape: row.shape,
    color: colors[row.tags[0]] ?? 10268853,
    combatVisual: {
      attack: `${row.id}-attack`,
      skill: `${row.id}-${row.kind}`,
      primary: colors[row.tags[0]] ?? 10268853,
      secondary: 16766852 - index % 8 * 525828
    }
  };
});
var UNIT_BY_ID = Object.fromEntries(UNITS.map((unit) => [unit.id, unit]));
var UNIT_IDS = rows.map((row) => row.id);
var COMBAT_VISUALS = Object.fromEntries(
  UNITS.map((unit) => [
    unit.id,
    {
      attackTiming: unit.attackTiming,
      skillTiming: unit.skill.timing,
      combatVisual: unit.combatVisual
    }
  ])
);

// src/content/index.ts
var CONTENT_HASH = hashValue({ RULES, UNITS, SYNERGIES, ITEMS, PLACEMENT_LIMITS });
function saleValue(unit) {
  const cost = UNIT_BY_ID[unit.defId].cost;
  return unit.star === 1 ? cost : Math.max(1, Math.floor(cost * unit.copies * RULES.salePercent / 100));
}
function validateContent() {
  if (UNITS.length !== 62 || new Set(UNIT_IDS).size !== 62)
    throw new Error("Expected 62 unique units");
  if (SYNERGIES.length !== 24 || ITEMS.length !== 10) throw new Error("Incomplete content catalog");
  for (const row of RULES.shopOdds)
    if (row.length !== 5 || row.some((n) => n < 0) || row.reduce((a, b) => a + b, 0) !== 100)
      throw new Error("Invalid shop odds");
  for (const [index, value] of RULES.experience.entries())
    if (index && value <= RULES.experience[index - 1]) throw new Error("Invalid XP thresholds");
  for (const unit of UNITS) {
    if (unit.cost < 1 || unit.cost > 5 || unit.hp <= 0 || unit.tags.some((tag) => !SYNERGIES.some((s) => s.id === tag)))
      throw new Error(`Invalid unit ${unit.id}`);
    if (!unit.skill.effects.length || unit.skill.effects.some((effect) => effect.summonId && !UNIT_BY_ID[effect.summonId]))
      throw new Error(`Invalid effects ${unit.id}`);
    if (unit.attackTiming.windupTicks + unit.attackTiming.travelTicks + unit.attackTiming.recoveryTicks > unit.attackTicks || unit.skill.timing.windupTicks + unit.skill.timing.travelTicks + unit.skill.timing.recoveryTicks > unit.skill.cooldown)
      throw new Error(`Invalid timing ${unit.id}`);
  }
  if (new Set(UNITS.map((unit) => unit.combatVisual.attack)).size !== 62 || new Set(UNITS.map((unit) => unit.combatVisual.skill)).size !== 62)
    throw new Error("Combat visuals must be unique");
  for (const synergy2 of SYNERGIES)
    if (synergy2.thresholds.length !== synergy2.values.length)
      throw new Error(`Invalid synergy ${synergy2.id}`);
  if (new Set(ITEMS.map((item2) => item2.id)).size !== 10) throw new Error("Duplicate item IDs");
  for (const item2 of ITEMS)
    if (!item2.effects.length || [item2.attack, item2.hp, item2.armor, item2.haste, item2.lifesteal, item2.skillBonus].some(
      (value) => !Number.isFinite(value) || value < 0
    ))
      throw new Error(`Invalid item ${item2.id}`);
  for (let cost = 1; cost <= 5; cost++)
    if (!UNITS.some((unit) => unit.cost === cost)) throw new Error(`Missing cost ${cost}`);
}

// src/rules/game.ts
function createGame(seed = 20260914) {
  return {
    rulesetId: RULES.id,
    contentHash: CONTENT_HASH,
    simulationVersion: RULES.simulationVersion,
    seed,
    phase: "waiting",
    round: 0,
    deadline: 0,
    playbackEpoch: 0,
    players: {},
    teams: {},
    units: {},
    pool: Object.fromEntries(UNITS.map((u) => [u.id, u.poolCount])),
    nextUnit: 1,
    battles: [],
    results: {},
    settledRound: 0,
    receipts: {},
    rewardRng: deriveSeed(seed, "rewards"),
    error: null,
    lastSummary: [],
    botCursor: 0
  };
}
function addPlayer(state, id, name, teamId, seat, bot = false) {
  if (state.players[id]) return;
  if (!state.teams[teamId])
    state.teams[teamId] = {
      id: teamId,
      name: teamId === "team-0" ? "\u5171\u751F\u5C0F\u961F" : `\u8FDC\u5F81\u961F ${Number(teamId.split("-")[1]) + 1}`,
      players: [],
      hp: 100,
      wins: 0,
      eliminatedRound: null,
      lastOpponent: null,
      rank: null
    };
  state.teams[teamId].players.push(id);
  state.players[id] = {
    id,
    name,
    teamId,
    seat,
    bot,
    gold: 0,
    level: 1,
    exp: 0,
    shop: Array(5).fill(null),
    shopVersion: 0,
    shopLocked: false,
    shopRng: deriveSeed(state.seed, `shop:${id}`),
    streak: 0,
    items: [],
    ready: false,
    demand: null,
    botMemory: {
      template: deriveSeed(state.seed, `template:${id}`) % 24,
      commands: 0,
      refreshes: 0,
      serial: 0,
      log: []
    }
  };
}
function playerUnits(s, id) {
  return Object.values(s.units).filter((u) => u.ownerId === id);
}
function teamUnits(s, id) {
  return Object.values(s.units).filter((u) => u.teamId === id);
}
function baseIncome(round) {
  return RULES.earlyIncome[round - 1] ?? RULES.baseIncome;
}
function isNeutral(round) {
  return round <= 3 || round >= 10 && round % 5 === 0;
}
function addXp(p, amount) {
  p.exp = Math.min(RULES.experience[RULES.maxLevel - 1], p.exp + amount);
  while (p.level < RULES.maxLevel && p.exp >= RULES.experience[p.level]) p.level++;
}
function returnShop(s, p) {
  for (const id of p.shop) if (id) s.pool[id]++;
  p.shop = Array(5).fill(null);
}
function refreshShop(s, p) {
  returnShop(s, p);
  const odds = RULES.shopOdds[p.level - 1];
  for (let slot = 0; slot < 5; slot++) {
    p.shopRng = nextRandom(p.shopRng);
    let roll = p.shopRng % 100, cost = 1;
    for (let i = 0; i < 5; i++) {
      if (roll < odds[i]) {
        cost = i + 1;
        break;
      }
      roll -= odds[i];
    }
    const candidates = UNITS.filter((u) => u.cost === cost && s.pool[u.id] > 0);
    const total = candidates.reduce((n, u) => n + s.pool[u.id], 0);
    if (!total) continue;
    p.shopRng = nextRandom(p.shopRng);
    let pick = p.shopRng % total;
    for (const u of candidates) {
      if (pick < s.pool[u.id]) {
        s.pool[u.id]--;
        p.shop[slot] = u.id;
        break;
      }
      pick -= s.pool[u.id];
    }
  }
  p.shopVersion++;
}
function firstBench(s, id) {
  const used = playerUnits(s, id).filter((u) => u.position.zone === "bench").map((u) => u.position.slot);
  for (let i = 0; i < RULES.benchSize; i++) if (!used.includes(i)) return i;
  return -1;
}
var sellValue = saleValue;
function insectLevel(s, teamId) {
  return new Set(
    teamUnits(s, teamId).filter(
      (unit) => unit.position.zone === "board" && UNIT_BY_ID[unit.defId].tags.includes("insectoid")
    ).map((unit) => unit.defId)
  ).size;
}
function mergeUnits(s, p) {
  let changed = true;
  while (changed) {
    changed = false;
    const units = playerUnits(s, p.id).sort(
      (a, b) => (a.position.zone === "public" ? 0 : a.position.zone === "board" ? 1 : 2) - (b.position.zone === "public" ? 0 : b.position.zone === "board" ? 1 : 2) || (a.position.zone === "public" && b.position.zone === "public" ? a.position.slot - b.position.slot : 0) || compareId(a.id, b.id)
    );
    for (const keeper of units) {
      if (keeper.star >= 3) continue;
      const insects = insectLevel(s, p.teamId), fastMerge = UNIT_BY_ID[keeper.defId].tags.includes("insectoid") && (keeper.star === 1 && insects >= 2 || keeper.star === 2 && insects >= 4), required = fastMerge ? 2 : 3;
      const group = units.filter((u) => u.defId === keeper.defId && u.star === keeper.star).slice(0, required);
      if (group.length < required) continue;
      const allItems = group.flatMap((u) => u.items);
      keeper.copies = group.reduce((n, u) => n + u.copies, 0);
      keeper.star++;
      keeper.items = allItems.slice(0, RULES.itemSlots);
      p.items.push(...allItems.slice(RULES.itemSlots));
      keeper.version++;
      for (const u of group) if (u.id !== keeper.id) delete s.units[u.id];
      changed = true;
      break;
    }
  }
}
function reject(message) {
  throw new Error(message);
}
function mutate(s, p, c) {
  if (s.phase !== "prep") reject("\u4EC5\u51C6\u5907\u9636\u6BB5\u53EF\u64CD\u4F5C");
  if (s.teams[p.teamId].hp <= 0) reject("\u961F\u4F0D\u5DF2\u6DD8\u6C70");
  if (c.round !== s.round) reject("\u56DE\u5408\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u8BD5");
  if (c.type === "ready") {
    p.ready = !p.ready;
    return;
  }
  if (c.type === "demand") {
    if (c.defId !== null && !UNITS.some((u2) => u2.id === c.defId)) reject("\u672A\u77E5\u68CB\u5B50");
    p.demand = c.defId ?? null;
    return;
  }
  if (c.type === "lock") {
    p.shopLocked = !p.shopLocked;
    return;
  }
  if (c.type === "refresh") {
    if (p.gold < RULES.refreshCost) reject("\u91D1\u5E01\u4E0D\u8DB3");
    p.gold -= RULES.refreshCost;
    refreshShop(s, p);
    return;
  }
  if (c.type === "xp") {
    if (p.gold < RULES.xpCost) reject("\u91D1\u5E01\u4E0D\u8DB3");
    if (p.level === RULES.maxLevel) reject("\u5DF2\u8FBE\u6700\u9AD8\u7B49\u7EA7");
    p.gold -= RULES.xpCost;
    addXp(p, RULES.xpGain);
    return;
  }
  if (c.type === "buy") {
    if (c.shopVersion !== p.shopVersion) reject("\u5546\u5E97\u5DF2\u53D8\u5316");
    if (!Number.isInteger(c.slot) || c.slot < 0 || c.slot > 4) reject("\u8D27\u67B6\u4F4D\u7F6E\u65E0\u6548");
    const defId = p.shop[c.slot];
    if (!defId) reject("\u8BE5\u68CB\u5B50\u5DF2\u552E\u51FA");
    const def = UNIT_BY_ID[defId];
    if (p.gold < def.cost) reject("\u91D1\u5E01\u4E0D\u8DB3");
    p.gold -= def.cost;
    p.shop[c.slot] = null;
    p.shopVersion++;
    const id = `u${String(s.nextUnit++).padStart(6, "0")}`;
    s.units[id] = {
      id,
      defId,
      ownerId: p.id,
      teamId: p.teamId,
      star: 1,
      copies: 1,
      version: 0,
      position: { zone: "bench", slot: firstBench(s, p.id) },
      items: []
    };
    mergeUnits(s, p);
    const overflow = playerUnits(s, p.id).find(
      (u2) => u2.position.zone === "bench" && u2.position.slot === -1
    );
    if (overflow) {
      const slot = firstBench(s, p.id);
      if (slot < 0) reject("\u5907\u6218\u533A\u5DF2\u6EE1");
      overflow.position = { zone: "bench", slot };
    }
    return;
  }
  const u = s.units[c.unitId ?? ""];
  if (!u || u.teamId !== p.teamId) reject("\u68CB\u5B50\u4E0D\u5B58\u5728\u6216\u4E0D\u5C5E\u4E8E\u672C\u961F");
  if (c.unitVersion !== u.version) reject("\u68CB\u5B50\u5DF2\u88AB\u79FB\u52A8\u6216\u5408\u6210");
  if (c.type === "sell") {
    if (u.ownerId !== p.id || u.position.zone === "public") reject("\u53EA\u80FD\u51FA\u552E\u81EA\u5DF1\u7684\u975E\u516C\u5171\u533A\u68CB\u5B50");
    p.gold += sellValue(u);
    p.items.push(...u.items);
    s.pool[u.defId] += u.copies;
    delete s.units[u.id];
    return;
  }
  if (c.type === "equip") {
    if (u.ownerId !== p.id || u.position.zone === "public") reject("\u53EA\u80FD\u88C5\u5907\u81EA\u5DF1\u7684\u975E\u516C\u5171\u533A\u68CB\u5B50");
    if (!Number.isInteger(c.itemSlot) || c.itemSlot < 0 || c.itemSlot >= p.items.length)
      reject("\u88C5\u5907\u4E0D\u5B58\u5728");
    if (u.items.length >= RULES.itemSlots) reject("\u88C5\u5907\u69FD\u5DF2\u6EE1");
    if (p.items[c.itemSlot] !== c.itemId) reject("\u88C5\u5907\u80CC\u5305\u5DF2\u53D8\u5316");
    u.items.push(p.items.splice(c.itemSlot, 1)[0]);
    u.version++;
    return;
  }
  if (c.type === "move" || c.type === "swap") {
    const decision = assessPlacement(
      s,
      p.id,
      {
        kind: c.type,
        unitId: u.id,
        unitVersion: c.unitVersion,
        position: c.position,
        benchOwnerId: c.benchOwnerId,
        targetId: c.targetId,
        targetVersion: c.targetVersion
      },
      PLACEMENT_LIMITS
    );
    if (!decision.ok) reject(decision.reason);
    if (c.type === "swap") {
      const target = s.units[c.targetId];
      const old = u.position;
      u.position = target.position;
      target.position = old;
      u.version++;
      target.version++;
      for (const id of s.teams[p.teamId].players) mergeUnits(s, s.players[id]);
      return;
    }
    const pos = c.position;
    u.ownerId = decision.ownerId;
    u.position = pos.zone === "board" ? { zone: "board", x: pos.x, y: pos.y } : { zone: pos.zone, slot: pos.slot };
    u.version++;
    for (const id of s.teams[p.teamId].players) mergeUnits(s, s.players[id]);
    return;
  }
  reject("\u672A\u77E5\u6307\u4EE4");
}
function applyCommand(s, actor, input) {
  const c = input;
  const id = typeof c?.commandId === "string" ? c.commandId : "";
  if (!id || id.length > 100) return { commandId: id, ok: false, reason: "\u6307\u4EE4\u7F16\u53F7\u65E0\u6548" };
  if (!s.players[actor]) return { commandId: id, ok: false, reason: "\u65E0\u64CD\u4F5C\u5E2D\u4F4D" };
  const old = s.receipts[actor]?.find((r) => r.commandId === id);
  if (old) return old;
  let result;
  try {
    const draft = structuredClone(s);
    mutate(draft, draft.players[actor], c);
    Object.assign(s, draft);
    result = { commandId: id, ok: true, reason: "" };
  } catch (e) {
    result = { commandId: id, ok: false, reason: e instanceof Error ? e.message : "\u65E0\u6548\u6307\u4EE4" };
  }
  const receipts = s.receipts[actor] ??= [];
  receipts.push(result);
  if (receipts.length > 64) receipts.splice(0, receipts.length - 64);
  return result;
}
function grantRoundIncome(p, round, outcome, neutral) {
  if (!neutral) {
    if (outcome === "win") p.gold++;
    p.streak = outcome === "draw" ? 0 : outcome === "win" ? Math.max(0, p.streak) + 1 : Math.min(0, p.streak) - 1;
    const streak = Math.abs(p.streak);
    p.gold += RULES.streakRewards.reduce(
      (reward, [threshold, value]) => streak >= threshold ? value : reward,
      0
    );
  }
  p.gold += Math.min(RULES.interestCap, Math.floor(p.gold / RULES.interestStep));
  p.gold += baseIncome(round + 1);
}
function grantLoot(s, p) {
  s.rewardRng = nextRandom(s.rewardRng);
  if (s.rewardRng % 100 >= RULES.neutralDropChance) return;
  s.rewardRng = nextRandom(s.rewardRng);
  p.items.push(ITEMS[s.rewardRng % ITEMS.length].id);
}

// src/bots/planner.ts
var TEMPLATES = [
  ["\u6B65\u5175\u4EA4\u53C9\u706B\u529B", "infantry", "guard", "sniper"],
  ["\u9A91\u5175\u7206\u7834", "cavalry", "blast", "sniper"],
  ["\u88C5\u7532\u70AE\u9635", "armor", "guard", "siege"],
  ["\u7A7A\u519B\u7A81\u88AD", "airforce", "blast", "assassin"],
  ["\u5080\u5121\u519B\u56E2", "puppet", "vanguard", "summoner"],
  ["\u7075\u80FD\u5171\u632F", "psionic", "blast", "support"],
  ["\u9646\u884C\u771F\u4F24", "walker", "guard", "sniper"],
  ["\u6D77\u795E\u653B\u57CE", "marine", "guard", "siege"],
  ["\u91CE\u517D\u5171\u751F", "beast", "guard", "vanguard"],
  ["\u731B\u79BD\u5236\u5730", "raptor", "sniper", "ability"],
  ["\u5F02\u866B\u901F\u5347", "insectoid", "blast", "ability"],
  ["\u4E0D\u673D\u63A7\u5236", "immortal", "ability", "vanguard"],
  ["\u718A\u732B\u5F00\u5927", "panda", "ability", "assassin"],
  ["\u62A4\u536B\u58C1\u5792", "guard", "support", "sniper"],
  ["\u7206\u7834\u6D2A\u6D41", "blast", "armor", "ability"],
  ["\u652F\u63F4\u7EED\u822A", "support", "beast", "guard"],
  ["\u72D9\u51FB\u7A7F\u7532", "sniper", "infantry", "cavalry"],
  ["\u653B\u57CE\u91CD\u70AE", "siege", "armor", "marine"],
  ["\u5F02\u80FD\u538B\u5236", "ability", "psionic", "blast"],
  ["\u523A\u6740\u5207\u540E", "assassin", "airforce", "beast"],
  ["\u53EC\u5524\u6D6A\u6F6E", "summoner", "puppet", "beast"],
  ["\u5148\u950B\u518D\u751F", "vanguard", "beast", "puppet"],
  ["\u5EFA\u7B51\u5DE5\u4E8B", "building", "support", "sniper"],
  ["\u683C\u6597\u6781\u9650", "fighter", "assassin", "ability"]
].map(([name, race, ...jobs]) => ({ name, race, jobs }));
function strength(u) {
  return UNIT_BY_ID[u.defId].cost + u.star * 5;
}
function position(s, p, u) {
  const def = UNIT_BY_ID[u.defId], front = def.range <= 1 || def.tags.includes("guard");
  const occupied2 = teamUnits(s, p.teamId).filter((u2) => u2.position.zone === "board").map((u2) => u2.position.zone === "board" ? `${u2.position.x},${u2.position.y}` : "");
  const enemy = s.teams[p.teamId].lastOpponent;
  const threats = enemy ? teamUnits(s, enemy).filter((u2) => u2.position.zone === "board") : [];
  const scatter = threats.filter((u2) => UNIT_BY_ID[u2.defId].tags.includes("blast")).length >= 2;
  const xs = p.seat === 0 ? [1, 3, 0, 2, 4] : [8, 6, 9, 7, 5];
  const ys = front ? [5, 6, 7, 8, 9] : scatter ? [8, 6, 9, 7, 5] : [8, 9, 7, 6, 5];
  for (const y of ys)
    for (const x of xs) if (!occupied2.includes(`${x},${y}`)) return { zone: "board", x, y };
  return null;
}
function planBotActions(s, p) {
  if (s.phase !== "prep" || s.teams[p.teamId].hp <= 0 || p.botMemory.commands >= RULES.botCommandBudget)
    return null;
  const memory = p.botMemory, template = TEMPLATES[memory.template], owned = playerUnits(s, p.id), board = owned.filter((u) => u.position.zone === "board");
  const wrap = (type, data, reason) => ({
    command: {
      commandId: `bot:${s.round}:${p.id}:${memory.serial}`,
      round: s.round,
      type,
      ...data
    },
    reason
  });
  const move = (u, pos, reason) => wrap("move", { unitId: u.id, unitVersion: u.version, position: pos }, reason);
  const waiting = owned.filter((u) => u.position.zone === "bench").sort((a, b) => strength(b) - strength(a));
  if (board.length < p.level && waiting.length) {
    const pos = position(s, p, waiting[0]);
    if (pos) return move(waiting[0], pos, "\u8865\u8DB3\u4EBA\u53E3\uFF1A\u90E8\u7F72\u6700\u9AD8\u6218\u529B");
  }
  if (waiting.length && board.length >= p.level) {
    const weakest = [...board].sort((a, b) => strength(a) - strength(b))[0];
    const slot2 = firstBench(s, p.id);
    if (weakest && slot2 >= 0 && strength(waiting[0]) > strength(weakest))
      return move(weakest, { zone: "bench", slot: slot2 }, "\u66FF\u6362\u4F4E\u6218\u529B\u68CB\u5B50");
  }
  if (p.items.length && board.some((u) => u.items.length < 3)) {
    const target = [...board].filter((u) => u.items.length < 3).sort((a, b) => strength(b) - strength(a))[0];
    return wrap(
      "equip",
      { unitId: target.id, unitVersion: target.version, itemSlot: 0, itemId: p.items[0] },
      "\u5C06\u88C5\u5907\u4EA4\u7ED9\u573A\u4E0A\u6838\u5FC3"
    );
  }
  const slot = firstBench(s, p.id);
  const publicUnits = teamUnits(s, p.teamId).filter(
    (u) => u.position.zone === "public" && u.ownerId !== p.id
  );
  const claim = publicUnits.find(
    (u) => owned.some((v) => v.defId === u.defId) || UNIT_BY_ID[u.defId].tags.includes(template.race)
  );
  if (claim && slot >= 0) return move(claim, { zone: "bench", slot }, "\u9886\u53D6\u961F\u53CB\u4EA4\u4ED8\u7684\u9635\u5BB9\u68CB\u5B50");
  const mate = s.players[s.teams[p.teamId].players.find((id) => id !== p.id)];
  const transfer = waiting.find(
    (u) => mate?.demand === u.defId && !owned.some((v) => v.id !== u.id && v.defId === u.defId)
  );
  const freePublic = [0, 1, 2, 3].find(
    (n) => !teamUnits(s, p.teamId).some((u) => u.position.zone === "public" && u.position.slot === n)
  );
  if (transfer && freePublic !== void 0)
    return move(transfer, { zone: "public", slot: freePublic }, "\u54CD\u5E94\u961F\u53CB\u5BF9\u5B50\u9700\u6C42");
  const pressure = s.teams[p.teamId].hp < 35, reserve = pressure ? 0 : s.round < 10 ? 5 : Math.min(50, (s.round - 5) * 3);
  if (p.level < 8 && p.gold >= 5 && p.gold - 5 >= reserve && p.level < Math.min(8, 2 + Math.floor(s.round / 3)))
    return wrap("xp", {}, "\u6309\u56DE\u5408\u62C9\u4EBA\u53E3\uFF0C\u4FDD\u7559\u7ECF\u6D4E\u5E95\u7EBF");
  const choices = p.shop.flatMap((id, index) => {
    if (!id) return [];
    const def = UNIT_BY_ID[id];
    if (p.gold < def.cost) return [];
    const copies = owned.filter((u) => u.defId === id && u.position.zone !== "public");
    const score = (def.tags.includes(template.race) ? 9 : 0) + (def.tags.includes(template.jobs[p.seat]) ? 4 : 0) + copies.length * 5 + (board.length < p.level ? 8 : 0) + def.cost + (mate?.demand === id ? 5 : 0);
    return [{ index, score, id }];
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  if (choices.length && (slot >= 0 || owned.filter((u) => u.defId === choices[0].id && u.star === 1 && u.position.zone !== "public").length >= 2) && choices[0].score >= 8)
    return wrap(
      "buy",
      { slot: choices[0].index, shopVersion: p.shopVersion },
      `\u8D2D\u4E70 ${UNIT_BY_ID[choices[0].id].name}\uFF1A\u9635\u5BB9/\u5BF9\u5B50\u8BC4\u5206 ${choices[0].score}`
    );
  if (slot < 0) {
    const junk = waiting.filter((u) => !UNIT_BY_ID[u.defId].tags.includes(template.race)).sort((a, b) => strength(a) - strength(b))[0];
    if (junk)
      return wrap("sell", { unitId: junk.id, unitVersion: junk.version }, "\u6E05\u7406\u504F\u79BB\u9635\u5BB9\u7684\u5907\u6218\u68CB\u5B50");
  }
  if (slot >= 0 && p.gold >= reserve + 2 && memory.refreshes < RULES.botRefreshBudget)
    return wrap("refresh", {}, pressure ? "\u4F4E\u751F\u547D\u641C\u724C\u4FDD\u547D" : "\u9884\u7B97\u5185\u5237\u65B0\u5BFB\u627E\u9635\u5BB9\u6838\u5FC3");
  return null;
}
function advanceBots(s, includeHumans = false) {
  const players = Object.values(s.players).filter(
    (p) => (p.bot || includeHumans) && s.teams[p.teamId].hp > 0
  );
  if (!players.length) return false;
  for (let attempts = 0; attempts < players.length; attempts++) {
    const p = players[s.botCursor++ % players.length];
    const owned = playerUnits(s, p.id).filter((u) => u.position.zone !== "public");
    const demand = owned.find(
      (u) => owned.filter((v) => v.defId === u.defId && v.star === u.star).length === 2
    );
    p.demand = demand?.defId ?? null;
    const planned = planBotActions(s, p);
    if (!planned) continue;
    const id = p.id;
    const result = applyCommand(s, id, planned.command);
    const current = s.players[id];
    current.botMemory.commands++;
    current.botMemory.serial++;
    if (planned.command.type === "refresh" && result.ok) current.botMemory.refreshes++;
    current.botMemory.log.push(
      `${s.round}: ${planned.reason}${result.ok ? "" : ` [${result.reason}]`}`
    );
    current.botMemory.log = current.botMemory.log.slice(-6);
    return true;
  }
  return false;
}
function resetBotRound(s) {
  s.botCursor = deriveSeed(s.seed, `bot-order:${s.round}`) % 16;
  for (const p of Object.values(s.players)) {
    p.botMemory.commands = 0;
    p.botMemory.refreshes = 0;
  }
}

// src/match/lifecycle.ts
function startMatch(s) {
  if (s.phase !== "waiting" || Object.values(s.players).filter((p) => !p.bot).length !== 2)
    throw new Error("\u9700\u8981\u4E24\u4F4D\u73A9\u5BB6");
  for (let team = 1; team < 8; team++)
    for (let seat = 0; seat < 2; seat++)
      addPlayer(
        s,
        `bot-${team}-${seat}`,
        `\u673A\u5E08 ${team}${seat ? "B" : "A"}`,
        `team-${team}`,
        seat,
        true
      );
  for (const p of Object.values(s.players)) p.gold = baseIncome(1);
  beginRound(s);
}
function beginRound(s) {
  s.round++;
  s.phase = "prep";
  s.battles = [];
  s.results = {};
  s.error = null;
  for (const p of Object.values(s.players)) {
    p.ready = false;
    if (s.teams[p.teamId].hp <= 0) continue;
    addXp(p, 1);
    if (!p.shopLocked) refreshShop(s, p);
  }
  resetBotRound(s);
}
function lineup(s, team) {
  return teamUnits(s, team).filter((u) => u.position.zone === "board").sort((a, b) => compareId(a.id, b.id)).map((u) => ({
    id: u.id,
    defId: u.defId,
    ownerId: u.ownerId,
    star: u.star,
    x: u.position.zone === "board" ? u.position.x : 0,
    y: u.position.zone === "board" ? u.position.y : 0,
    items: [...u.items]
  }));
}
function neutralUnits(round) {
  const count = round <= 3 ? round : Math.min(16, 3 + Math.floor(round / 3));
  const star = Math.min(3, 1 + Math.floor(round / 18));
  return Array.from({ length: count }, (_, i) => ({
    id: `wild-${i}`,
    defId: round < 10 ? "dog" : i % 3 === 0 ? "venom" : i % 3 === 1 ? "wolf" : "ape",
    ownerId: "wild",
    star,
    x: 1 + i % 8,
    y: 5 + Math.floor(i / 8),
    items: []
  }));
}
function freezeBattles(s) {
  if (s.phase !== "prep") throw new Error("Not preparing");
  const teams = Object.values(s.teams).filter((t) => t.hp > 0).map((t) => t.id).sort(
    (a, b) => deriveSeed(s.seed, `${s.round}:${a}`) - deriveSeed(s.seed, `${s.round}:${b}`) || compareId(a, b)
  );
  const pairs = [];
  const neutral = isNeutral(s.round);
  if (neutral) for (const a of teams) pairs.push({ a, b: "wild", mirror: false });
  else {
    const remaining = [...teams];
    while (remaining.length > 1) {
      const a = remaining.shift();
      let index = remaining.findIndex((b2) => b2 !== s.teams[a].lastOpponent);
      if (index < 0) index = 0;
      const b = remaining.splice(index, 1)[0];
      pairs.push({ a, b, mirror: false });
    }
    if (remaining.length) {
      const a = remaining[0];
      const b = teams.find((b2) => b2 !== a && b2 !== s.teams[a].lastOpponent) ?? teams.find((b2) => b2 !== a);
      if (b) pairs.push({ a, b, mirror: true });
    }
  }
  s.battles = pairs.map(({ a, b, mirror }, i) => {
    const id = `r${s.round}-b${i}`;
    const sides = [
      lineup(s, a),
      neutral ? neutralUnits(s.round) : lineup(s, b)
    ];
    for (const [side, units] of sides.entries())
      for (const u of units) {
        u.id = `${id}:${side}:${u.id}`;
        if (side === 1) {
          u.x = 9 - u.x;
          u.y = 9 - u.y;
        }
      }
    return {
      id,
      round: s.round,
      seed: deriveSeed(s.seed, id),
      rulesetId: s.rulesetId,
      contentHash: s.contentHash,
      simulationVersion: s.simulationVersion,
      teams: [a, b],
      mirror,
      neutral,
      sides
    };
  }).sort(
    (a, b) => (a.teams.includes("team-0") ? 0 : 1) - (b.teams.includes("team-0") ? 0 : 1) || compareId(a.id, b.id)
  );
  s.phase = "battle";
  s.playbackEpoch++;
  return s.battles;
}
function commitBattleResults(s, results) {
  for (const r of results) {
    if (!s.battles.some((b) => b.id === r.id)) throw new Error("Unknown battle result");
    const old = s.results[r.id];
    if (old && old.hash !== r.hash) throw new Error("Conflicting result");
    s.results[r.id] = r;
  }
}
function rankTeams(s) {
  const teams = Object.values(s.teams).sort(
    (a, b) => (b.hp > 0 ? 1 : 0) - (a.hp > 0 ? 1 : 0) || (b.eliminatedRound ?? s.round + 1) - (a.eliminatedRound ?? s.round + 1) || b.hp - a.hp || b.wins - a.wins || deriveSeed(s.seed, a.id) - deriveSeed(s.seed, b.id)
  );
  teams.forEach((t, i) => t.rank = i + 1);
}
function settleRound(s) {
  if (s.settledRound === s.round) return;
  if (s.phase !== "battle" || s.battles.some((b) => !s.results[b.id]))
    throw new Error("Incomplete round results");
  const draft = structuredClone(s);
  draft.lastSummary = [];
  for (const battle of draft.battles) {
    const result = draft.results[battle.id];
    for (const side of [0, 1]) {
      if (side === 1 && (battle.neutral || battle.mirror)) continue;
      const team = draft.teams[battle.teams[side]], outcome = result.winner === null ? "draw" : result.winner === side ? "win" : "loss";
      team.hp = Math.max(0, team.hp - result.damage[side]);
      if (outcome === "win" && !battle.neutral) team.wins++;
      if (!battle.neutral) team.lastOpponent = battle.teams[side === 0 ? 1 : 0];
      draft.lastSummary.push(
        `${team.name} ${outcome === "win" ? "\u83B7\u80DC" : outcome === "draw" ? "\u5E73\u5C40" : "\u843D\u8D25"}${result.damage[side] ? ` \xB7 -${result.damage[side]} \u751F\u547D` : ""}`
      );
      if (outcome === "win") {
        for (const unit of battle.sides[side])
          if (unit.defId === "alchemy_tower" && result.survivors.includes(unit.id)) {
            draft.players[unit.ownerId].gold += unit.star;
            draft.lastSummary.push(`${draft.players[unit.ownerId].name} \u7684\u70BC\u91D1\u5854 +${unit.star} \u91D1`);
          }
      }
      for (const id of team.players) {
        const p = draft.players[id];
        grantRoundIncome(p, draft.round, outcome, battle.neutral);
        if (battle.neutral && outcome === "win") grantLoot(draft, p);
      }
    }
  }
  for (const t of Object.values(draft.teams))
    if (t.hp === 0 && t.eliminatedRound === null) {
      t.eliminatedRound = draft.round;
      for (const id of t.players) returnShop(draft, draft.players[id]);
      for (const u of teamUnits(draft, t.id)) {
        draft.pool[u.defId] += u.copies;
        delete draft.units[u.id];
      }
    }
  draft.settledRound = draft.round;
  draft.phase = Object.values(draft.teams).filter((t) => t.hp > 0).length <= 1 || draft.round >= RULES.maxRounds ? "finished" : "settlement";
  rankTeams(draft);
  Object.assign(s, draft);
}

// src/combat/engine.ts
function synergyCounts(units) {
  const counts = {};
  for (const id of new Set(units.map((u) => u.defId)))
    for (const tag of UNIT_BY_ID[id].tags) counts[tag] = (counts[tag] ?? 0) + 1;
  return counts;
}
function synergyValue(counts, tag) {
  const definition = SYNERGIES.find((s) => s.id === tag);
  let value = 0;
  definition.thresholds.forEach((threshold, index) => {
    if ((counts[tag] ?? 0) >= threshold) value = definition.values[index];
  });
  return value;
}
function entity(unit, side, counts, enemyCounts = {}) {
  const def = UNIT_BY_ID[unit.defId];
  const scale = RULES.starScale[unit.star - 1];
  const modifiers = {
    hpPercent: 0,
    attackPercent: 0,
    armor: 0,
    energy: 0,
    shield: 0,
    haste: 0,
    skillBonus: 0,
    deathHeal: 0,
    cooldown: 0,
    dodge: 0,
    reflect: 0,
    skillResist: 0,
    armorPen: 0,
    energyGain: 100,
    regen: 0,
    critical: 0,
    groundBonus: 0,
    siegeBonus: 0,
    summonEnergy: 0,
    linger: 0,
    extreme: 0
  };
  for (const synergy2 of SYNERGIES) {
    const own = synergyValue(counts, synergy2.id), enemy = synergyValue(enemyCounts, synergy2.id), applies = synergy2.scope === "allAllies" || synergy2.scope === "selfTag" && def.tags.includes(synergy2.id);
    if (applies && synergy2.effect in modifiers)
      modifiers[synergy2.effect] += own;
    if (synergy2.scope === "allEnemies" && synergy2.effect === "enemyArmor") modifiers.armor -= enemy;
    if (synergy2.scope === "allEnemies" && synergy2.effect === "enemySkillResist")
      modifiers.skillResist -= enemy;
    if (synergy2.scope === "allEnemies" && synergy2.effect === "enemyEnergyGain")
      modifiers.energyGain -= enemy;
  }
  let hp = Math.floor(def.hp * scale / 100), attack = Math.floor(def.attack * scale / 100), armor = def.armor, haste = modifiers.haste, life = 0, skill = modifiers.skillBonus;
  let cooldownReduction = modifiers.cooldown, noSkill = false, emergencyImmunity = 0;
  for (const id of unit.items) {
    const i = ITEM_BY_ID[id];
    hp += i.hp;
    attack += i.attack;
    armor += i.armor;
    haste += i.haste;
    life += i.lifesteal;
    skill += i.skillBonus;
    modifiers.skillResist += i.skillResist ?? 0;
    cooldownReduction += i.cooldown ?? 0;
    noSkill ||= !!i.noSkill;
    emergencyImmunity = Math.max(emergencyImmunity, i.emergencyImmunity ?? 0);
  }
  hp = Math.floor(hp * (100 + modifiers.hpPercent) / 100);
  attack = Math.floor(attack * (100 + modifiers.attackPercent) / 100);
  armor += modifiers.armor;
  return {
    id: unit.id,
    defId: unit.defId,
    ownerId: unit.ownerId,
    side,
    star: unit.star,
    summoned: false,
    items: [...unit.items],
    x: unit.x,
    y: unit.y,
    hp,
    maxHp: hp,
    attack,
    armor,
    range: def.range,
    layer: def.layer,
    targets: def.targets,
    energy: modifiers.energy + (def.tags.includes("panda") ? synergyValue(counts, "panda") : 0),
    attackTicks: Math.max(
      RULES.minAttackTicks,
      Math.floor(def.attackTicks * (100 - Math.min(RULES.maxHaste, haste)) / 100)
    ),
    nextAttack: 0,
    nextMove: 0,
    nextSkill: 0,
    targetId: null,
    shield: modifiers.shield,
    stunUntil: 0,
    poisonUntil: 0,
    poisonPower: 0,
    buffUntil: 0,
    buffPower: 0,
    lifesteal: life,
    skillBonus: skill,
    cooldownReduction,
    dodge: modifiers.dodge,
    reflect: modifiers.reflect,
    skillResist: modifiers.skillResist,
    armorPen: modifiers.armorPen,
    energyGain: Math.max(25, modifiers.energyGain),
    regen: modifiers.regen,
    criticalChance: modifiers.critical,
    criticalPower: modifiers.critical ? 175 : 150,
    silencedUntil: 0,
    tauntedBy: null,
    tauntedUntil: 0,
    armorDebuff: 0,
    itemsDisabledUntil: 0,
    skillTakenBonus: 0,
    rampTargetId: null,
    rampPower: 0,
    extremeTriggered: false,
    trueAttack: def.tags.includes("walker") && (counts.walker ?? 0) === 1,
    groundBonus: def.tags.includes("raptor") ? synergyValue(counts, "raptor") : 0,
    siegeBonus: modifiers.siegeBonus,
    summonEnergy: modifiers.summonEnergy,
    lingerTicks: modifiers.linger,
    noSkill,
    emergencyImmunity,
    immunityUsed: false,
    immunityUntil: 0,
    deathHeal: modifiers.deathHeal,
    extremePower: modifiers.extreme,
    deathAt: null,
    deathTriggered: false,
    deathBurstAt: null,
    action: null
  };
}
function createBattle(descriptor) {
  if (descriptor.rulesetId !== RULES.id || descriptor.contentHash !== CONTENT_HASH || descriptor.simulationVersion !== RULES.simulationVersion)
    throw new Error("\u6218\u6597\u7248\u672C\u4E0D\u4E00\u81F4");
  if (descriptor.sides.flat().length > RULES.entityCap) throw new Error("\u6218\u6597\u5B9E\u4F53\u8D85\u8FC7\u4E0A\u9650");
  const sideCounts = descriptor.sides.map(synergyCounts);
  const entities = descriptor.sides.flatMap((side, index) => {
    return side.map(
      (u) => entity(u, index, sideCounts[index], sideCounts[index ? 0 : 1])
    );
  }).sort((a, b) => compareId(a.id, b.id));
  if (new Set(entities.map((e) => e.id)).size !== entities.length)
    throw new Error("\u91CD\u590D\u6218\u6597\u5B9E\u4F53\u7F16\u53F7");
  const s = {
    descriptor,
    tick: 0,
    rng: descriptor.seed,
    entities,
    done: false,
    serial: 0,
    actionSerial: 0,
    entries: [],
    diagnostics: [],
    eventHash: 2166136261
  };
  for (const u of entities)
    if (UNIT_BY_ID[u.defId].assassin && u.criticalChance) {
      const enemies = entities.filter((e) => e.side !== u.side);
      const target = enemies.sort(
        (a, b) => u.side === 0 ? a.y - b.y || compareId(a.id, b.id) : b.y - a.y || compareId(a.id, b.id)
      )[0];
      if (target) {
        const fromX = u.x, fromY = u.y;
        const cells = neighbors(target.x, target.y).filter(
          ([x, y]) => !occupied(s, u.layer, x, y, u.id)
        );
        if (cells.length) {
          u.x = cells[0][0];
          u.y = cells[0][1];
          s.entries.push({ source: u.id, fromX, fromY });
        }
      }
    }
  s.done = entities.every((e) => e.side === 0) || entities.every((e) => e.side === 1);
  return s;
}
function distance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
function neighbors(x, y) {
  return [
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && a < 10 && b >= 0 && b < 10);
}
function alive(u) {
  return u.hp > 0;
}
function occupied(s, layer, x, y, id) {
  return s.entities.some(
    (e) => alive(e) && e.id !== id && e.layer === layer && e.x === x && e.y === y
  );
}
function findStep(s, u, target) {
  const blocked = new Uint8Array(100);
  for (const e of s.entities)
    if (alive(e) && e.id !== u.id && e.layer === u.layer) blocked[e.y * 10 + e.x] = 1;
  const start = u.y * 10 + u.x, prev = new Int16Array(100).fill(-1), queue = [start];
  prev[start] = start;
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head], x = cell % 10, y = Math.floor(cell / 10);
    if (cell !== start && distance({ x, y }, target) <= u.range) {
      let next = cell;
      while (prev[next] !== start) next = prev[next];
      return [next % 10, Math.floor(next / 10)];
    }
    for (const [nx, ny] of neighbors(x, y)) {
      const key = ny * 10 + nx;
      if (prev[key] !== -1 || blocked[key]) continue;
      if (u.layer === "ground" && nx !== x && ny !== y && (blocked[y * 10 + nx] || blocked[ny * 10 + x]))
        continue;
      prev[key] = cell;
      queue.push(key);
    }
  }
  return null;
}
function stepBattle(s, steps = 1) {
  const events = [];
  const emit = (event) => {
    const e = { tick: s.tick, ...event };
    events.push(e);
    s.eventHash = hashText(JSON.stringify(e), s.eventHash);
  };
  const itemTotal = (unit, field) => unit.items.reduce((sum, id) => sum + (ITEM_BY_ID[id][field] ?? 0), 0);
  const applyHit = (hit) => {
    const { source, target, physical } = hit;
    s.rng = nextRandom(s.rng);
    if (source.id !== target.id && target.dodge && s.rng % 100 < target.dodge) {
      emit({ kind: "statusApply", source: target.id, target: target.id, status: "buff" });
      return;
    }
    let power = hit.power;
    if (target.layer === "ground" && source.groundBonus)
      power = Math.floor(power * (100 + source.groundBonus) / 100);
    const heavy = UNIT_BY_ID[target.defId].tags.some(
      (tag) => ["armor", "airforce", "puppet", "marine", "insectoid", "immortal"].includes(tag)
    );
    if (heavy && source.siegeBonus) power = Math.floor(power * (100 + source.siegeBonus) / 100);
    let damage = Math.max(
      1,
      physical ? source.trueAttack ? power : Math.floor(
        power * RULES.damageArmorBase / (RULES.damageArmorBase + Math.max(
          0,
          target.armor - (target.itemsDisabledUntil > s.tick ? itemTotal(target, "armor") : 0) - target.armorDebuff - source.armorPen
        ) * RULES.armorCoefficient)
      ) : Math.floor(
        power * (100 - target.skillResist + (target.itemsDisabledUntil > s.tick ? itemTotal(target, "skillResist") : 0) - (target.immunityUntil > s.tick ? target.emergencyImmunity : 0) + target.skillTakenBonus) / 100
      )
    );
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    damage -= absorbed;
    if (absorbed)
      emit({ kind: "shieldAbsorb", source: source.id, target: target.id, value: absorbed });
    if (absorbed && !target.shield)
      emit({ kind: "shieldBreak", source: source.id, target: target.id });
    target.hp -= damage;
    if (target.deathAt !== null && s.tick < target.deathAt) target.hp = Math.max(1, target.hp);
    target.energy = Math.min(
      100,
      target.energy + Math.floor(RULES.hitEnergy * target.energyGain / 100)
    );
    emit({ kind: "damage", source: source.id, target: target.id, value: damage });
    const activeLifesteal = source.lifesteal - (source.itemsDisabledUntil > s.tick ? itemTotal(source, "lifesteal") : 0);
    if (physical && activeLifesteal && source.hp > 0) {
      const heal = Math.min(source.maxHp - source.hp, Math.floor(damage * activeLifesteal / 100));
      source.hp += heal;
      if (heal) emit({ kind: "heal", source: source.id, target: source.id, value: heal });
    }
    if (source.id !== target.id && target.reflect && source.hp > 0 && damage > 0) {
      const reflected = Math.min(source.hp, target.reflect);
      source.hp -= reflected;
      emit({ kind: "damage", source: target.id, target: source.id, value: reflected });
    }
    if (target.itemsDisabledUntil <= s.tick)
      for (const id of target.items) target.skillBonus += ITEM_BY_ID[id].damageTakenSkill ?? 0;
    const ramp = source.itemsDisabledUntil > s.tick ? 0 : source.items.reduce((sum, id) => sum + (ITEM_BY_ID[id].onHitRamp ?? 0), 0);
    if (physical && ramp) {
      source.rampPower = source.rampTargetId === target.id ? Math.min(40, source.rampPower + ramp) : ramp;
      source.rampTargetId = target.id;
    }
    if (!target.immunityUsed && target.emergencyImmunity && target.hp > 0 && target.hp * 100 <= target.maxHp * 30) {
      target.immunityUsed = true;
      target.immunityUntil = s.tick + 40;
      target.stunUntil = Math.min(target.stunUntil, s.tick);
      emit({
        kind: "statusApply",
        source: target.id,
        target: target.id,
        status: "buff",
        until: target.immunityUntil
      });
    }
    if (source.summoned && damage > 0)
      for (const owner of s.entities.filter(
        (entity2) => !entity2.summoned && entity2.ownerId === source.ownerId && UNIT_BY_ID[entity2.defId].tags.includes("summoner")
      )) {
        owner.energy = Math.min(100, owner.energy + owner.summonEnergy);
      }
  };
  const eventForAction = (kind, source) => {
    const action = source.action;
    emit({
      kind,
      source: source.id,
      target: action.targetId,
      x: action.targetX,
      y: action.targetY,
      actionId: action.id,
      action: action.kind,
      skillKind: action.skillKind,
      releaseTick: action.releaseAt,
      impactTick: action.impactAt,
      recoverTick: action.recoverAt
    });
  };
  const startAction = (source, kind, target) => {
    const def = UNIT_BY_ID[source.defId], targetRule = def.skill.effects.find((effect) => effect.trigger === "cast")?.target, baseTiming = kind === "attack" ? def.attackTiming : def.skill.timing, scale = kind === "attack" ? source.attackTicks / def.attackTicks : 1, windup = Math.max(1, Math.floor(baseTiming.windupTicks * scale)), travel = Math.max(0, Math.floor(baseTiming.travelTicks * scale)), recovery = Math.max(0, Math.floor(baseTiming.recoveryTicks * scale));
    let actualTarget = target;
    if (kind === "skill" && targetRule === "lowestHealthAlly") {
      actualTarget = s.entities.filter((e) => e.side === source.side && alive(e)).sort((a, b) => a.hp * b.maxHp - b.hp * a.maxHp || compareId(a.id, b.id))[0] ?? source;
    } else if (kind === "skill" && (targetRule === "self" || targetRule === "allAllies")) {
      actualTarget = source;
    } else if (kind === "skill" && targetRule === "highestAttackEnemy") {
      actualTarget = s.entities.filter((e) => e.side !== source.side && alive(e)).sort((a, b) => b.attack - a.attack || compareId(a.id, b.id))[0] ?? target;
    }
    let power = source.attack, critical = false;
    if (kind === "attack") {
      s.rng = nextRandom(s.rng);
      critical = source.criticalChance > 0 && s.rng % 100 < source.criticalChance;
      const activeAttack = source.attack - (source.itemsDisabledUntil > s.tick ? itemTotal(source, "attack") : 0);
      power = Math.floor(
        (activeAttack + (source.buffUntil > s.tick ? source.buffPower : 0) + source.rampPower) * (critical ? source.criticalPower : 100) / 100
      );
      source.energy = Math.min(
        100,
        source.energy + Math.floor(RULES.attackEnergy * source.energyGain / 100)
      );
      source.nextAttack = s.tick + source.attackTicks;
      const silenceAt = source.itemsDisabledUntil > s.tick ? 0 : source.items.reduce(
        (value, id) => Math.max(value, ITEM_BY_ID[id].silenceEnergy ?? 0),
        0
      );
      if (silenceAt && actualTarget.energy >= silenceAt)
        actualTarget.silencedUntil = Math.max(actualTarget.silencedUntil, s.tick + 30);
    } else {
      source.energy -= 100;
      const activeCooldown = source.cooldownReduction - (source.itemsDisabledUntil > s.tick ? itemTotal(source, "cooldown") : 0), activeSkillBonus = source.skillBonus - (source.itemsDisabledUntil > s.tick ? itemTotal(source, "skillBonus") : 0);
      source.nextSkill = s.tick + Math.max(10, Math.floor(def.skill.cooldown * (100 - activeCooldown) / 100));
      power = Math.floor(
        def.skill.power * RULES.starScale[source.star - 1] / 100 * (100 + activeSkillBonus) / 100
      );
    }
    source.action = {
      id: ++s.actionSerial,
      kind,
      skillKind: kind === "skill" ? def.skill.kind : void 0,
      targetId: actualTarget.id,
      targetX: actualTarget.x,
      targetY: actualTarget.y,
      startedAt: s.tick,
      releaseAt: s.tick + windup,
      impactAt: s.tick + windup + travel,
      recoverAt: s.tick + windup + travel + recovery,
      released: false,
      power,
      physical: kind === "attack",
      critical
    };
    eventForAction("actionStart", source);
  };
  const impactAction = (source, hits) => {
    const action = source.action, def = UNIT_BY_ID[source.defId], castEffect = def.skill.effects.find((effect) => effect.trigger === "cast");
    eventForAction("actionImpact", source);
    if (action.critical)
      emit({ kind: "critical", source: source.id, target: action.targetId, actionId: action.id });
    if (action.kind === "attack") {
      const target = s.entities.find((e) => e.id === action.targetId && alive(e));
      if (target) hits.push({ source, target, power: action.power, physical: action.physical });
      return;
    }
    const skill = def.skill, friends = s.entities.filter((e) => e.side === source.side && alive(e));
    if (skill.kind === "heal") {
      const target = s.entities.find((e) => e.id === action.targetId && alive(e));
      if (target) {
        const heal = Math.min(action.power, target.maxHp - target.hp);
        target.hp += heal;
        if (heal) emit({ kind: "heal", source: source.id, target: target.id, value: heal });
      }
    } else if (skill.kind === "shield") {
      const protectedUnits = castEffect?.target === "allAllies" ? friends : [s.entities.find((e) => e.id === action.targetId && alive(e)) ?? source];
      for (const friend of protectedUnits) {
        friend.shield += action.power;
        emit({ kind: "shield", source: source.id, target: friend.id, value: action.power });
        emit({ kind: "statusApply", source: source.id, target: friend.id, status: "shield" });
      }
    } else if (skill.kind === "buff") {
      if (castEffect?.kind === "energy") {
        for (const friend of friends) {
          friend.energy = Math.min(100, friend.energy + 35);
          emit({ kind: "statusApply", source: source.id, target: friend.id, status: "energy" });
        }
      } else if (alive(source)) {
        source.buffPower = Math.floor(source.attack / 2);
        source.buffUntil = s.tick + skill.duration;
        emit({
          kind: "statusApply",
          source: source.id,
          target: source.id,
          status: "buff",
          until: source.buffUntil
        });
      }
    } else if (skill.kind === "summon") {
      if (alive(source) && s.entities.length < RULES.entityCap) {
        const cell = neighbors(source.x, source.y).find(
          ([x, y]) => !occupied(s, "ground", x, y, "")
        );
        if (cell) {
          const child = entity(
            {
              id: `${s.descriptor.id}:s${++s.serial}`,
              defId: def.summonId ?? "wolf",
              ownerId: source.ownerId,
              star: source.star,
              x: cell[0],
              y: cell[1],
              items: []
            },
            source.side,
            {}
          );
          child.summoned = true;
          child.maxHp = child.hp = Math.floor(source.maxHp / 3);
          child.attack = Math.floor(source.attack / 2);
          s.entities.push(child);
          emit({ kind: "spawn", source: source.id, target: child.id, x: child.x, y: child.y });
        }
      } else if (s.entities.length >= RULES.entityCap && !s.diagnostics.includes("entity-cap")) {
        s.diagnostics.push("entity-cap");
      }
    } else if (skill.kind === "transform") {
      const nearest = s.entities.filter((entity2) => entity2.side !== source.side && alive(entity2)).sort((a, b) => distance(source, a) - distance(source, b) || compareId(a.id, b.id))[0];
      source.layer = source.defId === "transform_tower" ? nearest && distance(source, nearest) > 2 ? "air" : "ground" : source.layer === "air" ? "ground" : "air";
      source.buffPower = Math.floor(source.attack / 2);
      source.buffUntil = s.tick + skill.duration;
      emit({
        kind: "statusApply",
        source: source.id,
        target: source.id,
        status: "buff",
        until: source.buffUntil
      });
    } else {
      if (skill.kind === "dash" && alive(source)) {
        const cell = neighbors(action.targetX, action.targetY).find(
          ([x, y]) => !occupied(s, source.layer, x, y, source.id)
        );
        if (cell) {
          source.x = cell[0];
          source.y = cell[1];
          emit({ kind: "move", source: source.id, x: source.x, y: source.y });
        }
      }
      for (const target of s.entities.filter(
        (e) => alive(e) && e.side !== source.side && source.targets.includes(e.layer) && distance(e, { x: action.targetX, y: action.targetY }) <= skill.radius
      )) {
        if (skill.kind === "execute") {
          const threshold = skill.power;
          hits.push({
            source,
            target,
            power: target.hp * 100 <= target.maxHp * threshold ? target.hp + target.shield : Math.max(1, action.power),
            physical: false
          });
        } else hits.push({ source, target, power: action.power, physical: false });
        if (skill.kind === "stun") {
          const controlDuration = target.extremeTriggered ? Math.max(1, Math.floor(skill.duration / 2)) : skill.duration;
          target.stunUntil = Math.max(target.stunUntil, s.tick + controlDuration);
          emit({
            kind: "statusApply",
            source: source.id,
            target: target.id,
            status: "stun",
            until: target.stunUntil
          });
        }
        if (skill.kind === "poison") {
          target.poisonUntil = s.tick + skill.duration;
          target.poisonPower = Math.floor(action.power / 4);
          emit({
            kind: "statusApply",
            source: source.id,
            target: target.id,
            status: "poison",
            until: target.poisonUntil
          });
        }
        if (skill.kind === "armorBreak") {
          target.armorDebuff = Math.max(target.armorDebuff, 6 + source.star * 2);
          emit({
            kind: "statusApply",
            source: source.id,
            target: target.id,
            status: "armorBreak",
            until: s.tick + skill.duration
          });
        }
        if (skill.kind === "charm") {
          const victim = s.entities.filter((e) => e.side === target.side && e.id !== target.id && alive(e)).sort((a, b) => compareId(a.id, b.id))[0];
          if (victim) target.targetId = victim.id;
          target.tauntedBy = victim?.id ?? source.id;
          target.tauntedUntil = s.tick + skill.duration;
          emit({
            kind: "statusApply",
            source: source.id,
            target: target.id,
            status: "taunt",
            until: s.tick + skill.duration
          });
        }
        if (skill.kind === "silence") {
          target.silencedUntil = Math.max(target.silencedUntil, s.tick + skill.duration);
          target.itemsDisabledUntil = target.silencedUntil;
          emit({
            kind: "statusApply",
            source: source.id,
            target: target.id,
            status: "itemsDisabled",
            until: target.silencedUntil
          });
        }
      }
    }
  };
  for (let step = 0; step < steps && !s.done; step++) {
    s.tick++;
    const hits = [];
    if (s.tick === 1)
      for (const entry of s.entries)
        emit({ kind: "entry", source: entry.source, x: entry.fromX, y: entry.fromY });
    for (const u of s.entities) {
      if (u.deathAt !== null && s.tick >= u.deathAt && u.hp > 0) {
        u.hp = 0;
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "linger" });
        emit({ kind: "death", source: u.id, x: u.x, y: u.y });
      }
      if (u.stunUntil === s.tick)
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "stun" });
      if (u.poisonUntil === s.tick)
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "poison" });
      if (u.buffUntil === s.tick)
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "buff" });
      if (u.tauntedUntil === s.tick) {
        u.tauntedBy = null;
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "taunt" });
      }
      if (u.silencedUntil === s.tick)
        emit({ kind: "statusRemove", source: u.id, target: u.id, status: "silence" });
      if (u.regen && s.tick % RULES.tickRate === 0 && alive(u)) {
        const heal = Math.min(u.maxHp - u.hp, Math.floor(u.maxHp * u.regen / 100));
        u.hp += heal;
        if (heal) emit({ kind: "heal", source: u.id, target: u.id, value: heal });
      }
      if (!u.extremeTriggered && UNIT_BY_ID[u.defId].tags.includes("fighter") && u.hp > 0 && u.hp * 100 <= u.maxHp * 30) {
        u.extremeTriggered = true;
        const value = u.extremePower;
        u.attack = Math.floor(u.attack * (100 + value) / 100);
        u.attackTicks = Math.max(
          RULES.minAttackTicks,
          Math.floor(u.attackTicks * (100 - value) / 100)
        );
        u.energyGain += value;
        u.stunUntil = Math.min(u.stunUntil, s.tick);
        emit({ kind: "statusApply", source: u.id, target: u.id, status: "extreme" });
      }
      if (u.poisonUntil > s.tick && s.tick % 20 === 0 && alive(u))
        hits.push({ source: u, target: u, power: u.poisonPower, physical: false });
      if (u.deathBurstAt === s.tick) {
        const power = UNIT_BY_ID[u.defId].deathBurst ?? 0;
        emit({ kind: "deathBurstImpact", source: u.id, x: u.x, y: u.y, value: power });
        for (const target of s.entities.filter(
          (e) => alive(e) && e.side !== u.side && distance(e, u) <= 1
        ))
          hits.push({ source: u, target, power, physical: false });
        u.deathBurstAt = null;
      }
    }
    const acting = [...s.entities].sort((a, b) => compareId(a.id, b.id));
    for (const u of acting) {
      const action = u.action;
      if (!action) continue;
      if (!action.released && (!alive(u) || u.stunUntil > s.tick)) {
        eventForAction("actionCancel", u);
        u.action = null;
        continue;
      }
      if (!action.released && s.tick >= action.releaseAt) {
        action.released = true;
        eventForAction("actionRelease", u);
      }
      if (action.released && s.tick === action.impactAt) impactAction(u, hits);
      if (s.tick >= action.recoverAt && s.tick >= action.impactAt) u.action = null;
    }
    for (const hit of hits) applyHit(hit);
    let triggers = 0, changed = true;
    while (changed && triggers < RULES.triggerCap) {
      changed = false;
      for (const u of s.entities) {
        if (u.hp > 0 || u.deathTriggered) continue;
        u.deathTriggered = true;
        changed = true;
        triggers++;
        const def = UNIT_BY_ID[u.defId];
        if ((def.linger || u.lingerTicks) && !u.summoned) {
          u.hp = 1;
          u.deathAt = s.tick + (def.linger ?? u.lingerTicks);
          emit({
            kind: "statusApply",
            source: u.id,
            target: u.id,
            status: "linger",
            until: u.deathAt
          });
        }
        if (def.deathBurst && !u.summoned) {
          u.deathBurstAt = s.tick + 3;
          emit({
            kind: "deathBurst",
            source: u.id,
            x: u.x,
            y: u.y,
            value: def.deathBurst,
            impactTick: u.deathBurstAt
          });
        }
        const support = u.deathHeal;
        if (support && def.tags.includes("support") && !u.summoned)
          for (const friend of s.entities.filter((e) => alive(e) && e.side === u.side)) {
            const heal = Math.min(friend.maxHp - friend.hp, support);
            friend.hp += heal;
            if (heal) emit({ kind: "heal", source: u.id, target: friend.id, value: heal });
            friend.energy = Math.min(100, friend.energy + Math.floor(support / 4));
          }
        if (u.hp <= 0) emit({ kind: "death", source: u.id, x: u.x, y: u.y });
      }
    }
    if (triggers >= RULES.triggerCap && !s.diagnostics.includes("trigger-cap"))
      s.diagnostics.push("trigger-cap");
    for (const u of s.entities) {
      if (u.hp < 0) u.hp = 0;
      if (u.action && !u.action.released && (!alive(u) || u.stunUntil > s.tick)) {
        eventForAction("actionCancel", u);
        u.action = null;
      }
    }
    const living = s.entities.filter(alive).sort((a, b) => compareId(a.id, b.id));
    for (const u of living) {
      if (u.action || u.stunUntil > s.tick) continue;
      const enemies = living.filter(
        (e) => u.tauntedUntil > s.tick ? e.id === u.tauntedBy : e.side !== u.side && u.targets.includes(e.layer) && alive(e)
      );
      let target = enemies.find((e) => e.id === u.targetId);
      if (!target)
        target = enemies.sort(
          (a, b) => (distance(u, a) <= u.range ? 0 : 1) - (distance(u, b) <= u.range ? 0 : 1) || distance(u, a) - distance(u, b) || compareId(a.id, b.id)
        )[0];
      if (!target) continue;
      u.targetId = target.id;
      if (!u.summoned && !(u.itemsDisabledUntil <= s.tick && u.items.some((id) => ITEM_BY_ID[id].noSkill)) && UNIT_BY_ID[u.defId].skill.effects.some((effect) => effect.trigger === "cast") && u.silencedUntil <= s.tick && u.energy >= 100 && s.tick >= u.nextSkill) {
        startAction(u, "skill", target);
      } else if (!UNIT_BY_ID[u.defId].noAttack && distance(u, target) <= u.range && s.tick >= u.nextAttack) {
        startAction(u, "attack", target);
      } else if (!UNIT_BY_ID[u.defId].immobile && distance(u, target) > u.range && s.tick >= u.nextMove) {
        const def = UNIT_BY_ID[u.defId];
        let cell = findStep(s, u, target);
        if (!cell) {
          for (const alternate of enemies.sort(
            (a, b) => distance(u, a) - distance(u, b) || compareId(a.id, b.id)
          )) {
            cell = findStep(s, u, alternate);
            if (cell) {
              u.targetId = alternate.id;
              break;
            }
          }
        }
        if (cell) {
          u.x = cell[0];
          u.y = cell[1];
          emit({ kind: "move", source: u.id, x: u.x, y: u.y });
        }
        u.nextMove = s.tick + def.moveTicks;
      }
    }
    const aliveSides = new Set(s.entities.filter(alive).map((u) => u.side));
    const pendingImpact = s.entities.some(
      (u) => u.action?.released && u.action.impactAt > s.tick || u.deathBurstAt !== null && u.deathBurstAt > s.tick
    );
    s.done = aliveSides.size < 2 && !pendingImpact || s.tick >= RULES.maxTicks;
  }
  return events;
}
function finishBattle(s) {
  if (!s.done) throw new Error("Battle is not finished");
  const survivors = s.entities.filter(alive).sort((a, b) => compareId(a.id, b.id));
  const sides = new Set(survivors.map((u) => u.side));
  const winner = sides.size === 1 ? survivors[0].side : null;
  const damage = winner === null ? [1, 1] : winner === 0 ? [0, survivors.filter((u) => !u.summoned).reduce((n, u) => n + u.star, 0)] : [survivors.filter((u) => !u.summoned).reduce((n, u) => n + u.star, 0), 0];
  return {
    id: s.descriptor.id,
    winner,
    ticks: s.tick,
    damage,
    survivors: survivors.map((u) => u.id),
    hash: hashValue({ tick: s.tick, rng: s.rng, entities: s.entities, eventHash: s.eventHash }),
    diagnostics: s.diagnostics
  };
}

// src/combat/executor.ts
var LocalBattleExecutor = class {
  tasks;
  cursor = 0;
  constructor(descriptors) {
    this.tasks = descriptors.map(createBattle);
  }
  get done() {
    return this.tasks.length === 0;
  }
  advance(steps = 4) {
    if (!this.tasks.length) return [];
    this.cursor %= this.tasks.length;
    const s = this.tasks[this.cursor];
    stepBattle(s, steps);
    if (s.done) {
      this.tasks.splice(this.cursor, 1);
      return [finishBattle(s)];
    }
    this.cursor = (this.cursor + 1) % this.tasks.length;
    return [];
  }
};

// src/combat/replay.ts
function frame(s, events = []) {
  return {
    battleId: s.descriptor.id,
    tick: s.tick,
    units: s.entities.filter((e) => e.hp > 0).map(
      ({
        id,
        defId,
        side,
        star,
        x,
        y,
        hp,
        maxHp,
        shield,
        layer,
        stunUntil,
        poisonUntil,
        buffUntil,
        deathAt,
        action
      }) => ({
        id,
        defId,
        side,
        star,
        x,
        y,
        hp,
        maxHp,
        shield,
        layer,
        stunUntil,
        poisonUntil,
        buffUntil,
        deathAt,
        action: action ? { ...action } : null
      })
    ),
    actions: s.entities.filter((e) => e.action && (e.hp > 0 || e.action.released)).map((e) => ({
      sourceId: e.id,
      defId: e.defId,
      side: e.side,
      x: e.x,
      y: e.y,
      action: { ...e.action }
    })),
    deathBursts: s.entities.filter((e) => e.deathBurstAt !== null && e.deathBurstAt > s.tick).map((e) => ({
      sourceId: e.id,
      defId: e.defId,
      side: e.side,
      x: e.x,
      y: e.y,
      impactAt: e.deathBurstAt
    })),
    events
  };
}

// src/parti/room.ts
var executor = null;
var closing = false;
var roundComputeMs = 0;
var maxSliceMs = 0;
var computeSlices = 0;
var replayRequests = /* @__PURE__ */ new Set();
function safe(ctx, fn) {
  try {
    fn();
  } catch (e) {
    ctx.state.error = e instanceof Error ? e.message : String(e);
    ctx.state.phase = "error";
    for (const timer of ["prep", "bots", "compute", "playback", "next"]) ctx.clearTimer(timer);
    ctx.log("game:error", ctx.state.error);
  }
}
function schedule(ctx, name, ms, fn) {
  ctx.setTimer(name, ms, () => safe(ctx, fn));
}
function prepare(ctx) {
  closing = false;
  executor = null;
  ctx.state.deadline = ctx.now() + RULES.prepMs;
  schedule(ctx, "prep", RULES.prepMs, () => {
    closing = true;
    pumpBots(ctx);
  });
  schedule(ctx, "bots", 50, () => pumpBots(ctx));
}
function pumpBots(ctx) {
  if (ctx.state.phase !== "prep") return;
  let work = false;
  for (let i = 0; i < 2; i++) {
    work = advanceBots(ctx.state);
    if (!work) break;
  }
  if (closing && !work) {
    ctx.clearTimer("prep");
    ctx.clearTimer("bots");
    freezeBattles(ctx.state);
    beginCompute(ctx);
    return;
  }
  if (work) schedule(ctx, "bots", 30, () => pumpBots(ctx));
}
function beginCompute(ctx) {
  executor = new LocalBattleExecutor(ctx.state.battles.filter((b) => !ctx.state.results[b.id]));
  roundComputeMs = 0;
  maxSliceMs = 0;
  computeSlices = 0;
  ctx.state.deadline = 0;
  schedule(ctx, "compute", 1, () => compute(ctx));
}
function compute(ctx) {
  if (ctx.state.phase !== "battle" || !executor) return;
  const started = ctx.now();
  const completed = executor.advance(8);
  const elapsed = ctx.now() - started;
  roundComputeMs += elapsed;
  maxSliceMs = Math.max(maxSliceMs, elapsed);
  computeSlices++;
  commitBattleResults(ctx.state, completed);
  if (!executor.done) {
    schedule(ctx, "compute", 1, () => compute(ctx));
    return;
  }
  ctx.log("game:performance", {
    round: ctx.state.round,
    battles: ctx.state.battles.length,
    computeMs: roundComputeMs,
    maxSliceMs,
    computeSlices,
    snapshotBytes: new TextEncoder().encode(JSON.stringify(ctx.state)).length
  });
  const ticks = Math.max(0, ...Object.values(ctx.state.results).map((r) => r.ticks));
  ctx.state.deadline = ctx.now() + Math.max(2e3, ticks * 50);
  ctx.state.playbackEpoch++;
  schedule(ctx, "playback", Math.max(2e3, ticks * 50), () => {
    settleRound(ctx.state);
    if (ctx.state.phase === "settlement")
      schedule(ctx, "next", 3e3, () => {
        beginRound(ctx.state);
        prepare(ctx);
      });
  });
}
function recover(ctx) {
  validateContent();
  if (ctx.state.contentHash !== CONTENT_HASH || ctx.state.rulesetId !== RULES.id || ctx.state.simulationVersion !== RULES.simulationVersion)
    throw new Error("\u623F\u95F4\u7248\u672C\u4E0D\u5339\u914D\uFF0C\u8BF7\u7528\u539F\u7248\u672C\u6062\u590D\u6216\u521B\u5EFA\u65B0\u623F\u95F4");
  replayRequests.clear();
  executor = null;
  closing = false;
  if (ctx.state.phase === "error") {
    ctx.state.error = null;
    ctx.state.phase = ctx.state.battles.length && ctx.state.settledRound !== ctx.state.round ? "battle" : "prep";
  }
  if (ctx.state.phase === "prep") prepare(ctx);
  else if (ctx.state.phase === "battle") beginCompute(ctx);
  else if (ctx.state.phase === "settlement")
    schedule(ctx, "next", 3e3, () => {
      beginRound(ctx.state);
      prepare(ctx);
    });
}
var room_default = defineRoom({
  meta: { name: "\u5171\u751F\u6218\u7EBF", minPlayers: 2, maxPlayers: 2 },
  initialState: () => createGame(),
  onCreate(ctx) {
    validateContent();
    ctx.state.seed = Math.floor(ctx.random() * 4294967295) >>> 0;
    ctx.state.rewardRng = ctx.state.seed || 1;
  },
  onJoin(ctx, p) {
    if (ctx.state.players[p.id]) return;
    if (ctx.state.phase !== "waiting" || Object.values(ctx.state.players).filter((x) => !x.bot).length >= 2)
      return;
    addPlayer(ctx.state, p.id, p.name, "team-0", Object.keys(ctx.state.players).length);
  },
  onLeave(ctx, p) {
    if (ctx.state.phase === "waiting" && ctx.state.players[p.id]) {
      const team = ctx.state.teams["team-0"];
      team.players = team.players.filter((id) => id !== p.id);
      delete ctx.state.players[p.id];
      team.players.forEach((id, seat) => ctx.state.players[id].seat = seat);
    }
  },
  onRestore(ctx) {
    safe(ctx, () => recover(ctx));
  },
  onReconnect(ctx, p) {
    ctx.send(p.id, "game:connected", { message: "\u5DF2\u6062\u590D\u539F\u5E2D\u4F4D" });
  },
  actions: {
    clock(ctx, { player, payload }) {
      ctx.send(player.id, "game:clock", {
        nonce: payload?.nonce,
        round: ctx.state.round,
        epoch: ctx.state.playbackEpoch,
        phase: ctx.state.phase,
        remaining: Math.max(0, ctx.state.deadline - ctx.now())
      });
    },
    start(ctx, { player }) {
      safe(ctx, () => {
        if (player.id !== ctx.host.id || ctx.state.phase !== "waiting" || Object.values(ctx.state.players).filter((p) => !p.bot).length !== 2)
          return;
        startMatch(ctx.state);
        prepare(ctx);
      });
    },
    command(ctx, { player, payload }) {
      const commandId = payload?.commandId;
      const receipt = ctx.state.receipts[player.id]?.find((r) => r.commandId === commandId);
      if (receipt) {
        ctx.send(player.id, "game:command", receipt);
        return;
      }
      if (closing || ctx.state.phase === "prep" && ctx.now() >= ctx.state.deadline) {
        ctx.send(player.id, "game:command", {
          commandId: payload?.commandId,
          ok: false,
          reason: "\u51C6\u5907\u9636\u6BB5\u5DF2\u7ED3\u675F"
        });
        return;
      }
      const result = applyCommand(ctx.state, player.id, payload);
      ctx.send(player.id, "game:command", result);
      if (result.ok && ctx.state.phase === "prep" && Object.values(ctx.state.players).filter((p) => !p.bot).every((p) => p.ready)) {
        closing = true;
        ctx.clearTimer("prep");
        schedule(ctx, "bots", 1, () => pumpBots(ctx));
      }
    },
    retry(ctx, { player }) {
      if (player.id === ctx.host.id && ctx.state.phase === "error") safe(ctx, () => recover(ctx));
    },
    replay(ctx, { player, payload }) {
      const id = payload?.id;
      const descriptor = ctx.state.battles.find((b) => b.id === id);
      if (!descriptor || replayRequests.has(player.id)) return;
      replayRequests.add(player.id);
      const s = createBattle(descriptor);
      let sequence = 0;
      ctx.send(player.id, "game:replay", { id, sequence: sequence++, frame: frame(s) });
      const pump = () => {
        if (!ctx.state.battles.some((b) => b.id === id)) {
          replayRequests.delete(player.id);
          return;
        }
        const events = stepBattle(s, 4);
        ctx.send(player.id, "game:replay", { id, sequence: sequence++, frame: frame(s, events) });
        if (s.done) {
          ctx.send(player.id, "game:replay", { id, sequence, result: finishBattle(s) });
          replayRequests.delete(player.id);
        } else schedule(ctx, `replay:${player.id}`, 1, pump);
      };
      schedule(ctx, `replay:${player.id}`, 1, pump);
    }
  }
});
export default room_default;

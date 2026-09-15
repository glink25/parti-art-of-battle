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

// src/content/index.ts
var RULES = {
  id: "twins-original-02",
  simulationVersion: "2",
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
  // Cumulative thresholds; project-designed, not historical client data.
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
var rows = [
  ["shield", "\u62A4\u76FE\u5175", 1, "infantry", "guard", "stun", "soldier"],
  ["gunner", "\u795E\u67AA\u624B", 1, "infantry", "sniper", "buff", "soldier"],
  ["medic", "\u519B\u533B", 2, "infantry", "support", "heal", "soldier"],
  ["grenadier", "\u6295\u5F39\u624B", 2, "infantry", "blast", "damage", "soldier"],
  ["commando", "\u7279\u79CD\u5175", 4, "infantry", "sniper", "damage", "soldier"],
  ["lion", "\u72C2\u72EE", 3, "beast", "guard", "stun", "beast"],
  ["deer", "\u957F\u751F\u9E7F", 1, "beast", "support", "heal", "beast"],
  ["wolf", "\u9B3C\u72FC", 2, "beast", "guard", "summon", "beast"],
  ["pangolin", "\u7A7F\u5C71\u7532", 2, "beast", "sniper", "dash", "beast"],
  ["venom", "\u731B\u6BD2\u517D", 4, "beast", "blast", "poison", "beast"],
  ["dog", "\u94C1\u72D7", 1, "armor", "blast", "damage", "mech"],
  ["ape", "\u94C1\u733F", 3, "armor", "guard", "shield", "mech"],
  ["tank", "\u6295\u77F3\u8F66", 3, "armor", "sniper", "buff", "mech"],
  ["titan", "\u94C1\u5DE8\u795E", 5, "armor", "blast", "damage", "mech"],
  ["repair", "\u7EF4\u4FEE\u673A", 2, "armor", "support", "heal", "mech"],
  ["sage", "\u5929\u5E08", 2, "psionic", "blast", "damage", "mystic"],
  ["child", "\u7AE5\u5B50", 1, "psionic", "support", "buff", "mystic"],
  ["thunder", "\u96F7\u9707\u5B50", 3, "psionic", "sniper", "damage", "mystic"],
  ["master", "\u771F\u4EBA", 4, "psionic", "guard", "summon", "mystic"],
  ["turtle", "\u7384\u9F9F", 5, "psionic", "guard", "shield", "mystic"]
];
var COMBAT_VISUALS = {
  shield: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: "shield-bash",
      skill: "shield-quake",
      primary: 9367249,
      secondary: 16766852
    }
  },
  gunner: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 0, recoveryTicks: 4 },
    combatVisual: {
      attack: "gunner-tracer",
      skill: "gunner-overdrive",
      primary: 16765803,
      secondary: 16740165
    }
  },
  medic: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: "medic-pulse",
      skill: "medic-injector",
      primary: 7729340,
      secondary: 14286833
    }
  },
  grenadier: {
    attackTiming: { windupTicks: 4, travelTicks: 5, recoveryTicks: 4 },
    skillTiming: { windupTicks: 6, travelTicks: 6, recoveryTicks: 5 },
    combatVisual: {
      attack: "grenadier-shell",
      skill: "grenadier-burst",
      primary: 16751442,
      secondary: 4993832
    }
  },
  commando: {
    attackTiming: { windupTicks: 5, travelTicks: 2, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 2, recoveryTicks: 6 },
    combatVisual: {
      attack: "commando-shot",
      skill: "commando-rail",
      primary: 9367295,
      secondary: 16777215
    }
  },
  lion: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: "lion-claw",
      skill: "lion-roar",
      primary: 16102476,
      secondary: 9127977
    }
  },
  deer: {
    attackTiming: { windupTicks: 3, travelTicks: 4, recoveryTicks: 3 },
    skillTiming: { windupTicks: 6, travelTicks: 4, recoveryTicks: 5 },
    combatVisual: {
      attack: "deer-spark",
      skill: "deer-bloom",
      primary: 10285195,
      secondary: 15794096
    }
  },
  wolf: {
    attackTiming: { windupTicks: 3, travelTicks: 0, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: "wolf-rake",
      skill: "wolf-rift",
      primary: 10386687,
      secondary: 3418447
    }
  },
  pangolin: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 4 },
    skillTiming: { windupTicks: 5, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: "pangolin-roll",
      skill: "pangolin-dash",
      primary: 15055215,
      secondary: 7756091
    }
  },
  venom: {
    attackTiming: { windupTicks: 4, travelTicks: 5, recoveryTicks: 4 },
    skillTiming: { windupTicks: 6, travelTicks: 6, recoveryTicks: 5 },
    combatVisual: {
      attack: "venom-spit",
      skill: "venom-pool",
      primary: 9298780,
      secondary: 4665436
    }
  },
  dog: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: "dog-cannon",
      skill: "dog-charge",
      primary: 16747093,
      secondary: 5464427
    }
  },
  ape: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: "ape-punch",
      skill: "ape-hexguard",
      primary: 7527916,
      secondary: 11139071
    }
  },
  tank: {
    attackTiming: { windupTicks: 5, travelTicks: 6, recoveryTicks: 5 },
    skillTiming: { windupTicks: 6, travelTicks: 0, recoveryTicks: 5 },
    combatVisual: {
      attack: "tank-boulder",
      skill: "tank-overdrive",
      primary: 15837531,
      secondary: 5858668
    }
  },
  titan: {
    attackTiming: { windupTicks: 5, travelTicks: 5, recoveryTicks: 5 },
    skillTiming: { windupTicks: 9, travelTicks: 7, recoveryTicks: 7 },
    combatVisual: {
      attack: "titan-shell",
      skill: "titan-bombard",
      primary: 16740424,
      secondary: 16765042
    }
  },
  repair: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: "repair-bolt",
      skill: "repair-beam",
      primary: 6547420,
      secondary: 14811124
    }
  },
  sage: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 3, recoveryTicks: 6 },
    combatVisual: {
      attack: "sage-talisman",
      skill: "sage-sigil",
      primary: 13805311,
      secondary: 16766844
    }
  },
  child: {
    attackTiming: { windupTicks: 3, travelTicks: 4, recoveryTicks: 3 },
    skillTiming: { windupTicks: 6, travelTicks: 0, recoveryTicks: 5 },
    combatVisual: {
      attack: "child-orb",
      skill: "child-energy",
      primary: 12033279,
      secondary: 7794687
    }
  },
  thunder: {
    attackTiming: { windupTicks: 4, travelTicks: 3, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 2, recoveryTicks: 6 },
    combatVisual: {
      attack: "thunder-arc",
      skill: "thunder-strike",
      primary: 8841983,
      secondary: 16774822
    }
  },
  master: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: "master-spirit",
      skill: "master-gate",
      primary: 12950271,
      secondary: 5978755
    }
  },
  turtle: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 0, recoveryTicks: 7 },
    combatVisual: {
      attack: "turtle-wave",
      skill: "turtle-aegis",
      primary: 7202524,
      secondary: 9218303
    }
  }
};
var UNITS = rows.map(([id, name, cost, race, role, kind, shape]) => ({
  attackTiming: COMBAT_VISUALS[id].attackTiming,
  combatVisual: COMBAT_VISUALS[id].combatVisual,
  id,
  name,
  cost,
  poolCount: RULES.poolByCost[cost - 1],
  tags: [race, role],
  hp: 260 + cost * 95 + (role === "guard" ? 180 : 0),
  attack: 30 + cost * 14,
  armor: role === "guard" ? 8 : role === "blast" ? 3 : 4,
  range: role === "guard" ? 1 : role === "sniper" ? 5 : 3,
  attackTicks: role === "sniper" ? 17 : 23,
  moveTicks: 7,
  layer: id === "repair" ? "air" : "ground",
  targets: ["ground", "air"],
  skill: {
    kind,
    power: kind === "summon" ? 1 : 80 + cost * 45,
    radius: role === "blast" ? 2 : 1,
    duration: kind === "poison" ? 80 : 35,
    cooldown: 100,
    timing: COMBAT_VISUALS[id].skillTiming
  },
  assassin: id === "pangolin",
  deathBurst: id === "dog" ? 80 : void 0,
  linger: id === "master" ? 40 : void 0,
  shape,
  color: { infantry: 7915696, beast: 15055215, armor: 10136248, psionic: 11441368 }[race]
}));
var UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]));
var SYNERGIES = [
  {
    id: "infantry",
    effect: "hpPercent",
    values: [15, 30],
    name: "\u6B65\u5175",
    thresholds: [2, 4],
    description: "\u6B65\u5175\u751F\u547D +15% / +30%"
  },
  {
    id: "beast",
    effect: "attackPercent",
    values: [15, 30],
    name: "\u91CE\u517D",
    thresholds: [2, 4],
    description: "\u91CE\u517D\u653B\u51FB +15% / +30%"
  },
  {
    id: "armor",
    effect: "armor",
    values: [4, 8],
    name: "\u88C5\u7532",
    thresholds: [2, 4],
    description: "\u88C5\u7532\u62A4\u7532 +4 / +8"
  },
  {
    id: "psionic",
    effect: "energy",
    values: [30, 60],
    name: "\u7075\u80FD",
    thresholds: [2, 4],
    description: "\u7075\u80FD\u5F00\u573A\u80FD\u91CF +30 / +60"
  },
  {
    id: "guard",
    effect: "shield",
    values: [100, 220],
    name: "\u62A4\u536B",
    thresholds: [2, 4],
    description: "\u62A4\u536B\u5F00\u573A\u62A4\u76FE 100 / 220"
  },
  {
    id: "sniper",
    effect: "haste",
    values: [10, 20],
    name: "\u72D9\u51FB",
    thresholds: [2, 4],
    description: "\u72D9\u51FB\u653B\u51FB\u95F4\u9694 -10% / -20%"
  },
  {
    id: "blast",
    effect: "skillBonus",
    values: [20, 40],
    name: "\u7206\u7834",
    thresholds: [2, 4],
    description: "\u7206\u7834\u6280\u80FD\u4F24\u5BB3 +20% / +40%"
  },
  {
    id: "support",
    effect: "deathHeal",
    values: [50, 100],
    name: "\u652F\u63F4",
    thresholds: [2, 4],
    description: "\u652F\u63F4\u5355\u4F4D\u6B7B\u4EA1\u65F6\u5168\u961F\u6CBB\u7597 50 / 100"
  }
];
var ITEMS = [
  {
    id: "blade",
    name: "\u4FEE\u7F57\u5200",
    description: "\u653B\u51FB +25",
    attack: 25,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0
  },
  {
    id: "shield",
    name: "\u5438\u6536\u78C1\u76FE",
    description: "\u751F\u547D +160 \xB7 \u62A4\u7532 +4",
    attack: 0,
    hp: 160,
    armor: 4,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0
  },
  {
    id: "blood",
    name: "\u8840\u6C60\u4E4B\u4E3B",
    description: "\u5438\u8840 20% \xB7 \u653B\u51FB +10",
    attack: 10,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 20,
    skillBonus: 0
  },
  {
    id: "clock",
    name: "\u5149\u9634\u62A4\u7B26",
    description: "\u653B\u51FB\u95F4\u9694 -15%",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 15,
    lifesteal: 0,
    skillBonus: 0
  },
  {
    id: "book",
    name: "\u795E\u6069\u96C6",
    description: "\u6280\u80FD\u6548\u679C +30%",
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 30
  },
  {
    id: "capsule",
    name: "\u751F\u547D\u80F6\u56CA",
    description: "\u751F\u547D +250",
    attack: 0,
    hp: 250,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0
  }
];
var ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
var PLACEMENT_LIMITS = {
  boardSize: 10,
  deploymentRow: 5,
  benchSize: RULES.benchSize,
  publicSize: RULES.publicSize
};
var CONTENT_HASH = hashValue({ RULES, UNITS, SYNERGIES, ITEMS, PLACEMENT_LIMITS });
function saleValue(unit) {
  const cost = UNIT_BY_ID[unit.defId].cost;
  return unit.star === 1 ? cost : Math.max(1, Math.floor(cost * unit.copies * RULES.salePercent / 100));
}
function validateContent() {
  if (UNITS.length !== 20 || new Set(UNITS.map((u) => u.id)).size !== UNITS.length)
    throw new Error("Expected 20 unique units");
  for (const row of RULES.shopOdds)
    if (row.length !== 5 || row.some((n) => n < 0) || row.reduce((a, b) => a + b, 0) !== 100)
      throw new Error("Invalid shop odds");
  for (const [i, n] of RULES.experience.entries())
    if (i && n <= RULES.experience[i - 1]) throw new Error("Invalid XP thresholds");
  for (const u of UNITS)
    if (u.cost < 1 || u.cost > 5 || !Number.isInteger(u.poolCount) || u.poolCount < 1 || u.hp <= 0 || u.attackTicks < 1 || u.tags.some((t) => !SYNERGIES.some((s) => s.id === t)))
      throw new Error(`Invalid unit ${u.id}`);
  const attackVisuals = /* @__PURE__ */ new Set(), skillVisuals = /* @__PURE__ */ new Set();
  for (const u of UNITS) {
    const timings = [u.attackTiming, u.skill.timing];
    if (!u.combatVisual.attack || !u.combatVisual.skill || attackVisuals.has(u.combatVisual.attack) || skillVisuals.has(u.combatVisual.skill) || timings.some(
      (timing) => [timing.windupTicks, timing.travelTicks, timing.recoveryTicks].some(
        (value) => !Number.isInteger(value) || value < 0
      )
    ) || u.attackTiming.windupTicks + u.attackTiming.travelTicks + u.attackTiming.recoveryTicks > u.attackTicks || u.skill.timing.windupTicks + u.skill.timing.travelTicks + u.skill.timing.recoveryTicks > u.skill.cooldown)
      throw new Error(`Invalid combat presentation ${u.id}`);
    attackVisuals.add(u.combatVisual.attack);
    skillVisuals.add(u.combatVisual.skill);
  }
  for (const synergy of SYNERGIES) {
    if (synergy.thresholds.length !== synergy.values.length || synergy.thresholds.some(
      (v, i) => !Number.isInteger(v) || v < 1 || i > 0 && v <= synergy.thresholds[i - 1]
    ) || synergy.values.some((v) => !Number.isFinite(v)))
      throw new Error(`Invalid synergy ${synergy.id}`);
  }
  if (new Set(ITEMS.map((i) => i.id)).size !== ITEMS.length) throw new Error("Duplicate item IDs");
  for (const item of ITEMS)
    for (const value of [
      item.attack,
      item.hp,
      item.armor,
      item.haste,
      item.lifesteal,
      item.skillBonus
    ])
      if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid item ${item.id}`);
  for (const u of UNITS)
    if (![
      u.hp,
      u.attack,
      u.armor,
      u.range,
      u.attackTicks,
      u.moveTicks,
      u.skill.power,
      u.skill.radius,
      u.skill.duration,
      u.skill.cooldown
    ].every(Number.isInteger) || u.moveTicks < 1 || u.skill.cooldown < 1 || !u.targets.length)
      throw new Error(`Invalid combat stats ${u.id}`);
  for (let cost = 1; cost <= 5; cost++)
    if (!UNITS.some((u) => u.cost === cost)) throw new Error(`Missing cost ${cost}`);
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
      template: (Number(teamId.split("-")[1]) || 0) % 4,
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
function mergeUnits(s, p) {
  let changed = true;
  while (changed) {
    changed = false;
    const units = playerUnits(s, p.id).filter((u) => u.position.zone !== "public").sort(
      (a, b) => (a.position.zone === "board" ? 0 : 1) - (b.position.zone === "board" ? 0 : 1) || compareId(a.id, b.id)
    );
    for (const keeper of units) {
      if (keeper.star >= 3) continue;
      const group = units.filter((u) => u.defId === keeper.defId && u.star === keeper.star).slice(0, 3);
      if (group.length < 3) continue;
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
      return;
    }
    const pos = c.position;
    u.ownerId = decision.ownerId;
    u.position = pos.zone === "board" ? { zone: "board", x: pos.x, y: pos.y } : { zone: pos.zone, slot: pos.slot };
    u.version++;
    mergeUnits(s, s.players[u.ownerId]);
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
  { name: "\u6B65\u5175\u4EA4\u53C9\u706B\u529B", race: "infantry", jobs: ["guard", "sniper"] },
  { name: "\u91CE\u517D\u5171\u751F", race: "beast", jobs: ["guard", "support"] },
  { name: "\u88C5\u7532\u70AE\u9635", race: "armor", jobs: ["guard", "blast"] },
  { name: "\u7075\u80FD\u5171\u632F", race: "psionic", jobs: ["blast", "support"] }
];
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
function entity(unit, side, counts) {
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
    deathHeal: 0
  };
  for (const tag of def.tags) {
    const synergy = SYNERGIES.find((s) => s.id === tag);
    modifiers[synergy.effect] += synergyValue(counts, tag);
  }
  let hp = Math.floor(def.hp * scale / 100), attack = Math.floor(def.attack * scale / 100), armor = def.armor, haste = modifiers.haste, life = 0, skill = modifiers.skillBonus;
  for (const id of unit.items) {
    const i = ITEM_BY_ID[id];
    hp += i.hp;
    attack += i.attack;
    armor += i.armor;
    haste += i.haste;
    life += i.lifesteal;
    skill += i.skillBonus;
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
    x: unit.x,
    y: unit.y,
    hp,
    maxHp: hp,
    attack,
    armor,
    range: def.range,
    layer: def.layer,
    targets: def.targets,
    energy: modifiers.energy,
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
  const entities = descriptor.sides.flatMap((side, index) => {
    const counts = synergyCounts(side);
    return side.map((u) => entity(u, index, counts));
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
    if (UNIT_BY_ID[u.defId].assassin) {
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
  const applyHit = (hit) => {
    const { source, target, physical } = hit;
    let damage = Math.max(
      1,
      physical ? Math.floor(
        hit.power * RULES.damageArmorBase / (RULES.damageArmorBase + Math.max(0, target.armor) * RULES.armorCoefficient)
      ) : hit.power
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
    target.energy = Math.min(100, target.energy + RULES.hitEnergy);
    emit({ kind: "damage", source: source.id, target: target.id, value: damage });
    if (physical && source.lifesteal && source.hp > 0) {
      const heal = Math.min(
        source.maxHp - source.hp,
        Math.floor(damage * source.lifesteal / 100)
      );
      source.hp += heal;
      if (heal) emit({ kind: "heal", source: source.id, target: source.id, value: heal });
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
    const def = UNIT_BY_ID[source.defId], baseTiming = kind === "attack" ? def.attackTiming : def.skill.timing, scale = kind === "attack" ? source.attackTicks / def.attackTicks : 1, windup = Math.max(1, Math.floor(baseTiming.windupTicks * scale)), travel = Math.max(0, Math.floor(baseTiming.travelTicks * scale)), recovery = Math.max(0, Math.floor(baseTiming.recoveryTicks * scale));
    let actualTarget = target;
    if (kind === "skill" && def.skill.kind === "heal") {
      actualTarget = s.entities.filter((e) => e.side === source.side && alive(e)).sort((a, b) => a.hp * b.maxHp - b.hp * a.maxHp || compareId(a.id, b.id))[0] ?? source;
    } else if (kind === "skill" && ["shield", "buff", "summon"].includes(def.skill.kind)) {
      actualTarget = source;
    }
    let power = source.attack, critical = false;
    if (kind === "attack") {
      s.rng = nextRandom(s.rng);
      critical = !!def.assassin && s.rng % 100 < 20;
      power = Math.floor(
        (source.attack + (source.buffUntil > s.tick ? source.buffPower : 0)) * (critical ? 150 : 100) / 100
      );
      source.energy = Math.min(100, source.energy + RULES.attackEnergy);
      source.nextAttack = s.tick + source.attackTicks;
    } else {
      source.energy -= 100;
      source.nextSkill = s.tick + def.skill.cooldown;
      power = Math.floor(
        def.skill.power * RULES.starScale[source.star - 1] / 100 * (100 + source.skillBonus) / 100
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
    const action = source.action, def = UNIT_BY_ID[source.defId];
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
      if (alive(source)) {
        source.shield += action.power;
        emit({ kind: "shield", source: source.id, target: source.id, value: action.power });
        emit({ kind: "statusApply", source: source.id, target: source.id, status: "shield" });
      }
    } else if (skill.kind === "buff") {
      if (source.defId === "child") {
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
              defId: "wolf",
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
        hits.push({ source, target, power: action.power, physical: false });
        if (skill.kind === "stun") {
          target.stunUntil = Math.max(target.stunUntil, s.tick + skill.duration);
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
        if (def.linger && !u.summoned) {
          u.hp = 1;
          u.deathAt = s.tick + def.linger;
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
        const support = synergyValue(synergyCounts(s.descriptor.sides[u.side]), "support");
        if (support && def.tags.includes("support") && !u.summoned)
          for (const friend of s.entities.filter((e) => alive(e) && e.side === u.side)) {
            const heal = Math.min(friend.maxHp - friend.hp, support);
            friend.hp += heal;
            if (heal) emit({ kind: "heal", source: u.id, target: friend.id, value: heal });
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
        (e) => e.side !== u.side && u.targets.includes(e.layer) && alive(e)
      );
      let target = enemies.find((e) => e.id === u.targetId);
      if (!target)
        target = enemies.sort(
          (a, b) => (distance(u, a) <= u.range ? 0 : 1) - (distance(u, b) <= u.range ? 0 : 1) || distance(u, a) - distance(u, b) || compareId(a.id, b.id)
        )[0];
      if (!target) continue;
      u.targetId = target.id;
      if (!u.summoned && u.energy >= 100 && s.tick >= u.nextSkill) {
        startAction(u, "skill", target);
      } else if (distance(u, target) <= u.range && s.tick >= u.nextAttack) {
        startAction(u, "attack", target);
      } else if (distance(u, target) > u.range && s.tick >= u.nextMove) {
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

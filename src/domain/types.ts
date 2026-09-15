export type Tag =
  | 'infantry'
  | 'cavalry'
  | 'armor'
  | 'airforce'
  | 'puppet'
  | 'psionic'
  | 'walker'
  | 'marine'
  | 'beast'
  | 'raptor'
  | 'insectoid'
  | 'immortal'
  | 'panda'
  | 'guard'
  | 'blast'
  | 'support'
  | 'sniper'
  | 'siege'
  | 'ability'
  | 'assassin'
  | 'summoner'
  | 'vanguard'
  | 'building'
  | 'fighter';
export type Layer = 'ground' | 'air';
export type SkillKind =
  | 'damage'
  | 'heal'
  | 'shield'
  | 'stun'
  | 'poison'
  | 'summon'
  | 'dash'
  | 'buff'
  | 'charm'
  | 'execute'
  | 'silence'
  | 'armorBreak'
  | 'transform';
export type AbilityTrigger =
  | 'battleStart'
  | 'cast'
  | 'attackHit'
  | 'damaged'
  | 'damageDealt'
  | 'lowHealth'
  | 'death'
  | 'victory';
export type AbilityTarget =
  'self' | 'current' | 'lowestHealthAlly' | 'highestAttackEnemy' | 'allAllies' | 'areaEnemies';
export type AbilityEffectKind =
  | 'physicalDamage'
  | 'skillDamage'
  | 'trueDamage'
  | 'heal'
  | 'shield'
  | 'energy'
  | 'summon'
  | 'dash'
  | 'stun'
  | 'poison'
  | 'silence'
  | 'taunt'
  | 'armor'
  | 'attack'
  | 'haste'
  | 'disableItems'
  | 'execute'
  | 'transform'
  | 'gold';
export interface AbilityEffect {
  trigger: AbilityTrigger;
  target: AbilityTarget;
  kind: AbilityEffectKind;
  value: number;
  duration?: number;
  radius?: number;
  summonId?: string;
}
export interface ActionTiming {
  windupTicks: number;
  travelTicks: number;
  recoveryTicks: number;
}
export interface CombatVisualDefinition {
  attack: string;
  skill: string;
  primary: number;
  secondary: number;
}
export interface Skill {
  name: string;
  description: string;
  kind: SkillKind;
  power: number;
  radius: number;
  duration: number;
  cooldown: number;
  timing: ActionTiming;
  effects: AbilityEffect[];
}
export interface UnitDefinition {
  id: string;
  name: string;
  cost: number;
  poolCount: number;
  tags: Tag[];
  hp: number;
  attack: number;
  armor: number;
  range: number;
  attackTicks: number;
  attackTiming: ActionTiming;
  moveTicks: number;
  layer: Layer;
  targets: Layer[];
  skill: Skill;
  assassin?: boolean;
  deathBurst?: number;
  linger?: number;
  immobile?: boolean;
  noAttack?: boolean;
  summonId?: string;
  shape: 'soldier' | 'beast' | 'mech' | 'mystic' | 'building' | 'insect' | 'panda' | 'fighter';
  color: number;
  combatVisual: CombatVisualDefinition;
}
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  attack: number;
  hp: number;
  armor: number;
  haste: number;
  lifesteal: number;
  skillBonus: number;
  skillResist?: number;
  cooldown?: number;
  noSkill?: boolean;
  damageTakenSkill?: number;
  onHitRamp?: number;
  silenceEnergy?: number;
  emergencyImmunity?: number;
  effects: AbilityEffect[];
}
export interface SynergyDefinition {
  id: Tag;
  name: string;
  thresholds: number[];
  effect:
    | 'hpPercent'
    | 'attackPercent'
    | 'armor'
    | 'energy'
    | 'shield'
    | 'haste'
    | 'skillBonus'
    | 'deathHeal'
    | 'enemyArmor'
    | 'dodge'
    | 'reflect'
    | 'skillResist'
    | 'groundBonus'
    | 'merge'
    | 'linger'
    | 'fullEnergy'
    | 'enemySkillResist'
    | 'armorPen'
    | 'siegeBonus'
    | 'enemyEnergyGain'
    | 'critical'
    | 'summonEnergy'
    | 'regen'
    | 'cooldown'
    | 'extreme';
  scope: 'selfTag' | 'allAllies' | 'allEnemies' | 'rule';
  values: number[];
  description: string;
}
export type Position =
  { zone: 'board'; x: number; y: number } | { zone: 'bench' | 'public'; slot: number };
export interface UnitInstance {
  id: string;
  defId: string;
  ownerId: string;
  teamId: string;
  star: number;
  copies: number;
  version: number;
  position: Position;
  items: string[];
}
export interface BotMemory {
  template: number;
  commands: number;
  refreshes: number;
  serial: number;
  log: string[];
}
export interface PlayerState {
  id: string;
  name: string;
  teamId: string;
  seat: number;
  bot: boolean;
  gold: number;
  level: number;
  exp: number;
  shop: (string | null)[];
  shopVersion: number;
  shopLocked: boolean;
  shopRng: number;
  streak: number;
  items: string[];
  ready: boolean;
  demand: string | null;
  botMemory: BotMemory;
}
export interface TeamState {
  id: string;
  name: string;
  players: string[];
  hp: number;
  wins: number;
  eliminatedRound: number | null;
  lastOpponent: string | null;
  rank: number | null;
}
export interface Command {
  commandId: string;
  round: number;
  type: 'buy' | 'refresh' | 'lock' | 'xp' | 'move' | 'swap' | 'sell' | 'equip' | 'ready' | 'demand';
  slot?: number;
  shopVersion?: number;
  unitId?: string;
  unitVersion?: number;
  targetId?: string;
  targetVersion?: number;
  benchOwnerId?: string;
  position?: Position;
  itemSlot?: number;
  itemId?: string;
  defId?: string | null;
}
export interface CommandResult {
  commandId: string;
  ok: boolean;
  reason: string;
}
export interface BattleUnit {
  id: string;
  defId: string;
  ownerId: string;
  star: number;
  x: number;
  y: number;
  items: string[];
}
export interface BattleDescriptor {
  id: string;
  round: number;
  seed: number;
  rulesetId: string;
  contentHash: string;
  simulationVersion: string;
  teams: [string, string];
  mirror: boolean;
  neutral: boolean;
  sides: [BattleUnit[], BattleUnit[]];
}
export interface CombatEntity {
  id: string;
  defId: string;
  ownerId: string;
  side: 0 | 1;
  star: number;
  summoned: boolean;
  items: string[];
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  armor: number;
  range: number;
  layer: Layer;
  targets: Layer[];
  energy: number;
  attackTicks: number;
  nextAttack: number;
  nextMove: number;
  nextSkill: number;
  targetId: string | null;
  shield: number;
  stunUntil: number;
  poisonUntil: number;
  poisonPower: number;
  buffUntil: number;
  buffPower: number;
  lifesteal: number;
  skillBonus: number;
  cooldownReduction: number;
  dodge: number;
  reflect: number;
  skillResist: number;
  armorPen: number;
  energyGain: number;
  regen: number;
  criticalChance: number;
  criticalPower: number;
  silencedUntil: number;
  tauntedBy: string | null;
  tauntedUntil: number;
  armorDebuff: number;
  itemsDisabledUntil: number;
  skillTakenBonus: number;
  rampTargetId: string | null;
  rampPower: number;
  extremeTriggered: boolean;
  trueAttack: boolean;
  groundBonus: number;
  siegeBonus: number;
  summonEnergy: number;
  lingerTicks: number;
  noSkill: boolean;
  emergencyImmunity: number;
  immunityUsed: boolean;
  immunityUntil: number;
  deathHeal: number;
  extremePower: number;
  deathAt: number | null;
  deathTriggered: boolean;
  deathBurstAt: number | null;
  action: CombatAction | null;
}
export type CombatActionKind = 'attack' | 'skill';
export interface CombatAction {
  id: number;
  kind: CombatActionKind;
  skillKind?: SkillKind;
  targetId?: string;
  targetX: number;
  targetY: number;
  startedAt: number;
  releaseAt: number;
  impactAt: number;
  recoverAt: number;
  released: boolean;
  power: number;
  physical: boolean;
  critical: boolean;
}
export interface BattleEvent {
  tick: number;
  kind:
    | 'move'
    | 'entry'
    | 'actionStart'
    | 'actionRelease'
    | 'actionImpact'
    | 'actionCancel'
    | 'damage'
    | 'heal'
    | 'shield'
    | 'shieldAbsorb'
    | 'shieldBreak'
    | 'statusApply'
    | 'statusRemove'
    | 'critical'
    | 'deathBurst'
    | 'deathBurstImpact'
    | 'death'
    | 'spawn';
  source: string;
  target?: string;
  value?: number;
  x?: number;
  y?: number;
  actionId?: number;
  action?: CombatActionKind;
  skillKind?: SkillKind;
  status?:
    | 'stun'
    | 'poison'
    | 'buff'
    | 'energy'
    | 'shield'
    | 'linger'
    | 'silence'
    | 'taunt'
    | 'armorBreak'
    | 'itemsDisabled'
    | 'extreme';
  until?: number;
  releaseTick?: number;
  impactTick?: number;
  recoverTick?: number;
}
export interface BattleResult {
  id: string;
  winner: 0 | 1 | null;
  ticks: number;
  damage: [number, number];
  survivors: string[];
  hash: string;
  diagnostics: string[];
}
export interface BattleState {
  descriptor: BattleDescriptor;
  tick: number;
  rng: number;
  entities: CombatEntity[];
  done: boolean;
  serial: number;
  actionSerial: number;
  entries: { source: string; fromX: number; fromY: number }[];
  diagnostics: string[];
  eventHash: number;
}
export interface GameState {
  rulesetId: string;
  contentHash: string;
  simulationVersion: string;
  seed: number;
  phase: 'waiting' | 'prep' | 'battle' | 'settlement' | 'finished' | 'error';
  round: number;
  deadline: number;
  playbackEpoch: number;
  players: Record<string, PlayerState>;
  teams: Record<string, TeamState>;
  units: Record<string, UnitInstance>;
  pool: Record<string, number>;
  nextUnit: number;
  battles: BattleDescriptor[];
  results: Record<string, BattleResult>;
  settledRound: number;
  receipts: Record<string, CommandResult[]>;
  rewardRng: number;
  error: string | null;
  lastSummary: string[];
  botCursor: number;
}

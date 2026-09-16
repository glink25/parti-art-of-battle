import u0 from './units/kong';
import u1 from './units/shield';
import u2 from './units/lion';
import u3 from './units/shield_slave';
import u4 from './units/staff_slave';
import u5 from './units/sage';
import u6 from './units/dog';
import u7 from './units/burstbug';
import u8 from './units/ape';
import u9 from './units/motor';
import u10 from './units/bomber';
import u11 from './units/titan';
import u12 from './units/child';
import u13 from './units/medic';
import u14 from './units/repair';
import u15 from './units/deer';
import u16 from './units/gunner';
import u17 from './units/bird_rider';
import u18 from './units/thunder';
import u19 from './units/arhat';
import u20 from './units/commando';
import u21 from './units/bat';
import u22 from './units/killerbee';
import u23 from './units/aircrab';
import u24 from './units/tank';
import u25 from './units/dragon';
import u26 from './units/ark';
import u27 from './units/bone_dragon';
import u28 from './units/whale';
import u29 from './units/eye';
import u30 from './units/spider';
import u31 from './units/vine';
import u32 from './units/eel';
import u33 from './units/grenadier';
import u34 from './units/zen_panda';
import u35 from './units/toad';
import u36 from './units/axe_slave';
import u37 from './units/pangolin';
import u38 from './units/osprey';
import u39 from './units/ghost';
import u40 from './units/ninja_panda';
import u41 from './units/iron_chicken';
import u42 from './units/master';
import u43 from './units/wolf';
import u44 from './units/shark';
import u45 from './units/monk_panda';
import u46 from './units/mammoth';
import u47 from './units/sword_slave';
import u48 from './units/flame';
import u49 from './units/venom';
import u50 from './units/blade_slave';
import u51 from './units/blood_eagle';
import u52 from './units/tree';
import u53 from './units/alchemy_tower';
import u54 from './units/divine_tower';
import u55 from './units/transform_tower';
import u56 from './units/ukyo';
import u57 from './units/nakoruru';
import u58 from './units/athena';
import u59 from './units/turtle';
import u60 from './units/bull';
import u61 from './units/buddha';
import type { UnitArtDefinition } from './core/types';

const modules = [
  u0,
  u1,
  u2,
  u3,
  u4,
  u5,
  u6,
  u7,
  u8,
  u9,
  u10,
  u11,
  u12,
  u13,
  u14,
  u15,
  u16,
  u17,
  u18,
  u19,
  u20,
  u21,
  u22,
  u23,
  u24,
  u25,
  u26,
  u27,
  u28,
  u29,
  u30,
  u31,
  u32,
  u33,
  u34,
  u35,
  u36,
  u37,
  u38,
  u39,
  u40,
  u41,
  u42,
  u43,
  u44,
  u45,
  u46,
  u47,
  u48,
  u49,
  u50,
  u51,
  u52,
  u53,
  u54,
  u55,
  u56,
  u57,
  u58,
  u59,
  u60,
  u61,
];
export const UNIT_ART = Object.fromEntries(modules.map((art) => [art.id, art])) as Record<
  string,
  UnitArtDefinition
>;
export const UNIT_ART_MODULES = modules;

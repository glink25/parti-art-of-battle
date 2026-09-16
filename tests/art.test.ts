import assert from 'node:assert/strict';
import test from 'node:test';
import { UNITS } from '../src/content';
import { UNIT_ART, UNIT_ART_MODULES } from '../src/client/art/registry';

const REFINED = ['ukyo', 'wolf', 'titan', 'bone_dragon', 'divine_tower'];
const DETAILED = ['ukyo', 'wolf', 'bone_dragon'];

test('every unit owns a complete independent procedural art module', () => {
  assert.equal(UNIT_ART_MODULES.length, UNITS.length);
  assert.deepEqual([...Object.keys(UNIT_ART)].sort(), UNITS.map((unit) => unit.id).sort());
  assert.equal(new Set(UNIT_ART_MODULES.map((art) => art.signature)).size, UNITS.length);
  assert.equal(
    new Set(UNIT_ART_MODULES.map((art) => JSON.stringify([art.motion, art.attack, art.skill])))
      .size,
    UNITS.length,
  );
  for (const art of UNIT_ART_MODULES) {
    assert.ok(art.parts.length >= 4, `${art.id} needs a complete silhouette`);
    assert.equal(
      new Set(art.parts.map((part) => part.name)).size,
      art.parts.length,
      `${art.id} has duplicate named parts`,
    );
    assert.ok(
      art.parts.some((part) => part.emissive),
      `${art.id} needs an energy focal point`,
    );
    assert.ok(art.attack.particles > 0 && art.skill.particles > art.attack.particles);
    const names = new Set(art.parts.map((part) => part.name));
    for (const part of art.parts)
      if (part.parent)
        assert.ok(names.has(part.parent), `${art.id}.${part.name} has missing parent`);
    for (const [kind, clip] of Object.entries(art.clips ?? {})) {
      assert.ok(clip.tracks.length, `${art.id}.${kind} needs animation tracks`);
      for (const track of clip.tracks) {
        assert.ok(names.has(track.part), `${art.id}.${kind} targets missing part ${track.part}`);
        assert.ok(track.keyframes.length >= 2, `${art.id}.${kind}.${track.part} needs keyframes`);
        assert.equal(track.keyframes[0].at, 0);
        assert.equal(track.keyframes.at(-1)?.at, 1);
        assert.ok(
          track.keyframes.every(
            (frame, index, frames) =>
              frame.at >= 0 && frame.at <= 1 && (!index || frame.at >= frames[index - 1].at),
          ),
        );
      }
    }
    for (const [kind, anchor] of Object.entries(art.anchors ?? {}))
      assert.ok(names.has(anchor), `${art.id}.${kind} targets missing anchor ${anchor}`);
  }
});

test('the representative art set has articulated model, attack and skill definitions', () => {
  for (const id of REFINED) {
    const art = UNIT_ART[id];
    assert.ok(art.parts.length >= 15, `${id} needs a refined silhouette`);
    assert.ok(
      art.parts.some((part) => part.parent),
      `${id} needs a part hierarchy`,
    );
    assert.ok(art.clips?.attack?.tracks.length, `${id} needs an authored attack clip`);
    assert.ok(art.clips?.skill?.tracks.length, `${id} needs an authored skill clip`);
    assert.ok(art.anchors?.attack && art.anchors.skill, `${id} needs effect anchors`);
  }
});

test('the detailed model pass has production-oriented anatomy and procedural profiles', () => {
  for (const id of DETAILED) {
    const art = UNIT_ART[id];
    assert.ok(art.parts.length >= 40, `${id} needs enough authored parts for close inspection`);
    assert.ok(
      art.parts.some((part) => ['muscle', 'roundedBox', 'wedge'].includes(part.primitive)),
      `${id} needs a non-basic procedural profile`,
    );
    const byName = new Map(art.parts.map((part) => [part.name, part]));
    const depth = (name: string): number => {
      const parent = byName.get(name)?.parent;
      return parent ? 1 + depth(parent) : 1;
    };
    assert.ok(
      Math.max(...art.parts.map((part) => depth(part.name))) >= 4,
      `${id} needs multi-joint articulation`,
    );
  }
});

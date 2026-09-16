import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { GameResources } from '../src/client/resources';
import { UNIT_ART } from '../src/client/art/registry';
import { sampleClip } from '../src/client/art/core/model';

test('titan rests at ground level and its shoulder cannon faces forward', () => {
  const resources = new GameResources();
  try {
    const model = resources.unit('titan');
    model.updateMatrixWorld(true);
    for (const name of ['footL', 'footR']) {
      const bounds = new THREE.Box3().setFromObject(model.userData.parts.get(name)!);
      assert.ok(bounds.min.y >= -0.01 && bounds.min.y < 0.04, `${name} must rest at ground level`);
    }
    const mount = model.userData.parts.get('cannonMount')!.getWorldPosition(new THREE.Vector3());
    const muzzle = model.userData.parts.get('muzzle')!.getWorldPosition(new THREE.Vector3());
    assert.ok(muzzle.z < mount.z - 0.7, 'muzzle projects forward, not upward');
    assert.ok(Math.abs(muzzle.y - mount.y) < 0.08);
  } finally {
    resources.dispose();
  }
});

test('puppet feet are grounded and held weapons follow the animated hand', () => {
  const resources = new GameResources();
  try {
    for (const [id, weapon, hand] of [
      ['shield_slave', 'gate', 'armLEnd'],
      ['staff_slave', 'staff', 'armREnd'],
      ['sword_slave', 'sword', 'armREnd'],
      ['axe_slave', 'axeR', 'armREnd'],
      ['blade_slave', 'bladeR', 'armREnd'],
    ]) {
      const model = resources.unit(id, 0, 0, 3);
      model.updateMatrixWorld(true);
      for (const boot of ['bootL', 'bootR']) {
        const bounds = new THREE.Box3().setFromObject(model.userData.parts.get(boot)!);
        assert.ok(bounds.min.y >= -0.01 && bounds.min.y < 0.04, `${id}.${boot} is not grounded`);
      }
      const held = model.userData.parts.get(weapon)!;
      const grip = model.userData.parts.get(hand)!;
      assert.equal(held.parent, grip, `${id} weapon must be attached to a hand`);
      const rest = held.getWorldPosition(new THREE.Vector3());
      const localGripOffset = held.position.clone();
      for (const kind of ['attack', 'skill'] as const) {
        sampleClip(model, model.userData.art.clips![kind]!, 0.56);
        model.updateMatrixWorld(true);
        const posed = held.getWorldPosition(new THREE.Vector3());
        assert.ok(posed.distanceTo(rest) > 0.015, `${id}.${kind} must animate the held weapon`);
        assert.ok(
          grip.worldToLocal(posed).distanceTo(localGripOffset) < 1e-6,
          `${id} loses its grip`,
        );
      }
      const crown = model.getObjectByName('three-star-crown')!;
      const top = Math.max(
        ...[...model.userData.parts.values()].map(
          (part) => new THREE.Box3().setFromObject(part).max.y,
        ),
      );
      assert.ok(crown.position.y > top, `${id} crown must not hide inside its head or weapon`);
    }
  } finally {
    resources.dispose();
  }
});

test('infantry upper-body actions keep feet grounded and firearm muzzles forward', () => {
  const resources = new GameResources();
  try {
    for (const id of ['shield', 'gunner', 'commando', 'grenadier', 'flame', 'medic']) {
      for (const kind of ['attack', 'skill'] as const) {
        const model = resources.unit(id);
        model.updateMatrixWorld(true);
        const feet = ['bootL', 'bootR'].map((name) => model.userData.parts.get(name)!);
        const restFeet = feet.map((foot) => foot.getWorldPosition(new THREE.Vector3()));
        const anchor = model.userData.parts.get(model.userData.art.anchors![kind]!)!;
        const restAnchor = anchor.getWorldPosition(new THREE.Vector3());
        for (const phase of [0, 0.3, 0.56, 0.8, 1]) {
          sampleClip(model, model.userData.art.clips![kind]!, phase);
          model.updateMatrixWorld(true);
          feet.forEach((foot, index) => {
            assert.ok(
              foot.getWorldPosition(new THREE.Vector3()).distanceTo(restFeet[index]) < 1e-6,
              `${id} foot slides during ${kind}`,
            );
            const bounds = new THREE.Box3().setFromObject(foot);
            assert.ok(bounds.min.y >= -0.01 && bounds.min.y < 0.04, `${id} foot is not grounded`);
          });
          if (phase === 0.56)
            assert.ok(
              anchor.getWorldPosition(new THREE.Vector3()).distanceTo(restAnchor) > 0.01,
              `${id}.${kind} must articulate its effect anchor`,
            );
        }
        if (['gunner', 'commando', 'grenadier', 'flame'].includes(id)) {
          const muzzle = model.userData.parts.get('muzzle')!.getWorldPosition(new THREE.Vector3());
          const hand = model.userData.parts.get('armREnd')!.getWorldPosition(new THREE.Vector3());
          assert.ok(muzzle.z < hand.z - 0.4, `${id} muzzle must face forward`);
        }
      }
    }
  } finally {
    resources.dispose();
  }
});

test('authored profiles retain open windows and distinct cached silhouettes', () => {
  const resources = new GameResources();
  try {
    const tower = resources.unit('divine_tower');
    const titan = resources.unit('titan');
    const mesh = (model: typeof tower, name: string) =>
      model.getObjectByName(`${name}:geometry`) as THREE.Mesh;
    const window = mesh(tower, 'arcade0');
    assert.notEqual(window.geometry, mesh(titan, 'torso').geometry);
    assert.equal(window.geometry, mesh(tower, 'arcade1').geometry);
    // Isolate the window mesh: a ray through its opening must pass through,
    // whereas the same ray through the carved jamb must hit actual geometry.
    const isolated = new THREE.Mesh(
      window.geometry,
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    );
    isolated.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 2), new THREE.Vector3(0, 0, -1));
    assert.equal(ray.intersectObject(isolated).length, 0);
    ray.ray.origin.x = 0.43;
    assert.ok(ray.intersectObject(isolated).length > 0);
    isolated.material.dispose();
  } finally {
    resources.dispose();
  }
});

test('mechanical actions preserve ground contacts and return effect anchors to rest', () => {
  const resources = new GameResources();
  const contacts: Record<string, string[]> = {
    dog: ['leg-1-0.25Foot', 'leg1-0.25Foot', 'leg-10.27Foot', 'leg10.27Foot'],
    ape: ['footL', 'footR'],
    motor: ['wheel-0.46', 'wheel0.43'],
    tank: ['track-1', 'track1'],
    iron_chicken: ['legLEnd', 'legREnd'],
    repair: [],
  };
  try {
    for (const [id, names] of Object.entries(contacts)) {
      for (const kind of ['attack', 'skill'] as const) {
        const model = resources.unit(id);
        model.updateMatrixWorld(true);
        const get = (name: string) => model.userData.parts.get(name)!;
        const feet = names.map((name) => get(name).getWorldPosition(new THREE.Vector3()));
        const anchor = get(model.userData.art.anchors![kind]!);
        const rest = anchor.getWorldPosition(new THREE.Vector3());
        for (const phase of [0, 0.3, 0.56, 0.8, 1]) {
          sampleClip(model, model.userData.art.clips![kind]!, phase);
          model.updateMatrixWorld(true);
          names.forEach((name, i) =>
            assert.ok(
              get(name).getWorldPosition(new THREE.Vector3()).distanceTo(feet[i]) < 1e-6,
              `${id}.${kind} moves ground contact ${name}`,
            ),
          );
          const distance = anchor.getWorldPosition(new THREE.Vector3()).distanceTo(rest);
          if (phase === 0.56)
            assert.ok(distance > 0.01, `${id}.${kind} anchor does not articulate`);
          if (phase === 1) assert.ok(distance < 1e-6, `${id}.${kind} does not return to rest`);
        }
      }
    }
  } finally {
    resources.dispose();
  }
});

test('aircraft payloads and tower mechanisms animate without moving their fixed bases', () => {
  const resources = new GameResources();
  try {
    for (const id of ['bomber', 'aircrab', 'ark', 'ghost', 'transform_tower', 'alchemy_tower']) {
      for (const kind of ['attack', 'skill'] as const) {
        const model = resources.unit(id);
        model.updateMatrixWorld(true);
        const anchor = model.userData.parts.get(model.userData.art.anchors![kind]!)!;
        const origin = anchor.getWorldPosition(new THREE.Vector3());
        const base = model.userData.parts.get('base');
        const baseBounds = base ? new THREE.Box3().setFromObject(base.children[0]) : undefined;
        const rest = new Map(
          [...model.userData.parts].map(([name, part]) => [name, part.matrixWorld.clone()]),
        );
        for (const phase of [0, 0.3, 0.56, 0.8, 1]) {
          sampleClip(model, model.userData.art.clips![kind]!, phase);
          model.updateMatrixWorld(true);
          const displacement = anchor.getWorldPosition(new THREE.Vector3()).distanceTo(origin);
          if (phase === 0.56)
            assert.ok(displacement > 0.01, `${id}.${kind} effect must follow its mechanism`);
          if (base && baseBounds) {
            assert.ok(base.matrixWorld.equals(rest.get('base')!), `${id} moves its foundation`);
            assert.ok(
              baseBounds.min.y >= -0.01 && baseBounds.min.y < 0.03,
              `${id} foundation is not grounded`,
            );
          }
          if (phase === 1)
            for (const [name, part] of model.userData.parts) {
              assert.ok(
                part.matrixWorld.elements.every(
                  (value, i) => Math.abs(value - rest.get(name)!.elements[i]) < 1e-6,
                ),
                `${id}.${name} does not return to rest`,
              );
            }
        }
      }
    }
    const bomber = resources.unit('bomber');
    assert.equal(
      bomber.userData.parts.get('rudder')!.parent,
      bomber.userData.parts.get('fuselage'),
    );
    const tower = resources.unit('transform_tower');
    for (let i = 0; i < 4; i++)
      assert.equal(
        tower.userData.parts.get('panel' + i)!.parent,
        tower.userData.parts.get('hinge' + i),
      );
  } finally {
    resources.dispose();
  }
});

test('all 62 models have no pedestal or floor star trim at any rank', () => {
  const resources = new GameResources();
  try {
    for (const id of Object.keys(UNIT_ART)) {
      const model = resources.unit(id);
      for (const rank of [1, 2, 3, 1]) {
        resources.setStar(model, rank);
        assert.equal(model.getObjectByName('team-base'), undefined, id);
        assert.equal(model.getObjectByName('two-star-trim'), undefined, id);
        const upgrade = model.getObjectByName('star-upgrade')!;
        assert.equal(upgrade.visible, rank >= 2);
        const marker = model.getObjectByName('two-star-marker')!;
        const crown = model.getObjectByName('three-star-crown')!;
        assert.equal(marker.visible, rank >= 2);
        assert.equal(crown.visible, rank >= 3);
        model.updateMatrixWorld(true);
        const top = new THREE.Box3().setFromObject(model.getObjectByName('artwork')!).max.y;
        assert.ok(
          marker.position.y - 0.075 > top && crown.position.y - 0.13 > top,
          `${id} promotion badges overlap artwork`,
        );
      }
    }
  } finally {
    resources.dispose();
  }
});

test('beasts keep supporting feet grounded and curved anatomy has distinct finite geometry', () => {
  const resources = new GameResources();
  try {
    for (const id of ['lion', 'deer', 'wolf', 'mammoth']) {
      const model = resources.unit(id);
      model.updateMatrixWorld(true);
      const suffix = id === 'deer' ? 'Hoof' : id === 'mammoth' ? 'Foot' : 'Paw';
      const feet = ['foreL', 'foreR', 'hindL', 'hindR'].map((name) =>
        model.userData.parts.get(name + suffix)!,
      );
      const origins = feet.map((foot) => foot.getWorldPosition(new THREE.Vector3()));
      for (const foot of feet) {
        const bounds = new THREE.Box3().setFromObject(foot);
        assert.ok(
          bounds.min.y > -0.015 && bounds.min.y < 0.025,
          `${id}.${foot.name} not on ground: ${bounds.min.y}`,
        );
      }
      for (const kind of ['attack', 'skill'] as const) {
        const anchor = model.userData.parts.get(model.userData.art.anchors![kind]!)!;
        const rest = anchor.getWorldPosition(new THREE.Vector3());
        for (const phase of [0, 0.3, 0.56, 0.8, 1]) {
          sampleClip(model, model.userData.art.clips![kind]!, phase);
          model.updateMatrixWorld(true);
          feet.forEach((foot, i) => {
            if (id === 'lion' && kind === 'attack' && i === 1) return; // Deliberate forepaw swipe.
            assert.ok(
              foot.getWorldPosition(new THREE.Vector3()).distanceTo(origins[i]) < 1e-6,
              `${id} supporting foot slides`,
            );
          });
          const movement = anchor.getWorldPosition(new THREE.Vector3()).distanceTo(rest);
          if (phase === 0.56) assert.ok(movement > 0.01, `${id}.${kind} anchor must move`);
          if (phase === 1) assert.ok(movement < 1e-6);
        }
      }
      for (const part of model.userData.art.parts.filter((part) => part.sweep)) {
        const mesh = model.getObjectByName(part.name + ':geometry') as THREE.Mesh;
        assert.ok([...mesh.geometry.getAttribute('position').array].every(Number.isFinite));
        assert.ok([...mesh.geometry.getAttribute('normal').array].every(Number.isFinite));
      }
    }
    const mammoth = resources.unit('mammoth');
    const mesh = (name: string) => mammoth.getObjectByName(name + ':geometry') as THREE.Mesh;
    assert.notEqual(
      mesh('tuskL').geometry,
      mesh('tuskR').geometry,
      'mirrored tusks must not alias in the geometry cache',
    );
    assert.notEqual(mesh('tuskL').geometry, mesh('trunk').geometry);
  } finally {
    resources.dispose();
  }
});

test('second beast batch keeps support feet planted and the bull grips its moving club', () => {
  const resources = new GameResources();
  try {
    for (const id of ['turtle', 'bull', 'venom', 'pangolin']) {
      const model = resources.unit(id);
      model.updateMatrixWorld(true);
      const get = (name: string) => model.userData.parts.get(name)!;
      const names =
        id === 'bull' ? ['hoofL', 'hoofR'] : ['foreLFoot', 'foreRFoot', 'hindLFoot', 'hindRFoot'];
      const feet = names.map(get);
      const restFeet = feet.map((foot) => foot.getWorldPosition(new THREE.Vector3()));
      for (const foot of feet) {
        const bounds = new THREE.Box3().setFromObject(foot);
        assert.ok(
          bounds.min.y > -0.015 && bounds.min.y < 0.025,
          `${id}.${foot.name} is not grounded: ${bounds.min.y}`,
        );
      }
      for (const kind of ['attack', 'skill'] as const) {
        const anchor = get(model.userData.art.anchors![kind]!);
        const origin = anchor.getWorldPosition(new THREE.Vector3());
        for (const phase of [0, 0.3, 0.56, 0.8, 1]) {
          sampleClip(model, model.userData.art.clips![kind]!, phase);
          model.updateMatrixWorld(true);
          feet.forEach((foot, i) => {
            if (id === 'pangolin' && kind === 'attack' && i === 1) return; // Deliberate claw swipe.
            assert.ok(
              foot.getWorldPosition(new THREE.Vector3()).distanceTo(restFeet[i]) < 1e-6,
              `${id}.${kind} slides ${foot.name}`,
            );
          });
          const displacement = anchor.getWorldPosition(new THREE.Vector3()).distanceTo(origin);
          if (phase === 0.56)
            assert.ok(displacement > 0.01, `${id}.${kind} does not articulate its anchor`);
          if (phase === 1) assert.ok(displacement < 1e-6, `${id}.${kind} does not return to rest`);
          if (id === 'bull') {
            assert.equal(get('club').parent, get('handR'));
            assert.ok(
              get('club')
                .getWorldPosition(new THREE.Vector3())
                .distanceTo(get('handR').getWorldPosition(new THREE.Vector3())) < 1e-6,
              'club slips out of the hand',
            );
          }
        }
      }
      if (id === 'pangolin') {
        const scale = get('tailScale4:0');
        const rest = scale.getWorldPosition(new THREE.Vector3());
        sampleClip(model, model.userData.art.clips!.skill!, 0.56);
        model.updateMatrixWorld(true);
        assert.equal(scale.parent, get('tail'));
        assert.ok(
          scale.getWorldPosition(new THREE.Vector3()).distanceTo(rest) > 0.02,
          'tail scales detach from moving tail',
        );
      }
    }
  } finally {
    resources.dispose();
  }
});

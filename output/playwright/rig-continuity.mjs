import assert from 'node:assert/strict';
import { entry } from '../../src/scripts/grappling-poses.js';
import { finishes, createFinishPicker } from '../../src/scripts/finishes.js';
import { interpolatePose, geometry } from '../../src/scripts/grappling-rig.js';

const report = [];
for (const finish of finishes) {
  const frames = [...entry, ...finish.frames];
  let largestDelta = 0, location;
  for (let i = 1; i < frames.length; i++) {
    for (let fighter = 0; fighter < 2; fighter++) {
      const a = frames[i - 1].pair[fighter], b = frames[i].pair[fighter];
      assert.deepEqual(interpolatePose(a, b, 0), a);
      assert.deepEqual(interpolatePose(a, b, 1), b);
      let previous = a;
      for (let n = 1; n <= 1000; n++) {
        const pose = interpolatePose(a, b, n / 1000);
        assert.equal(pose.flat().every(Number.isFinite), true);
        assert.equal(JSON.stringify(geometry(pose)).includes('NaN'), false);
        pose.forEach((point, joint) => {
          const delta = Math.hypot(point[0] - previous[joint][0], point[1] - previous[joint][1]);
          if (delta > largestDelta) { largestDelta = delta; location = `${frames[i].name}/${fighter}/${joint}/${n}`; }
        });
        previous = pose;
      }
    }
  }
  report.push({id: finish.id, poses: frames.length, largestDelta, location});
}
const pick = createFinishPicker(() => 0.35);
const picks = Array.from({length:30}, () => pick().id);
assert.equal(picks.every((v,i) => !i || v !== picks[i-1]), true);
for (let i = 0; i < picks.length; i += 3) assert.equal(new Set(picks.slice(i, i + 3)).size, 3);
console.log(JSON.stringify(report, null, 2));
assert.ok(report.every(r => r.largestDelta < 1), 'A joint jumps by more than 1px at a 0.1% time increment');

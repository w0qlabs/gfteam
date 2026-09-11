// A small 2D rig: all paths are redrawn from the same connected joints.
// Coordinates represent a projected, stylized skeleton, not training instruction.
const mix = (a, b, t) => a + (b - a) * t;
const point = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
const angle = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const turn = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const polar = (origin, length, rotation) => [origin[0] + Math.cos(rotation) * length, origin[1] + Math.sin(rotation) * length];
const path = (...points) => points.map((p, i) => `${i ? 'L' : 'M'}${p.map(v => v.toFixed(2)).join(' ')}`).join(' ');

function anchors(pose) {
  const [, shoulder, hip] = pose;
  const rotation = angle(shoulder, hip);
  const side = rotation + Math.PI / 2;
  return [polar(shoulder, 14, side), polar(shoulder, -14, side), polar(hip, 12, side), polar(hip, -12, side)];
}

function bone(a, b, rootA, rootB, root, t) {
  return polar(root, mix(distance(rootA, a), distance(rootB, b), t), angle(rootA, a) + turn(angle(rootA, a), angle(rootB, b)) * t);
}

// Two-bone solve keeps end contacts on their authored paths and uses an
// interpolated bend pole. If a limb changes projected side, its bend passes
// through neutral continuously rather than suddenly flipping the elbow/knee.
function joint(root, end, a, b, rootA, rootB, endA, endB, t) {
  let upper = mix(distance(rootA, a), distance(rootB, b), t);
  let lower = mix(distance(a, endA), distance(b, endB), t);
  const reach = Math.max(distance(root, end), 0.001);
  const scale = Math.max(1, reach / Math.max(upper + lower, 0.001));
  upper *= scale;
  lower *= scale;
  const along = Math.max(-upper, Math.min(upper, (upper * upper - lower * lower + reach * reach) / (2 * reach)));
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  const cross = (r, j, e) => (e[0] - r[0]) * (j[1] - r[1]) - (e[1] - r[1]) * (j[0] - r[0]);
  const bendA = Math.sign(cross(rootA, a, endA));
  const bendB = Math.sign(cross(rootB, b, endB));
  const bend = bendA === bendB ? bendA : mix(bendA, bendB, t);
  const direction = angle(root, end);
  const center = polar(root, along, direction);
  return polar(center, height * bend, direction + Math.PI / 2);
}

export function interpolatePose(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const hip = point(a[2], b[2], t);
  const shoulder = bone(a[1], b[1], a[2], b[2], hip, t);
  const head = bone(a[0], b[0], a[1], b[1], shoulder, t);
  const result = [head, shoulder, hip];
  const rootsA = anchors(a), rootsB = anchors(b), roots = anchors(result);
  for (const [i, bendIndex, endIndex] of [[0, 3, 5], [1, 4, 6], [2, 7, 9], [3, 8, 10]]) {
    const end = point(a[endIndex], b[endIndex], t);
    // A planted foot stays planted; a standing step clears the mat instead
    // of sliding horizontally. Ground hooks keep their own authored paths.
    if (endIndex >= 9 && a[endIndex][1] <= 328 && b[endIndex][1] <= 328 && Math.abs(a[endIndex][0] - b[endIndex][0]) > 10) {
      end[1] -= Math.sin(Math.PI * t) * Math.min(14, Math.abs(a[endIndex][0] - b[endIndex][0]) * 0.35);
    }
    result[endIndex] = end;
    result[bendIndex] = joint(roots[i], end, a[bendIndex], b[bendIndex], rootsA[i], rootsB[i], a[endIndex], b[endIndex], t);
  }
  return result;
}

export function geometry(pose) {
  const [head, shoulder, hip, elbowL, elbowR, handL, handR, kneeL, kneeR, footL, footR] = pose;
  const [sl, sr, hl, hr] = anchors(pose);
  const rotation = angle(shoulder, hip);
  const waist = point(shoulder, hip, 0.82);
  const wl = polar(waist, 15, rotation + Math.PI / 2);
  const wr = polar(waist, -15, rotation + Math.PI / 2);
  const footPath = (knee, foot) => path(polar(foot, -3, angle(knee, foot)), polar(foot, 8, angle(knee, foot) - 0.6));
  return {
    neck: { d: path(head, shoulder) },
    head: { cx: head[0], cy: head[1], r: 16 },
    'gi-body': { d: `${path(sl, sr, hr, hl)}Z` },
    lapel: { d: path(sl, point(shoulder, hip, 0.58), sr) },
    'arm-back': { d: path(sl, elbowL, handL) },
    'arm-front': { d: path(sr, elbowR, handR) },
    'leg-back': { d: path(hl, kneeL, footL) },
    'leg-front': { d: path(hr, kneeR, footR) },
    'figure-belt': { d: `${path(wl, wr)} ${path(waist, polar(waist, 24, rotation + 0.22))} ${path(waist, polar(waist, 20, rotation - 0.4))}` },
    'hand-back': { cx: handL[0], cy: handL[1] },
    'hand-front': { cx: handR[0], cy: handR[1] },
    'foot-back': { d: footPath(kneeL, footL) },
    'foot-front': { d: footPath(kneeR, footR) },
  };
}

export function createRig(svg) {
  const ns = 'http://www.w3.org/2000/svg';
  const definitions = svg.querySelector('defs');
  const roots = ['fighter-a', 'fighter-b'].map(id => document.getElementById(id));
  const originals = roots.map(root => ({ parent: root.parentNode, next: root.nextSibling, html: root.innerHTML }));
  const parts = Object.keys(geometry([[0, 0], [0, 30], [0, 85], ...Array.from({length:8}, () => [30, 110])]));
  const nodes = roots.map(root => {
    root.replaceChildren();
    definitions.append(root);
    return Object.fromEntries(parts.map(part => {
      const node = document.createElementNS(ns, part === 'head' || part.startsWith('hand-') ? 'circle' : 'path');
      node.id = `${root.id}-${part}`;
      node.setAttribute('class', `${part} ${/^(arm|leg)-/.test(part) ? 'limb' : ''} ${part.startsWith('foot-') ? 'foot' : ''} ${part.startsWith('hand-') ? 'hand' : ''}`);
      if (part.startsWith('hand-')) node.setAttribute('r', '4.5');
      root.append(node);
      return [part, node];
    }));
  });
  const display = document.createElementNS(ns, 'g');
  display.id = 'fighter-render';
  display.setAttribute('aria-hidden', 'true');
  svg.append(display);
  // Interleave near/far limbs across fighters. A's near leg and arms can now
  // overlap B deliberately; the blue torso no longer hides every white grip.
  for (const [index, part] of [
    [0,'leg-back'],[0,'foot-back'],[0,'arm-back'],[0,'hand-back'],
    [1,'leg-back'],[1,'foot-back'],[1,'arm-back'],[1,'hand-back'],
    [0,'neck'],[0,'gi-body'],[0,'lapel'],[0,'figure-belt'],[0,'head'],
    [1,'leg-front'],[1,'foot-front'],[1,'neck'],[1,'gi-body'],[1,'lapel'],[1,'figure-belt'],
    [0,'leg-front'],[0,'foot-front'],[1,'head'],[0,'arm-front'],[0,'hand-front'],
    [1,'arm-front'],[1,'hand-front'],
  ]) {
    const group = document.createElementNS(ns, 'g');
    group.setAttribute('class', index ? 'fighter fighter-blue' : 'fighter');
    if (/^(arm|leg)-/.test(part)) {
      const outline = document.createElementNS(ns, 'use');
      outline.setAttribute('href', `#${roots[index].id}-${part}`);
      group.classList.add('limb-edge');
      group.append(outline);
    }
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', `#${roots[index].id}-${part}`);
    group.append(use);
    display.append(group);
  }
  return {
    render(pair) {
      pair.forEach((pose, i) => Object.entries(geometry(pose)).forEach(([part, attrs]) => {
        for (const [key, value] of Object.entries(attrs)) nodes[i][part].setAttribute(key, value);
      }));
      const center = (pair[0][2][0] + pair[1][2][0]) / 2;
      svg.querySelector('#grapple-shadow').setAttribute('cx', center);
    },
    destroy() {
      display.remove();
      roots.forEach((root, i) => {
        root.innerHTML = originals[i].html;
        originals[i].parent.insertBefore(root, originals[i].next?.parentNode === originals[i].parent ? originals[i].next : null);
      });
    },
  };
}

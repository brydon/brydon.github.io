import * as THREE from './vendor/three.module.min.js';

/**
 * Procedural Harley-Davidson Iron 883 reference study.
 * +X = front, +Y = up, +Z = exhaust/right side. Approximate metre-scale.
 * No external images, fonts, model files, or network calls inside this factory.
 * Requires Three.js r180.
 */

/** @typedef {{quality?: 'high'|'medium', finish?: 'denim'|'gloss', optimize?: boolean, mirrors?: 'stock'|'drop'|'none'}} Iron883Options */

/** @param {Iron883Options} [options] @returns {THREE.Group} */
export function createIron883({ quality = 'high', finish = 'denim', optimize = true, mirrors = 'stock' } = {}) {
  if (!['high', 'medium'].includes(quality)) throw new TypeError('quality must be high or medium');
  if (!['denim', 'gloss'].includes(finish)) throw new TypeError('finish must be denim or gloss');
  if (!['stock', 'drop', 'none'].includes(mirrors)) throw new TypeError('mirrors must be stock, drop or none');

  const HI = quality === 'high';
  const TAU = Math.PI * 2;
  const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  const seg = HI ? 64 : 40;

  const bike = new THREE.Group();
  bike.name = 'Iron 883';
  bike.userData = {
    model: 'Iron 883',
    kind: 'Procedural reference study',
    units: 'approximate metres',
    axes: { front: '+X', up: '+Y', right: '+Z' },
    quality,
    finish,
    mirrors,
    steeringDegrees: 0,
    approximate: true
  };

  const mats = {};

  function mat(name, color, metalness = 0, roughness = .5, extra = {}) {
    const m = new THREE.MeshStandardMaterial({ name, color, metalness, roughness, ...extra });
    mats[name] = m;
    return m;
  }

  const paint = new THREE.MeshPhysicalMaterial({
    name: 'Black denim paint',
    color: '#15181a',
    metalness: .22,
    roughness: finish === 'gloss' ? .22 : .49,
    clearcoat: finish === 'gloss' ? .95 : .15,
    clearcoatRoughness: .24
  });
  mats.paint = paint;

  const black = mat('Satin powder coat', '#14171a', .36, .38);
  const engineBlack = mat('Wrinkle-finish engine enamel', '#17191b', .38, .58);
  const rubber = mat('Rubber', '#101113', .0, .92);
  const darkSteel = mat('Blackened steel', '#34393d', .85, .32);
  const chrome = mat('Polished chrome', '#dadde0', 1, .17);
  const alloy = mat('Brushed aluminium', '#a5a9ae', .90, .34);
  const finEdge = mat('Machined fin edges', '#777b80', .88, .39);
  const boltMat = mat('Zinc fasteners', '#a8adb3', .94, .24);
  const leather = mat('Grained black leather', '#18191b', .03, .86);
  const stitchMat = mat('Seat stitching', '#424446', .0, .90);

  const amber = mat('Amber lenses', '#e38a17', .05, .22, {
    emissive: '#d36a0c',
    emissiveIntensity: .1
  });
  const red = mat('Red rear lenses', '#8b0d13', .03, .23, {
    emissive: '#d20808',
    emissiveIntensity: .14
  });
  const glass = mat('Mirror glass', '#c6d0d7', 1, .07);
  const ceramic = mat('Spark plug ceramic', '#dedcd5', .0, .4);

  function group(name, parent = bike) {
    const g = new THREE.Group();
    g.name = name;
    parent.add(g);
    return g;
  }

  function add(parent, geometry, material, p = [0, 0, 0], name = '') {
    const m = new THREE.Mesh(geometry, material);
    m.name = name || material.name;
    m.position.set(...p);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function rod(parent, a, b, radius, material, name = '', radiusEnd = radius, segments = 20) {
    const av = new THREE.Vector3(...a);
    const bv = new THREE.Vector3(...b);
    const delta = bv.clone().sub(av);

    if (delta.length() < 1e-7) throw new RangeError('A rod must have nonzero length');

    const m = add(
      parent,
      new THREE.CylinderGeometry(radiusEnd, radius, delta.length(), segments),
      material,
      av.clone().add(bv).multiplyScalar(.5).toArray(),
      name
    );
    m.quaternion.setFromUnitVectors(Y, delta.normalize());
    return m;
  }

  function sphere(parent, radii, p, material, name = '') {
    const m = add(
      parent,
      new THREE.SphereGeometry(1, HI ? 32 : 20, HI ? 20 : 12),
      material,
      p,
      name
    );
    m.scale.set(...radii);
    return m;
  }

  function torus(parent, r, tube, p, material, normal = [0, 0, 1], name = '') {
    const m = add(parent, new THREE.TorusGeometry(r, tube, 8, seg), material, p, name);
    m.quaternion.setFromUnitVectors(Z, new THREE.Vector3(...normal).normalize());
    return m;
  }

  function pipe(parent, points, radius, material, name = '', segments = 56) {
    const curve = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p)),
      false,
      'centripetal'
    );
    return add(
      parent,
      new THREE.TubeGeometry(
        curve,
        HI ? segments : Math.ceil(segments * .65),
        radius,
        HI ? 12 : 8,
        false
      ),
      material,
      [0, 0, 0],
      name
    );
  }

  function roundShape(w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    const x = -w / 2, y = -h / 2, s = new THREE.Shape();

    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    s.closePath();

    return s;
  }

  function extrude(shape, depth, bevel = 0) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: HI ? 12 : 7
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  function block(parent, size, p, material, radius = .005, name = '') {
    const bevel = Math.min(.002, size[2] * .18, radius * .25);
    return add(
      parent,
      extrude(roundShape(size[0], size[1], radius), size[2], bevel),
      material,
      p,
      name
    );
  }

  function bolt(parent, p, normal = [0, 0, 1], radius = .006, material = boltMat) {
    const n = new THREE.Vector3(...normal).normalize();
    const pos = new THREE.Vector3(...p);

    rod(
      parent,
      pos.clone().addScaledVector(n, -.002).toArray(),
      pos.clone().addScaledVector(n, .002).toArray(),
      radius * 1.3,
      darkSteel,
      'Fastener washer'
    );

    return rod(
      parent,
      p,
      pos.clone().addScaledVector(n, .004).toArray(),
      radius,
      material,
      'Hex fastener',
      radius,
      6
    );
  }

  function surface(nu, nv, evaluate, reverse = false) {
    const positions = [], uv = [], indices = [];

    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        positions.push(...evaluate(i / nu, j / nv));
        uv.push(i / nu, j / nv);
      }
    }

    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + nv + 1;

        if (reverse) indices.push(a, a + 1, b, a + 1, b + 1, b);
        else indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }

  function spline(profiles, t) {
    const f = Math.max(0, Math.min(.999999, t)) * (profiles.length - 1);
    const i = Math.floor(f), u = f - i;

    return profiles[0].map((_, k) => {
      const a = profiles[Math.max(0, i - 1)][k];
      const b = profiles[i][k];
      const c = profiles[Math.min(profiles.length - 1, i + 1)][k];
      const d = profiles[Math.min(profiles.length - 1, i + 2)][k];

      return .5 * (
        2 * b +
        (-a + c) * u +
        (2 * a - 5 * b + 4 * c - d) * u * u +
        (-a + 3 * b - 3 * c + d) * u * u * u
      );
    });
  }

  function loftPoint(profiles, t, angle, offset = 0) {
    const [x, cy, ry, rz] = spline(profiles, t);

    return [
      x,
      cy + (Math.max(.0001, ry) + offset) * Math.sin(angle),
      (Math.max(.0001, rz) + offset) * Math.cos(angle)
    ];
  }

  function canvasTexture(w, h, draw, srgb = true) {
    if (typeof document === 'undefined') return null;

    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;

    const ctx = c.getContext('2d');
    if (!ctx) return null;

    draw(ctx, w, h);

    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;

    return t;
  }

  function faceTexture(
    parent,
    w,
    h,
    p,
    texture,
    normal = [0, 0, 1],
    name = 'Detail decal',
    color = '#ffffff'
  ) {
    if (!texture) return null;

    const m = mat(name, color, .15, .56, {
      map: texture,
      transparent: true,
      alphaTest: .05,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1
    });

    const face = add(parent, new THREE.PlaneGeometry(w, h), m, p, name);
    face.quaternion.setFromUnitVectors(Z, new THREE.Vector3(...normal).normalize());
    face.castShadow = false;

    return face;
  }

  // Small procedural surface maps, not photographic billboards.
  const grain = canvasTexture(256, 256, (c, w, h) => {
    const image = c.createImageData(w, h);
    let seed = 883;

    for (let i = 0; i < image.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const v = 110 + (seed % 56);
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }

    c.putImageData(image, 0, 0);
  }, false);

  if (grain) {
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    grain.repeat.set(4, 4);
    leather.bumpMap = grain;
    leather.bumpScale = .00045;
    engineBlack.bumpMap = grain;
    engineBlack.bumpScale = .00018;
  }

  const chassis = group('Tubular frame and swingarm');

  for (const s of [-1, 1]) {
    const z = s * .102;

    pipe(chassis, [
      [.391, .844, s * .043],
      [.358, .651, s * .077],
      [.248, .265, z],
      [.177, .224, z],
      [-.285, .224, z],
      [-.369, .345, z]
    ], .0175, black, 'Double-cradle frame rail');

    pipe(chassis, [
      [-.369, .345, z],
      [-.413, .584, z],
      [-.391, .704, s * .073],
      [-.254, .747, s * .051],
      [.391, .87, s * .025]
    ], .017, black, 'Seat tube and backbone');

    pipe(chassis, [
      [-.345, .395, z],
      [-.51, .678, s * .10],
      [-.666, .682, s * .092]
    ], .016, black, 'Rear subframe');

    pipe(chassis, [
      [-.316, .35, s * .106],
      [-.506, .313, s * .116],
      [-.762, .318, s * .111]
    ], .0215, black, 'Swingarm');

    rod(
      chassis,
      [-.762, .318, s * .111],
      [-.695, .358, s * .111],
      .024,
      black,
      'Axle adjuster'
    );
    bolt(chassis, [-.758, .318, s * .139], [0, 0, s], .010);
  }

  rod(chassis, [-.325, .35, -.144], [-.325, .35, .144], .034, darkSteel, 'Swingarm pivot');
  rod(chassis, [.393, .841, 0], [.436, .93, 0], .035, black, 'Steering head');
  rod(chassis, [-.40, .705, -.10], [-.40, .705, .10], .017, black, 'Seat support crossmember');

  const tread = canvasTexture(2048, 512, (c, w, h) => {
    c.fillStyle = '#adadad';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#252525';
    c.lineCap = 'round';
    c.lineWidth = 8;

    for (let i = -2; i < 54; i++) {
      const x = i * w / 50;

      c.beginPath();
      c.moveTo(x - 12, h * .22);
      c.bezierCurveTo(x + 15, h * .31, x + 23, h * .39, x + 39, h * .49);
      c.stroke();

      c.beginPath();
      c.moveTo(x + 39, h * .51);
      c.bezierCurveTo(x + 50, h * .60, x + 15, h * .69, x - 6, h * .78);
      c.stroke();
    }

    c.strokeStyle = '#737373';
    c.lineWidth = 2;

    for (const v of [.13, .18, .82, .87]) {
      c.beginPath();
      c.moveTo(0, h * v);
      c.lineTo(w, h * v);
      c.stroke();
    }
  }, false);

  const tireMat = mat('Moulded tire rubber', '#171819', 0, .86, {
    bumpMap: tread,
    bumpScale: .0016
  });

  if (tread) tread.wrapS = THREE.RepeatWrapping;

  function makeWheel(parent, name, x, y, radius, rimR, halfWidth, front) {
    const g = group(name, parent);
    g.position.set(x, y, 0);
    g.userData.spokes = 13;

    const radialThickness = radius - rimR;
    const profile = [
      [rimR - .005, halfWidth * .65],
      [rimR + .004, halfWidth * .83],
      [rimR + radialThickness * .31, halfWidth],
      [rimR + radialThickness * .62, halfWidth * .91],
      [rimR + radialThickness * .86, halfWidth * .63],
      [radius - .002, halfWidth * .27],
      [radius, 0],
      [radius - .002, -halfWidth * .27],
      [rimR + radialThickness * .86, -halfWidth * .63],
      [rimR + radialThickness * .62, -halfWidth * .91],
      [rimR + radialThickness * .31, -halfWidth],
      [rimR + .004, -halfWidth * .83],
      [rimR - .005, -halfWidth * .65],
      [rimR - .005, halfWidth * .65]
    ];

    const curve = new THREE.SplineCurve(profile.map(p => new THREE.Vector2(...p)));
    const tire = add(
      g,
      new THREE.LatheGeometry(curve.getPoints(HI ? 68 : 40), HI ? 128 : 80),
      tireMat,
      [0, 0, 0],
      'Contoured tire'
    );
    tire.rotation.x = Math.PI / 2;

    const rimProfile = [
      [rimR - .015, -halfWidth * .69],
      [rimR + .004, -halfWidth * .69],
      [rimR + .009, -halfWidth * .58],
      [rimR + .009, halfWidth * .58],
      [rimR + .004, halfWidth * .69],
      [rimR - .015, halfWidth * .69],
      [rimR - .015, -halfWidth * .69]
    ];

    const hoop = add(
      g,
      new THREE.LatheGeometry(rimProfile.map(p => new THREE.Vector2(...p)), seg),
      black,
      [0, 0, 0],
      'Cast alloy rim'
    );
    hoop.rotation.x = Math.PI / 2;

    for (const s of [-1, 1]) {
      torus(
        g, rimR + .003, .0028,
        [0, 0, s * halfWidth * .70],
        alloy, undefined, 'Machined bead lip'
      );
      torus(
        g, rimR - .010, .002,
        [0, 0, s * halfWidth * .68],
        alloy, undefined, 'Inner polished rim edge'
      );
      torus(
        g, rimR + (radius - rimR) * .34, .0012,
        [0, 0, s * halfWidth * 1.002],
        rubber, undefined, 'Moulded sidewall ring'
      );
    }

    rod(g, [0, 0, -.071], [0, 0, .071], .049, black, 'Wheel hub', .049, 32);
    rod(g, [0, 0, -.093], [0, 0, .093], .021, alloy, 'Hub spacer', .021, 32);

    for (let i = 0; i < 13; i++) {
      const angle = i * TAU / 13 + .05;

      function spokeShape(inset = 0) {
        const rr = [.045, .111, rimR - .013];
        const widths = [.008 - inset, .010 - inset, .014 - inset];
        const offsets = [-.03, .013, .028];
        const pts = [];

        for (let k = 0; k < 3; k++) {
          const a = angle + offsets[k];
          pts.push([
            Math.cos(a) * rr[k] - Math.sin(a) * widths[k],
            Math.sin(a) * rr[k] + Math.cos(a) * widths[k]
          ]);
        }

        for (let k = 2; k >= 0; k--) {
          const a = angle + offsets[k];
          pts.push([
            Math.cos(a) * rr[k] + Math.sin(a) * widths[k],
            Math.sin(a) * rr[k] - Math.cos(a) * widths[k]
          ]);
        }

        const s = new THREE.Shape();
        pts.forEach((p, j) => j ? s.lineTo(...p) : s.moveTo(...p));
        s.closePath();
        return s;
      }

      add(g, extrude(spokeShape(), .034, .001), black, [0, 0, 0], 'Cast spoke');

      for (const s of [-1, 1]) {
        add(
          g,
          extrude(spokeShape(.0045), .001),
          alloy,
          [0, 0, s * .0185],
          'Machined spoke face'
        );
      }
    }

    const side = front ? -1 : 1;
    const discZ = side * (front ? .076 : .099);

    const rotor = new THREE.Shape();
    rotor.absarc(0, 0, .139, 0, TAU, false);

    const center = new THREE.Path();
    center.absarc(0, 0, .077, 0, TAU, true);
    rotor.holes.push(center);

    for (let i = 0; i < 28; i++) {
      for (let j = 0; j < 2; j++) {
        const a = i * TAU / 28 + j * .036;
        const r = .117 + j * .013;
        const h = new THREE.Path();

        h.absarc(Math.cos(a) * r, Math.sin(a) * r, .0032, 0, TAU, true);
        rotor.holes.push(h);
      }
    }

    add(g, extrude(rotor, .003), alloy, [0, 0, discZ], 'Drilled brake rotor');

    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5;

      rod(
        g,
        [Math.cos(a) * .043, Math.sin(a) * .043, discZ],
        [Math.cos(a + .08) * .086, Math.sin(a + .08) * .086, discZ],
        .013,
        darkSteel,
        'Rotor carrier'
      );
      bolt(
        g,
        [Math.cos(a) * .089, Math.sin(a) * .089, discZ + side * .003],
        [0, 0, side],
        .005
      );
    }

    // Raised, low-contrast sidewall lettering follows the tyre shoulder.
    const sideText = canvasTexture(512, 512, (c, w, h) => {
      c.translate(w / 2, h / 2);
      c.textAlign = 'center';
      c.fillStyle = '#4b4e50';
      c.font = '600 18px Arial';

      const label = front
        ? '100 / 90 — 19    •    TUBELESS'
        : '150 / 80 — 16    •    TUBELESS';

      for (let i = 0; i < label.length; i++) {
        const a = -2.43 + i * 1.74 / (label.length - 1);
        c.save();
        c.rotate(a);
        c.translate(0, -211);
        c.fillText(label[i], 0, 0);
        c.restore();
      }
    });

    if (sideText) {
      for (const s of [-1, 1]) {
        const labelR = rimR + radialThickness * .34;

        faceTexture(
          g,
          labelR * 2.22,
          labelR * 2.22,
          [0, 0, s * (halfWidth + .0009)],
          sideText,
          [0, 0, s],
          name + ' sidewall lettering',
          '#aeb1b4'
        );
      }
    }

    const va = .35;
    rod(
      g,
      [Math.cos(va) * (rimR - .012), Math.sin(va) * (rimR - .012), .016],
      [Math.cos(va) * (rimR - .022), Math.sin(va) * (rimR - .022), .042],
      .003,
      rubber,
      'Valve stem'
    );

    return g;
  }

  makeWheel(bike, 'Rear wheel', -.762, .319, .319, .209, .077, false);

  const frontAssembly = group('Steering assembly');
  makeWheel(frontAssembly, 'Front wheel', .756, .329, .329, .244, .052, true);

  const beltDrive = group('Belt final drive');

  // Rear pulley is on the primary/left side, separate from the brake rotor.
  for (const z of [-.102, -.120]) {
    torus(
      beltDrive, .162, .006, [-.762, .319, z],
      darkSteel, undefined, 'Rear belt pulley flange'
    );
  }

  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;

    rod(
      beltDrive,
      [-.762 + Math.cos(a) * .05, .319 + Math.sin(a) * .05, -.110],
      [-.762 + Math.cos(a + .2) * .157, .319 + Math.sin(a + .2) * .157, -.110],
      .015,
      black,
      'Pulley spoke'
    );

    bolt(
      beltDrive,
      [-.762 + Math.cos(a) * .071, .319 + Math.sin(a) * .071, -.125],
      [0, 0, -1],
      .0055
    );
  }

  // A closed ribbon, not a chain or a filled-in side silhouette.
  const beltPath = [];

  for (let i = 0; i <= 32; i++) {
    const a = Math.PI / 2 + i * Math.PI / 32;
    beltPath.push([-.762 + .169 * Math.cos(a), .319 + .169 * Math.sin(a), -.111]);
  }

  for (let i = 0; i <= 32; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 32;
    beltPath.push([-.298 + .059 * Math.cos(a), .33 + .059 * Math.sin(a), -.111]);
  }

  const beltCurve = new THREE.CatmullRomCurve3(
    beltPath.map(p => new THREE.Vector3(...p)),
    true,
    'centripetal'
  );

  add(
    beltDrive,
    surface(180, 1, (u, v) => {
      const p = beltCurve.getPoint(u);
      return [p.x, p.y, p.z + (v - .5) * .026];
    }),
    rubber,
    [0, 0, 0],
    'Continuous drive belt'
  ).material.side = THREE.DoubleSide;

  pipe(beltDrive, [
    [-.807, .504, -.115],
    [-.61, .481, -.115],
    [-.331, .413, -.115]
  ], .009, black, 'Upper belt guard');

  const shocks = group('Twin rear coil-over shocks');

  for (const s of [-1, 1]) {
    const a = new THREE.Vector3(-.711, .355, s * .124);
    const b = new THREE.Vector3(-.505, .687, s * .124);
    const axis = b.clone().sub(a);
    const len = axis.length();

    const g = group(s > 0 ? 'Right shock' : 'Left shock', shocks);
    g.position.copy(a);
    g.quaternion.setFromUnitVectors(Y, axis.normalize());

    rod(g, [0, .015, 0], [0, len - .013, 0], .009, chrome, 'Damper shaft');
    rod(g, [0, .02, 0], [0, .115, 0], .019, black, 'Damper body');
    rod(g, [0, len - .064, 0], [0, len - .015, 0], .023, black, 'Upper shock cap');

    class Helix extends THREE.Curve {
      getPoint(t, target = new THREE.Vector3()) {
        const a = t * TAU * 9.2;
        return target.set(
          Math.cos(a) * .029,
          .066 + t * (len - .12),
          Math.sin(a) * .029
        );
      }
    }

    add(
      g,
      new THREE.TubeGeometry(new Helix(), HI ? 260 : 150, .0042, 8, false),
      chrome,
      [0, 0, 0],
      'Continuous helical spring'
    );

    for (const y of [.06, len - .055]) {
      torus(g, .027, .004, [0, y, 0], alloy, [0, 1, 0], 'Spring seat');
      rod(g, [0, y - .009, 0], [0, y, 0], .023, darkSteel, 'Preload collar');
    }

    for (const p of [a, b]) {
      torus(shocks, .013, .006, p.toArray(), black, [0, 0, 1], 'Shock mounting eye');
      bolt(shocks, [p.x, p.y, p.z + s * .016], [0, 0, s], .009);
    }
  }

  const motor = group('Evolution V-twin engine');

  const crank = add(
    motor,
    new THREE.CylinderGeometry(.163, .163, .242, seg),
    engineBlack,
    [-.049, .358, 0],
    'Crankcase'
  );
  crank.rotation.x = Math.PI / 2;

  block(
    motor, [.271, .201, .234], [-.235, .351, 0],
    engineBlack, .065, 'Transmission housing'
  );
  sphere(
    motor, [.146, .10, .119], [-.106, .279, 0],
    engineBlack, 'Lower crankcase'
  );

  for (const sign of [-1, 1]) {
    const cylinder = group(
      sign > 0 ? 'Front cylinder and rocker box' : 'Rear cylinder and rocker box',
      motor
    );
    cylinder.position.set(-.043, .388, 0);
    cylinder.rotation.z = -sign * Math.PI / 8;

    rod(
      cylinder, [0, .041, 0], [0, .312, 0],
      .075, engineBlack, 'Cylinder barrel', .075, 32
    );

    // Black horizontal cooling fins with thin, genuinely modelled machined edges.
    for (let i = 0; i < 13; i++) {
      const y = .098 + i * .0165;
      const head = i >= 9;
      const w = head ? .221 : .192;
      const d = head ? .232 : .211;

      const edge = block(
        cylinder, [w, d, .0018], [0, y - .002, 0],
        finEdge, .026, 'Exposed cooling-fin edge'
      );
      edge.rotation.x = Math.PI / 2;

      const fin = block(
        cylinder, [w - .005, d - .005, .0045], [0, y + .0006, 0],
        engineBlack, .025, 'Cooling fin'
      );
      fin.rotation.x = Math.PI / 2;
    }

    block(
      cylinder, [.218, .036, .229], [0, .327, 0],
      alloy, .01, 'Lower rocker cover'
    );
    block(
      cylinder, [.221, .028, .232], [0, .350, 0],
      black, .009, 'Rocker cover gasket'
    );
    block(
      cylinder, [.218, .026, .229], [0, .367, 0],
      alloy, .009, 'Aluminium rocker box'
    );
    block(
      cylinder, [.206, .012, .218], [0, .385, 0],
      darkSteel, .008, 'Rocker-box top'
    );

    for (const x of [-.077, .077]) {
      for (const z of [-.080, .080]) {
        bolt(cylinder, [x, .391, z], [0, 1, 0], .005);
      }
    }

    for (const x of [-.055, .055]) {
      rod(
        cylinder, [x, .050, .123], [x, .307, .123],
        .0092, chrome, 'Pushrod tube'
      );

      for (const y of [.057, .299]) {
        rod(
          cylinder, [x, y - .01, .123], [x, y + .01, .123],
          .013, darkSteel, 'Pushrod tube collar'
        );
      }
    }

    rod(
      cylinder, [-.053, .324, -.091], [-.053, .347, -.143],
      .010, ceramic, 'Spark plug ceramic'
    );
    rod(
      cylinder, [-.053, .345, -.139], [-.053, .353, -.157],
      .012, rubber, 'Spark plug boot'
    );
  }

  for (let i = 0; i < 10; i++) {
    const a = i * TAU / 10;
    bolt(
      motor,
      [-.047 + Math.cos(a) * .145, .357 + Math.sin(a) * .145, .126],
      [0, 0, 1],
      .0055
    );
  }

  const timing = add(
    motor,
    new THREE.CylinderGeometry(.071, .073, .022, 48),
    black,
    [.020, .357, .133],
    'Timing cover'
  );
  timing.rotation.x = Math.PI / 2;

  const timer = add(
    motor,
    new THREE.CylinderGeometry(.031, .032, .007, 40),
    alloy,
    [.020, .357, .147],
    'Timer inspection cap'
  );
  timer.rotation.x = Math.PI / 2;

  for (const s of [-1, 1]) {
    bolt(motor, [.020 + s * .022, .357, .154], [0, 0, 1], .0035);
  }

  rod(
    motor, [-.276, .484, -.058], [-.156, .484, -.058],
    .039, black, 'Starter motor', .039, 32
  );
  rod(
    motor, [.135, .318, -.003], [.207, .318, -.003],
    .031, black, 'Oil filter', .031, 32
  );
  torus(
    motor, .029, .002, [.203, .318, -.003],
    alloy, [1, 0, 0], 'Oil-filter seam'
  );

  const primary = group('Left primary cover');
  const primaryShape = new THREE.Shape();

  primaryShape.moveTo(-.40, .391);
  primaryShape.bezierCurveTo(-.439, .358, -.409, .272, -.351, .242);
  primaryShape.bezierCurveTo(-.281, .209, -.108, .220, .045, .237);
  primaryShape.bezierCurveTo(.126, .247, .155, .329, .13, .401);
  primaryShape.bezierCurveTo(.111, .45, .034, .475, -.044, .46);
  primaryShape.lineTo(-.335, .437);
  primaryShape.bezierCurveTo(-.373, .433, -.39, .414, -.40, .391);
  primaryShape.closePath();

  add(
    primary,
    extrude(primaryShape, .054, .009),
    engineBlack,
    [0, 0, -.135],
    'Primary drive case'
  );

  const derby = add(
    primary,
    new THREE.CylinderGeometry(.100, .102, .013, 64),
    alloy,
    [-.275, .337, -.177],
    'Round derby cover'
  );
  derby.rotation.x = Math.PI / 2;

  torus(
    primary, .101, .002, [-.275, .337, -.186],
    darkSteel, undefined, 'Derby-cover gasket'
  );

  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;
    bolt(
      primary,
      [-.275 + Math.cos(a) * .089, .337 + Math.sin(a) * .089, -.187],
      [0, 0, -1],
      .005
    );
  }

  block(
    primary, [.108, .037, .012], [-.010, .417, -.173],
    alloy, .017, 'Primary inspection cover'
  );

  for (const x of [-.052, .032]) {
    bolt(primary, [x, .417, -.182], [0, 0, -1], .004);
  }

  for (const [x, y] of [
    [-.382, .379], [-.371, .283], [-.122, .246],
    [.075, .272], [.121, .378], [.047, .442]
  ]) {
    bolt(primary, [x, y, -.173], [0, 0, -1], .0055);
  }

  const intake = group('Oval 883 air cleaner');

  block(
    intake, [.274, .175, .066], [.012, .577, .160],
    black, .070, 'Air-cleaner housing'
  );
  block(
    intake, [.252, .153, .009], [.012, .577, .199],
    darkSteel, .062, 'Air-cleaner outer lip'
  );
  block(
    intake, [.239, .141, .011], [.012, .577, .204],
    black, .057, 'Air-cleaner cover'
  );
  block(
    intake, [.151, .055, .005], [.012, .577, .214],
    alloy, .025, 'Air-cleaner badge surround'
  );
  block(
    intake, [.144, .047, .005], [.012, .577, .218],
    black, .021, 'Air-cleaner badge'
  );

  const intakeLogo = canvasTexture(512, 160, (c, w, h) => {
    c.fillStyle = '#d5d4ce';
    c.textAlign = 'center';
    c.font = 'italic 700 78px Georgia';
    c.fillText('883', w * .53, h * .68);
    c.font = '16px Arial';
    c.fillText('EVOLUTION', w * .52, h * .87);
  });

  faceTexture(
    intake, .124, .039, [.012, .577, .222],
    intakeLogo, [0, 0, 1], '883 air-cleaner lettering'
  );

  for (const s of [-1, 1]) {
    bolt(intake, [.012 + s * .095, .577, .213], [0, 0, 1], .004);
  }

  const tankGroup = group('Peanut fuel tank');
  const tankProfiles = [
    [-.284, .746, .004, .005],
    [-.265, .756, .024, .035],
    [-.211, .78, .052, .077],
    [-.12, .813, .079, .110],
    [0, .837, .101, .135],
    [.115, .852, .113, .143],
    [.215, .845, .109, .130],
    [.285, .820, .078, .095],
    [.318, .802, .040, .050],
    [.325, .794, .003, .004]
  ];

  add(
    tankGroup,
    surface(HI ? 88 : 56, HI ? 64 : 40, (u, v) => loftPoint(tankProfiles, u, v * TAU)),
    paint,
    [0, 0, 0],
    'Hand-shaped peanut tank shell'
  );

  // The silhouette is a loft: narrow rear, full shoulders, rounded nose, sloping underside.
  for (const s of [-1, 1]) {
    pipe(
      tankGroup,
      Array.from({ length: 45 }, (_, i) =>
        loftPoint(
          tankProfiles,
          .05 + i * .9 / 44,
          s > 0 ? -.73 : Math.PI + .73,
          .0004
        )
      ),
      .0018,
      black,
      'Rolled lower tank seam'
    );
  }

  const capPos = [.112, .967, .007];

  rod(
    tankGroup,
    [capPos[0], capPos[1] - .013, capPos[2]],
    [capPos[0], capPos[1], capPos[2]],
    .032,
    black,
    'Filler-neck gasket',
    .032,
    48
  );
  rod(tankGroup, capPos, [.112, .975, .007], .029, chrome, 'Fuel cap', .029, 48);
  torus(
    tankGroup, .0265, .0015, [.112, .976, .007],
    alloy, [0, 1, 0], 'Fuel-cap bevel'
  );

  const tankLogo = canvasTexture(1024, 256, (c, w, h) => {
    c.fillStyle = '#d8d5c9';
    c.textAlign = 'center';
    c.font = '700 75px Georgia';

    const text = 'HARLEY-DAVIDSON';
    const step = 58;
    const start = w / 2 - (text.length - 1) * step / 2;

    for (let i = 0; i < text.length; i++) {
      const q = (i / (text.length - 1) - .5) * 2;

      c.save();
      c.translate(start + i * step, 114 + 30 * q * q);
      c.rotate(q * .14);
      c.fillText(text[i], 0, 0);
      c.restore();
    }

    c.font = '600 22px Georgia';
    c.fillText('M O T O R   C O.', w / 2, 172);
  });

  if (tankLogo) {
    for (const s of [-1, 1]) {
      const decalMat = mat(
        s > 0 ? 'Right curved tank lettering' : 'Left curved tank lettering',
        '#ffffff',
        .18,
        .57,
        {
          map: tankLogo,
          transparent: true,
          alphaTest: .08,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1
        }
      );

      const logo = add(
        tankGroup,
        surface(44, 18, (u, v) => {
          const t = s > 0 ? .374 + u * .406 : .78 - u * .406;
          const a = s > 0 ? .14 + v * .69 : Math.PI - (.14 + v * .69);
          return loftPoint(tankProfiles, t, a, .0012);
        }),
        decalMat,
        [0, 0, 0],
        'Conformal tank typography'
      );
      logo.castShadow = false;
    }
  }

  const saddle = group('Solo saddle and side covers');
  const seatProfiles = [
    [-.670, .728, .005, .024],
    [-.649, .742, .024, .085],
    [-.594, .738, .029, .138],
    [-.518, .710, .025, .153],
    [-.413, .705, .022, .134],
    [-.312, .723, .020, .086],
    [-.237, .739, .007, .025]
  ];

  add(
    saddle,
    surface(66, 40, (u, v) => loftPoint(seatProfiles, u, v * TAU)),
    leather,
    [0, 0, 0],
    'Sculpted solo saddle'
  );

  for (const s of [-1, 1]) {
    pipe(
      saddle,
      Array.from({ length: 60 }, (_, i) =>
        loftPoint(
          seatProfiles,
          .025 + i * .95 / 59,
          s > 0 ? .25 : Math.PI - .25,
          .0012
        )
      ),
      .0011,
      stitchMat,
      'Saddle perimeter welt',
      70
    );
  }

  for (let i = 0; i < 8; i++) {
    const t = .22 + i * .078;
    const points = [];

    for (let j = 0; j <= 24; j++) {
      points.push(loftPoint(seatProfiles, t, .30 + j * (Math.PI - .60) / 24, .0006));
    }

    pipe(saddle, points, .0008, stitchMat, 'Saddle transverse stitch', 28);
  }

  const coverShape = new THREE.Shape();
  coverShape.moveTo(-.576, .663);
  coverShape.bezierCurveTo(-.536, .688, -.399, .691, -.328, .657);
  coverShape.bezierCurveTo(-.318, .626, -.343, .552, -.371, .534);
  coverShape.bezierCurveTo(-.42, .516, -.56, .574, -.584, .614);
  coverShape.bezierCurveTo(-.592, .63, -.589, .651, -.576, .663);
  coverShape.closePath();

  for (const s of [-1, 1]) {
    add(
      saddle,
      extrude(coverShape, .025, .006),
      paint,
      [0, 0, s * .113],
      'Side panel'
    );
    bolt(saddle, [-.368, .657, s * .134], [0, 0, s], .005);
  }

  rod(
    saddle, [-.339, .690, .074], [-.339, .711, .074],
    .022, darkSteel, 'Oil-tank filler'
  );

  function fender(parent, name, x, y, r, width, start, end, crown) {
    const g = group(name, parent);
    const nu = HI ? 80 : 50, nv = 12;

    const evaluate = (u, v, offset = 0) => {
      const a = start + (end - start) * u;
      const z = (v - .5) * width;
      const rr = r + crown * (1 - Math.pow(2 * v - 1, 2)) + offset;

      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr, z];
    };

    add(
      g,
      surface(nu, nv, (u, v) => evaluate(u, v)),
      paint,
      [0, 0, 0],
      'Crowned fender skin'
    );
    add(
      g,
      surface(nu, nv, (u, v) => evaluate(u, v, -.003), true),
      black,
      [0, 0, 0],
      'Fender underside'
    );

    for (const v of [0, 1]) {
      pipe(
        g,
        Array.from({ length: 65 }, (_, i) => evaluate(i / 64, v, -.001)),
        .002,
        paint,
        'Rolled fender edge',
        70
      );
    }

    for (const u of [0, 1]) {
      pipe(
        g,
        Array.from({ length: 17 }, (_, i) => evaluate(u, i / 16, -.001)),
        .002,
        paint,
        'Finished fender end',
        24
      );
    }

    return g;
  }

  fender(bike, 'Rear fender', -.762, .319, .341, .172, .30, 2.62, .013);

  const frontFender = fender(
    frontAssembly, 'Front fender',
    .756, .329, .351, .126, .42, 2.28, .008
  );

  for (const s of [-1, 1]) {
    pipe(chassis, [
      [-.437, .691, s * .094],
      [-.661, .670, s * .108],
      [-.893, .597, s * .107],
      [-1.022, .52, s * .095]
    ], .0105, black, 'Rear fender support strut');

    for (const [x, y] of [[-.612, .673], [-.852, .616]]) {
      bolt(chassis, [x, y, s * .12], [0, 0, s], .006);
    }

    rod(
      frontFender, [.717, .469, s * .070], [.674, .645, s * .065],
      .006, black, 'Front fender stay'
    );
    bolt(frontFender, [.678, .637, s * .07], [0, 0, s], .0045);
  }

  const exhaust = group('Staggered dual chrome exhaust');

  pipe(exhaust, [
    [-.174, .677, .114],
    [-.162, .633, .164],
    [-.204, .532, .185],
    [-.311, .419, .210],
    [-.443, .326, .231],
    [-.545, .287, .235],
    [-.677, .286, .235]
  ], .0245, chrome, 'Rear-cylinder sweeping header', 100);

  pipe(exhaust, [
    [.103, .678, .110],
    [.162, .651, .164],
    [.254, .549, .205],
    [.268, .375, .218],
    [.221, .222, .247],
    [.10, .190, .247],
    [-.252, .190, .247]
  ], .0245, chrome, 'Front-cylinder sweeping header', 110);

  for (const p of [[-.174, .678, .12], [.103, .679, .12]]) {
    torus(exhaust, .027, .004, p, darkSteel, [0, 0, 1], 'Exhaust port flange');
  }

  function muffler(start, end, y, z) {
    const profile = [
      [.026, start],
      [.032, start + .002],
      [.036, start + .013],
      [.036, end - .05],
      [.032, end - .017],
      [.025, end],
      [.022, end],
      [.022, start + .02],
      [.025, start]
    ];

    const m = add(
      exhaust,
      new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(...p)), seg),
      chrome,
      [0, y, z],
      'Open-ended chrome silencer'
    );
    m.rotation.z = -Math.PI / 2;

    torus(
      exhaust, .029, .0026, [start, y, z],
      chrome, [1, 0, 0], 'Rolled exhaust outlet'
    );
    rod(
      exhaust, [start + .018, y, z], [start + .027, y, z],
      .024, rubber, 'Recessed exhaust bore', .024, 32
    );

    for (const x of [end - .055]) {
      torus(
        exhaust, .0355, .0019, [x, y, z],
        alloy, [1, 0, 0], 'Silencer clamp'
      );
    }
  }

  muffler(-.984, -.482, .286, .235);
  muffler(-.660, -.158, .190, .247);

  for (const [x, y, z] of [
    [-.39, .37, .22],
    [.254, .421, .22],
    [.12, .19, .247]
  ]) {
    torus(
      exhaust, .0252, .0012, [x, y, z],
      alloy, [1, 0, 0], 'Heat shield joint'
    );
  }

  rod(
    exhaust, [-.71, .315, .137], [-.69, .307, .232],
    .008, darkSteel, 'Upper exhaust mount'
  );
  rod(
    exhaust, [-.32, .25, .132], [-.34, .211, .245],
    .009, darkSteel, 'Lower exhaust mount'
  );

  const fork = group('Raked fork and rubber gaiters', frontAssembly);
  const lower = new THREE.Vector3(.756, .329, 0);
  const upper = new THREE.Vector3(.454, .945, 0);
  const forkAxis = upper.clone().sub(lower).normalize();

  for (const s of [-1, 1]) {
    const z = s * .093;

    function fp(t) {
      return lower.clone().lerp(upper, t).setZ(z).toArray();
    }

    rod(fork, fp(.018), fp(.55), .0258, black, 'Fork slider', .024, 32);
    rod(fork, fp(.49), fp(1.01), .0185, chrome, 'Chrome fork stanchion', .0185, 32);

    const start = lower.clone().lerp(upper, .52);
    start.z = z;

    const length = upper.distanceTo(lower) * .26;
    const profile = [];

    for (let i = 0; i <= 66; i++) {
      const y = length * i / 66;
      const r = .0228 + .0051 * (.5 - .5 * Math.cos(i / 66 * TAU * 11));
      profile.push(new THREE.Vector2(r, y));
    }

    const bellows = add(
      fork,
      new THREE.LatheGeometry(profile, 40),
      rubber,
      start.toArray(),
      'Accordion fork gaiter'
    );
    bellows.quaternion.setFromUnitVectors(Y, forkAxis);

    for (const t of [.515, .787]) {
      torus(
        fork, .0235, .0025, fp(t),
        black, forkAxis.toArray(), 'Gaiter retaining band'
      );
    }

    block(
      fork, [.016, .059, .004], [.698, .483, s * .117],
      amber, .004, 'Fork amber reflector'
    );
    bolt(fork, [.753, .334, s * .127], [0, 0, s], .010);
  }

  rod(
    fork, [.756, .329, -.129], [.756, .329, .129],
    .010, alloy, 'Front axle'
  );

  for (const t of [.79, .968]) {
    const p = lower.clone().lerp(upper, t);

    rod(
      fork, [p.x, p.y, -.123], [p.x, p.y, .123],
      .020, black, 'Triple-tree cross clamp'
    );

    for (const s of [-1, 1]) {
      bolt(fork, [p.x + .016, p.y, s * .118], [1, 0, 0], .005);
    }
  }

  const caliper = block(
    fork, [.065, .073, .039], [.661, .410, -.087],
    black, .02, 'Front brake caliper'
  );
  caliper.rotation.z = -.30;

  for (const y of [.392, .428]) {
    bolt(fork, [.657, y, -.11], [0, 0, -1], .005);
  }

  block(
    chassis, [.078, .055, .034], [-.687, .399, .102],
    black, .015, 'Rear brake caliper'
  );

  pipe(fork, [
    [.651, .428, -.112],
    [.657, .577, -.126],
    [.547, .762, -.126],
    [.466, .938, -.151],
    [.395, 1.016, .244]
  ], .0035, rubber, 'Front hydraulic brake hose', 86);

  const cockpit = group('Headlight and cockpit', frontAssembly);

  // Separate groups are deliberately preserved by the material batching pass.
  const stockMirrors = group('Stock mirrors', cockpit);
  const dropMirrors = group('Drop mirrors', cockpit);

  stockMirrors.visible = mirrors === 'stock';
  dropMirrors.visible = mirrors === 'drop';

  const headX = .576, headY = .862;
  const lightProfile = [
    [0, -.060],
    [.035, -.052],
    [.058, -.033],
    [.069, -.008],
    [.071, .022],
    [.068, .038],
    [.064, .038],
    [.064, .025]
  ];

  const housing = add(
    cockpit,
    new THREE.LatheGeometry(lightProfile.map(p => new THREE.Vector2(...p)), seg),
    black,
    [headX, headY, 0],
    'Round headlamp shell'
  );
  housing.rotation.z = -Math.PI / 2;

  torus(
    cockpit, .066, .004, [headX + .039, headY, 0],
    chrome, [1, 0, 0], 'Headlamp retaining rim'
  );

  const lensMap = canvasTexture(512, 512, (c, w, h) => {
    const grad = c.createRadialGradient(w * .42, h * .36, 5, w / 2, h / 2, w / 2);
    grad.addColorStop(0, '#fafaf1');
    grad.addColorStop(.45, '#bdc4c6');
    grad.addColorStop(1, '#4b555c');

    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffffff66';
    c.lineWidth = 2;

    for (let i = 0; i < 28; i++) {
      c.beginPath();
      c.moveTo(0, i * h / 28);
      c.lineTo(w, i * h / 28);
      c.stroke();
    }

    c.strokeStyle = '#1c283830';

    for (let i = 0; i < 24; i++) {
      c.beginPath();
      c.moveTo(i * w / 24, 0);
      c.lineTo(i * w / 24, h);
      c.stroke();
    }

    c.fillStyle = '#394348';
    c.textAlign = 'center';
    c.font = '14px Arial';
    c.fillText('H · D', w / 2, h * .74);
  });

  const lampMat = mat('Headlight glass', '#e0e4df', .15, .19, {
    map: lensMap,
    emissive: '#ffe8be',
    emissiveIntensity: .035
  });

  const lamp = add(
    cockpit,
    new THREE.CircleGeometry(.0625, seg),
    lampMat,
    [headX + .041, headY, 0],
    'Headlight lens'
  );
  lamp.rotation.y = Math.PI / 2;

  // Make the headlight glass glow, preserving its lens texture.
  lampMat.emissive.set('#fff0d2');
  lampMat.emissiveIntensity = 3;
  lampMat.emissiveMap = lensMap;
  lampMat.needsUpdate = true;

  // Add the actual light shining onto the environment.
  const headlightBeam = new THREE.SpotLight(
    0xfff0d2,       // Warm headlight color
    120,            // Beam intensity — adjust to suit your scene
    20,             // Maximum range in scene units
    Math.PI / 7,    // Cone half-angle
    0.55,           // Softness at the edge of the beam
    2               // Distance falloff
  );

  headlightBeam.name = 'Headlight beam';

  // Place it slightly ahead of the glass, outside the lamp housing.
  // In this model, +X points toward the front of the motorcycle.
  headlightBeam.position.set(headX + 0.075, headY, 0);

  // Aim forward and slightly downward.
  const headlightAim = new THREE.Object3D();
  headlightAim.name = 'Headlight aim';
  headlightAim.position.set(headX + 6, headY - 0.45, 0);

  // Keep BOTH attached to the cockpit so the beam follows steering.
  cockpit.add(headlightBeam, headlightAim);
  headlightBeam.target = headlightAim;

  // Shadow settings; these take effect when renderer shadows are enabled.
  headlightBeam.castShadow = true;
  headlightBeam.shadow.mapSize.set(1024, 1024);
  headlightBeam.shadow.camera.near = 0.05;
  headlightBeam.shadow.camera.far = 20;
  headlightBeam.shadow.bias = -0.0001;

  rod(
    cockpit, [.48, .824, 0], [.559, .815, 0],
    .018, black, 'Headlight bracket'
  );

  const bars = [
    [.342, 1.006, -.364],
    [.354, 1.010, -.273],
    [.388, .995, -.183],
    [.43, .977, -.107],
    [.44, .977, 0],
    [.43, .977, .107],
    [.388, .995, .183],
    [.354, 1.010, .273],
    [.342, 1.006, .364]
  ];

  pipe(cockpit, bars, .011, black, 'Low-rise handlebar', 100);

  for (const s of [-1, 1]) {
    rod(
      cockpit, [.438, .943, s * .047], [.438, .977, s * .047],
      .015, black, 'Handlebar riser'
    );

    block(
      cockpit, [.036, .019, .036], [.438, .98, s * .046],
      alloy, .004, 'Handlebar clamp'
    );
    bolt(cockpit, [.438, .992, s * .046], [0, 1, 0], .0045);

    rod(
      cockpit, [.352, 1.009, s * .280], [.342, 1.006, s * .371],
      .016, rubber, 'Ribbed hand grip', .015, 32
    );

    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      torus(
        cockpit,
        .016,
        .0011,
        [.352 - .01 * t, 1.009 - .003 * t, s * (.283 + .082 * t)],
        black,
        [0, 0, 1],
        'Grip rib'
      );
    }

    sphere(
      cockpit, [.015, .015, .005], [.342, 1.006, s * .373],
      black, 'Grip end cap'
    );
    block(
      cockpit, [.040, .034, .033], [.358, 1.013, s * .260],
      black, .006, 'Switch housing'
    );
    block(
      cockpit, [.019, .011, .004], [.340, 1.015, s * .279],
      darkSteel, .002, 'Switch paddle'
    );

    pipe(cockpit, [
      [.389, 1.006, s * .25],
      [.410, 1.004, s * .276],
      [.420, 1.000, s * .327],
      [.413, .994, s * .37]
    ], .0045, alloy, s > 0 ? 'Front brake lever' : 'Clutch lever', 38);

    sphere(
      cockpit, [.006, .006, .006], [.413, .994, s * .37],
      alloy, 'Lever end ball'
    );

    pipe(stockMirrors, [
      [.356, 1.025, s * .246],
      [.342, 1.069, s * .269],
      [.322, 1.118, s * .307]
    ], .005, black, 'Upright mirror stalk', 35);

    const normal = new THREE.Vector3(-.85, .18, s * .16).normalize();
    const p = new THREE.Vector3(.32, 1.139, s * .315);

    const mirror = block(
      stockMirrors, [.083, .047, .010], p.toArray(),
      black, .021, 'Oval mirror shell'
    );
    mirror.quaternion.setFromUnitVectors(Z, normal);

    const mirrorFace = block(
      stockMirrors,
      [.074, .037, .0015],
      p.clone().addScaledVector(normal, .0065).toArray(),
      glass,
      .017,
      'Reflective mirror face'
    );
    mirrorFace.quaternion.copy(mirror.quaternion);

    // Underslung, control-boss-mounted mirrors. These are not bar-end mirrors.
    // The outward offset is intentional: a simple vertical flip can hit the tank.
    const dropSide = group(s > 0 ? 'Right drop mirror' : 'Left drop mirror', dropMirrors);

    rod(
      dropSide, [.356, 1.016, s * .246], [.356, .988, s * .246],
      .008, black, 'Underside mounting boss'
    );
    bolt(dropSide, [.356, 1.022, s * .246], [0, 1, 0], .006);

    pipe(dropSide, [
      [.356, .996, s * .246],
      [.351, .965, s * .261],
      [.337, .930, s * .302],
      [.320, .905, s * .333]
    ], .0052, black, 'Swept underslung mirror stem', 42);

    const dp = new THREE.Vector3(.312, .880, s * .343);
    const dn = new THREE.Vector3(-.88, .20, s * .11).normalize();

    sphere(
      dropSide, [.009, .009, .009], [.320, .904, s * .333],
      darkSteel, 'Mirror swivel'
    );

    const ds = block(
      dropSide, [.091, .053, .012], dp.toArray(),
      black, .025, 'Drop mirror shell'
    );
    ds.quaternion.setFromUnitVectors(Z, dn);

    const df = block(
      dropSide,
      [.082, .043, .0015],
      dp.clone().addScaledVector(dn, .0075).toArray(),
      glass,
      .020,
      'Drop mirror glass'
    );
    df.quaternion.copy(ds.quaternion);

    rod(
      cockpit, [.515, .829, s * .086], [.528, .829, s * .148],
      .007, black, 'Front indicator stem'
    );
    sphere(
      cockpit, [.031, .023, .023], [.537, .829, s * .149],
      black, 'Front indicator shell'
    );

    const signal = add(
      cockpit,
      new THREE.CircleGeometry(.0195, 32),
      amber,
      [.565, .829, s * .149],
      'Front amber indicator lens'
    );
    signal.rotation.y = Math.PI / 2;
  }

  block(
    cockpit, [.044, .026, .030], [.397, 1.036, .228],
    black, .004, 'Brake-fluid reservoir'
  );

  for (const z of [.218, .238]) {
    bolt(cockpit, [.397, 1.050, z], [0, 1, 0], .0025);
  }

  pipe(cockpit, [
    [.366, 1.002, -.245],
    [.464, .903, -.134],
    [.45, .75, -.125],
    [.312, .586, -.139],
    [-.166, .314, -.187]
  ], .003, rubber, 'Clutch cable', 85);

  pipe(cockpit, [
    [.36, 1.011, .264],
    [.488, .95, .16],
    [.459, .832, .109],
    [.226, .771, .095],
    [.02, .631, .122]
  ], .003, rubber, 'Throttle cable', 75);

  const gaugeN = new THREE.Vector3(-.53, .848, 0).normalize();
  const gaugeP = new THREE.Vector3(.408, .997, 0);

  rod(
    cockpit,
    gaugeP.clone().addScaledVector(gaugeN, -.023).toArray(),
    gaugeP.toArray(),
    .045,
    black,
    'Speedometer housing',
    .045,
    48
  );

  torus(
    cockpit,
    .044,
    .0025,
    gaugeP.clone().addScaledVector(gaugeN, .001).toArray(),
    alloy,
    gaugeN.toArray(),
    'Speedometer bezel'
  );

  const dial = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#111519';
    c.fillRect(0, 0, w, h);
    c.translate(w / 2, h / 2);
    c.textAlign = 'center';

    for (let i = 0; i <= 48; i++) {
      const a = -Math.PI * .78 + i * Math.PI * 1.56 / 48;

      c.save();
      c.rotate(a);
      c.strokeStyle = '#e3e4df';
      c.lineWidth = i % 4 ? 2 : 4;
      c.beginPath();
      c.moveTo(0, -195);
      c.lineTo(0, i % 4 ? -182 : -171);
      c.stroke();

      if (i % 8 === 0) {
        c.fillStyle = '#c9cfd0';
        c.font = '27px Arial';
        c.fillText(String(i * 2.5), 0, -135);
      }

      c.restore();
    }

    c.fillStyle = '#bcc4c6';
    c.font = '20px Arial';
    c.fillText('MPH', 0, 62);
    c.font = '15px Arial';
    c.fillText('HARLEY-DAVIDSON', 0, 93);

    c.fillStyle = '#87917c';
    c.fillRect(-70, 110, 140, 32);
    c.fillStyle = '#152019';
    c.font = '21px monospace';
    c.fillText('00883', 0, 134);

    c.save();
    c.rotate(-2.25);
    c.fillStyle = '#ed743c';
    c.fillRect(-3, -164, 6, 177);
    c.restore();

    c.fillStyle = '#b1b6b7';
    c.beginPath();
    c.arc(0, 0, 13, 0, TAU);
    c.fill();
  });

  faceTexture(
    cockpit,
    .081,
    .081,
    gaugeP.clone().addScaledVector(gaugeN, .003).toArray(),
    dial,
    gaugeN.toArray(),
    'Speedometer dial'
  );

  const electrical = group('Wiring and rear lighting');

  pipe(electrical, [
    [-.202, .729, -.138],
    [-.231, .758, -.155],
    [-.069, .775, -.163],
    [.058, .757, -.157],
    [.079, .704, -.15]
  ], .0038, rubber, 'Ignition leads');

  pipe(electrical, [
    [.421, .854, -.040],
    [.263, .766, -.073],
    [-.091, .743, -.079],
    [-.326, .685, -.092]
  ], .006, rubber, 'Frame wiring loom');

  for (const s of [-1, 1]) {
    rod(
      electrical, [-.911, .587, s * .098], [-.911, .587, s * .150],
      .008, black, 'Rear indicator stalk'
    );
    sphere(
      electrical, [.030, .023, .023], [-.920, .587, s * .15],
      black, 'Rear indicator shell'
    );

    const lens = add(
      electrical,
      new THREE.CircleGeometry(.019, 32),
      red,
      [-.947, .587, s * .15],
      'Red tail/indicator lens'
    );
    lens.rotation.y = -Math.PI / 2;
  }

  rod(
    electrical, [-.959, .488, -.114], [-1.023, .462, -.149],
    .008, black, 'Side-mount plate bracket'
  );

  const plate = block(
    electrical, [.128, .077, .006], [-1.026, .475, -.154],
    black, .004, 'Side-mounted registration plate'
  );
  plate.rotation.y = -Math.PI / 2;
  plate.rotation.z = .10;

  const plateTex = canvasTexture(512, 256, (c, w, h) => {
    c.fillStyle = '#101417';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#a0a5a6';
    c.lineWidth = 7;
    c.strokeRect(15, 15, w - 30, h - 30);
    c.fillStyle = '#e0dfd8';
    c.textAlign = 'center';
    c.font = 'bold 128px Arial';
    c.fillText('883', w / 2, 172);
    c.font = '19px Arial';
    c.fillText('SPORTSTER', w / 2, 214);
  });

  faceTexture(
    electrical, .117, .066, [-1.031, .475, -.154],
    plateTex, [-1, 0, 0], 'Registration plate lettering'
  );

  const feet = group('Mid controls and side stand');

  for (const s of [-1, 1]) {
    rod(
      feet, [-.119, .283, s * .124], [-.119, .283, s * .237],
      .011, darkSteel, 'Footrest bracket'
    );
    rod(
      feet, [-.119, .283, s * .226], [-.119, .283, s * .310],
      .018, rubber, 'Ribbed mid-mount footpeg', .017, 24
    );

    for (let i = 0; i < 7; i++) {
      torus(
        feet, .018, .0015, [-.119, .283, s * (.236 + i * .010)],
        darkSteel, [0, 0, 1], 'Footpeg traction rib'
      );
    }

    bolt(feet, [-.119, .284, s * .201], [0, 1, 0], .0055);
  }

  pipe(feet, [
    [-.128, .272, .181],
    [-.064, .249, .242],
    [.063, .26, .263]
  ], .007, alloy, 'Rear brake pedal');

  block(
    feet, [.049, .013, .043], [.066, .264, .260],
    rubber, .005, 'Rear brake pedal pad'
  );

  pipe(feet, [
    [-.032, .342, -.193],
    [.064, .299, -.222],
    [.111, .295, -.246]
  ], .007, alloy, 'Gearshift lever');

  rod(
    feet, [.11, .295, -.226], [.11, .295, -.27],
    .011, rubber, 'Gearshift toe peg'
  );

  pipe(feet, [
    [-.271, .233, -.105],
    [-.315, .180, -.180],
    [-.405, .036, -.307],
    [-.426, .015, -.324]
  ], .009, chrome, 'Deployed side stand');

  block(
    feet, [.060, .006, .032], [-.435, .009, -.330],
    darkSteel, .009, 'Side-stand foot'
  );

  rod(
    feet, [-.284, .221, -.134], [-.352, .103, -.250],
    .004, black, 'Stand return spring'
  );

  // Preserve a true raked steering pivot so the wheel, mudguard, fork,
  // bars and lamp steer together.
  const pivot = new THREE.Vector3(.414, .863, 0);

  for (const child of frontAssembly.children) {
    child.position.sub(pivot);
  }

  frontAssembly.position.copy(pivot);
  frontAssembly.userData.steeringAxis = [-.440, .898, 0];

  bike.userData.components = bike.children.map(c => c.name);
  bike.userData.partCount = 0;

  bike.traverse(o => {
    if (o.isMesh) bike.userData.partCount++;
  });

  if (optimize) batchStaticMeshes(bike);

  bike.updateMatrixWorld(true);
  return bike;
}

/**
 * Merge direct sibling meshes by material; named component groups remain editable.
 * This avoids hundreds of draw calls for the fins, spokes, bolts and grip ribs.
 */
function batchStaticMeshes(root) {
  for (const child of [...root.children]) {
    if (child.isGroup) batchStaticMeshes(child);
  }

  const batches = new Map();

  for (const child of root.children) {
    if (!child.isMesh || Array.isArray(child.material)) continue;

    const key = child.material.uuid + '|' + child.castShadow + '|' + child.receiveShadow;

    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(child);
  }

  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;

    let length = 0;

    const gs = meshes.map(m => {
      m.updateMatrix();

      const g = m.geometry.index
        ? m.geometry.toNonIndexed()
        : m.geometry.clone();

      g.applyMatrix4(m.matrix);
      length += g.attributes.position.count;

      return g;
    });

    const p = new Float32Array(length * 3);
    const n = new Float32Array(length * 3);
    const uv = new Float32Array(length * 2);
    let offset = 0;

    for (const g of gs) {
      const count = g.attributes.position.count;

      p.set(g.attributes.position.array, offset * 3);
      n.set(g.attributes.normal.array, offset * 3);

      if (g.attributes.uv) {
        uv.set(g.attributes.uv.array, offset * 2);
      }

      offset += count;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(p, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(n, 3));
    merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

    const m = new THREE.Mesh(merged, meshes[0].material);
    m.name = root.name + ' / ' + meshes[0].material.name;
    m.castShadow = meshes[0].castShadow;
    m.receiveShadow = meshes[0].receiveShadow;
    m.userData.mergedParts = meshes.length;

    for (const old of meshes) {
      root.remove(old);
      old.geometry.dispose();
    }

    root.add(m);

    for (const g of gs) {
      g.dispose();
    }
  }
}

/**
 * Dispose only when this model is no longer used.
 * Materials are unique per factory call.
 */
export function disposeIron883(bike) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  bike.traverse(o => {
    if (!o.isMesh) return;

    geometries.add(o.geometry);

    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      materials.add(m);
    }
  });

  for (const m of materials) {
    for (const value of Object.values(m)) {
      if (value?.isTexture) textures.add(value);
    }

    m.dispose();
  }

  for (const g of geometries) g.dispose();
  for (const t of textures) t.dispose();

  bike.removeFromParent();
}

/** Switch the complete mirror assembly without rebuilding the motorcycle. */
export function setIron883Mirrors(bike, style = 'stock') {
  if (!['stock', 'drop', 'none'].includes(style)) {
    throw new TypeError('style must be stock, drop or none');
  }

  const stock = bike?.getObjectByName('Stock mirrors');
  const drop = bike?.getObjectByName('Drop mirrors');

  if (!stock || !drop) {
    throw new TypeError('Expected an Iron 883 with selectable mirror groups');
  }

  stock.visible = style === 'stock';
  drop.visible = style === 'drop';
  bike.userData.mirrors = style;

  return bike;
}

/**
 * Steering angle in DEGREES; +/-28 is a presentation limit, not an OEM specification.
 * All front-end components, including either mirror set, rotate around the raked neck.
 * Cables are visual approximations and do not simulate flex. This is not a dynamics rig.
 */
export function setIron883Steering(bike, degrees = 0) {
  if (!Number.isFinite(degrees)) {
    throw new TypeError('degrees must be a finite number');
  }

  const steering = bike?.getObjectByName('Steering assembly');

  if (!steering) {
    throw new TypeError('Expected an Iron 883 steering assembly');
  }

  const angle = THREE.MathUtils.clamp(degrees, -28, 28);

  steering.quaternion.setFromAxisAngle(
    new THREE.Vector3(...steering.userData.steeringAxis).normalize(),
    THREE.MathUtils.degToRad(angle)
  );

  bike.userData.steeringDegrees = angle;
  bike.updateMatrixWorld(true);

  return bike;
}
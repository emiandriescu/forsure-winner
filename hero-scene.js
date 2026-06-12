/* ════════════════════════════════════════════════
   SOWILO — scenă hero Three.js
   Clădire wireframe cu instalații 3D reale:
   tubulaturi rectangulare & circulare cu plenumuri
   și grile, CTA rooftop, recuperatoare la tavan,
   canalizare menajeră, distribuitoare de pardoseală,
   pat de cabluri — plus particule curgând prin trasee.
   ════════════════════════════════════════════════ */
import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
    try { init(); } catch (err) {
        console.warn('Hero 3D dezactivat:', err);
        canvas.style.display = 'none';
    }
}

function init() {
    const isMobile = window.matchMedia('(max-width: 920px)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(23, 13.5, 31);

    /* ── Lumini (pentru geometria volumetrică) ──── */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdde6f5, 1.05));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(6, 14, 9);
    scene.add(sun);

    /* ── Structura clădirii (wireframe) ─────────── */
    const FLOORS = 7, FH = 1.55;
    const W = 8, D = 6;
    const XS = [-W / 2, 0, W / 2];
    const ZS = [-D / 2, 0, D / 2];
    const TOP = FLOORS * FH;

    const group = new THREE.Group();
    scene.add(group);

    const linePts = [];
    const seg = (a, b) => linePts.push(a, b);
    for (let f = 0; f <= FLOORS; f++) {
        const y = f * FH;
        seg(new THREE.Vector3(-W / 2, y, -D / 2), new THREE.Vector3(W / 2, y, -D / 2));
        seg(new THREE.Vector3(W / 2, y, -D / 2),  new THREE.Vector3(W / 2, y, D / 2));
        seg(new THREE.Vector3(W / 2, y, D / 2),   new THREE.Vector3(-W / 2, y, D / 2));
        seg(new THREE.Vector3(-W / 2, y, D / 2),  new THREE.Vector3(-W / 2, y, -D / 2));
        seg(new THREE.Vector3(-W / 2, y, 0), new THREE.Vector3(W / 2, y, 0));
        seg(new THREE.Vector3(0, y, -D / 2), new THREE.Vector3(0, y, D / 2));
    }
    for (const x of XS) for (const z of ZS) {
        seg(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, TOP, z));
    }
    const buildGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const buildMat = new THREE.LineBasicMaterial({ color: 0x2B5CF6, transparent: true, opacity: 0.2 });
    group.add(new THREE.LineSegments(buildGeo, buildMat));

    const coreGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, TOP, 1.8));
    const coreMat = new THREE.LineBasicMaterial({ color: 0x2B5CF6, transparent: true, opacity: 0.35 });
    const core = new THREE.LineSegments(coreGeo, coreMat);
    core.position.set(-W / 4, TOP / 2, 0);
    group.add(core);

    const grid = new THREE.GridHelper(26, 13, 0x2B5CF6, 0x2B5CF6);
    grid.material.transparent = true;
    grid.material.opacity = 0.05;
    group.add(grid);

    /* ── Materiale instalații ───────────────────── */
    const soft = (c) => new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: 0.93 });
    const matDuct   = soft(0x5BC2D6);   // tubulatură HVAC
    const matPipe   = soft(0x3D6BF7);   // apă rece
    const matHeat   = soft(0xE06868);   // termice
    const matSewer  = soft(0xAAB4C8);   // canalizare
    const matTray   = soft(0xF0B055);   // pat cabluri
    const matUnit   = soft(0xCBD6EA);   // echipamente
    const matGrille = soft(0x6B7A9C);   // grile
    const matFan    = soft(0x4A5670);

    /* ── Ajutoare geometrie (trasee ortogonale) ─── */
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    // cutie între două puncte axiale: w = lățime laterală, h = înălțime
    function boxRun(a, b, w, h, mat) {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        let g;
        if (Math.abs(dx) > 0.001)      g = new THREE.BoxGeometry(Math.abs(dx), h, w);
        else if (Math.abs(dz) > 0.001) g = new THREE.BoxGeometry(w, h, Math.abs(dz));
        else                           g = new THREE.BoxGeometry(w, Math.abs(dy), h);
        const m = new THREE.Mesh(g, mat);
        m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        group.add(m);
        return m;
    }
    // cilindru între două puncte oarecare (acceptă și pante)
    function tubeRun(a, b, r, mat) {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const g = new THREE.CylinderGeometry(r, r, len, 10);
        const m = new THREE.Mesh(g, mat);
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
        group.add(m);
        return m;
    }
    function box(cx, cy, cz, sx, sy, sz, mat) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
        m.position.set(cx, cy, cz);
        group.add(m);
        return m;
    }

    /* ── HVAC: CTA rooftop + șaht + distribuții ─── */
    // șaht vertical rectangular în colț
    boxRun(V(3.3, 0.4, -2.35), V(3.3, TOP + 0.35, -2.35), 0.45, 0.55, matDuct);
    // CTA pe acoperiș: corp + ventilator + priză de aer
    box(2.2, TOP + 0.52, -1.45, 2.1, 1.0, 1.2, matUnit);
    const ctaFan = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 18), matFan);
    ctaFan.position.set(1.75, TOP + 1.07, -1.45);
    group.add(ctaFan);
    box(2.95, TOP + 0.45, -1.45, 0.45, 0.5, 0.5, matGrille);            // priză aer
    boxRun(V(3.3, TOP + 0.3, -2.35), V(3.3, TOP + 0.3, -2.05), 0.45, 0.5, matDuct); // legătură CTA
    boxRun(V(3.3, TOP + 0.3, -2.05), V(2.6, TOP + 0.3, -2.05), 0.45, 0.5, matDuct);

    // distribuții pe etajele 1,3,5: tubulatură rectangulară + ramificații
    // circulare cu plenum și grilă
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.5;
        boxRun(V(3.3, y, -2.35), V(3.3, y, 1.6), 0.46, 0.3, matDuct);
        boxRun(V(3.3, y, 1.6), V(-2.4, y, 1.6), 0.46, 0.3, matDuct);
        for (const bx of [-1.4, 0.7]) {
            tubeRun(V(bx, y, 1.6), V(bx, y, 0.25), 0.13, matDuct);      // ramificație circulară
            box(bx, y - 0.06, 0.05, 0.42, 0.2, 0.42, matDuct);          // plenum
            box(bx, y - 0.2, 0.05, 0.56, 0.04, 0.56, matGrille);        // grilă
        }
    }
    // recuperatoare de căldură la tavan (etajele 2 și 6)
    for (const f of [2, 6]) {
        const y = f * FH - 0.48;
        box(-1.6, y, -1.8, 0.95, 0.32, 0.6, matUnit);
        tubeRun(V(-2.1, y, -1.8), V(-2.85, y, -1.8), 0.12, matDuct);
        tubeRun(V(-1.1, y, -1.8), V(-0.35, y, -1.8), 0.12, matDuct);
    }

    /* ── Sanitare: canalizare 3D + apă rece ─────── */
    // coloană menajeră + ieșire la colector în pantă
    tubeRun(V(-3.0, 0.18, 1.15), V(-3.0, TOP - 0.4, 1.15), 0.16, matSewer);
    tubeRun(V(-3.0, 0.18, 1.15), V(-3.0, 0.08, 3.6), 0.16, matSewer);
    for (let f = 1; f <= FLOORS; f++) {
        const y = f * FH;
        tubeRun(V(-1.2, y + 0.14, 2.3), V(-3.0, y + 0.04, 1.15), 0.10, matSewer); // racord în pantă
    }
    // apă rece: riser + distribuții
    tubeRun(V(-3.2, 0, 0.7), V(-3.2, TOP - 0.5, 0.7), 0.07, matPipe);
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.28;
        tubeRun(V(-3.2, y, 0.7), V(1.4, y, 0.7), 0.055, matPipe);
        tubeRun(V(1.4, y, 0.7), V(1.4, y, 2.3), 0.055, matPipe);
    }

    /* ── Termice: riser + distribuitoare pardoseală ─ */
    tubeRun(V(-3.2, 0, -0.7), V(-3.2, TOP - 1.2, -0.7), 0.07, matHeat);
    for (const f of [0, 2, 4]) {
        const y = f * FH + 0.14;
        tubeRun(V(-3.2, y, -0.7), V(0.6, y, -0.7), 0.05, matHeat);
        // distribuitor cu circuite (stuburi alternate roșu/albastru)
        box(0.85, f * FH + 0.3, -0.7, 0.5, 0.16, 0.14, matUnit);
        for (let s = 0; s < 5; s++) {
            const m = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8),
                s % 2 ? matPipe : matHeat
            );
            m.position.set(0.69 + s * 0.08, f * FH + 0.12, -0.7);
            group.add(m);
        }
    }

    /* ── Electrice: pat de cabluri ──────────────── */
    boxRun(V(-3.45, 0.2, -2.55), V(-3.45, TOP - 0.3, -2.55), 0.26, 0.06, matTray);
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.12;
        boxRun(V(-3.45, y, -2.55), V(3.0, y, -2.55), 0.26, 0.06, matTray);
    }

    /* ── Particule curgând prin sisteme ─────────── */
    const SYSTEMS = [
        { color: 0x49B8CF, routes: [] },  // aer
        { color: 0x2B5CF6, routes: [] },  // apă
        { color: 0xE05252, routes: [] },  // termice
        { color: 0xF59E0B, routes: [] },  // cabluri
    ];
    const route = pts => pts.map(p => V(p[0], p[1], p[2]));

    SYSTEMS[0].routes.push(route([[3.3, TOP + 0.3, -2.35], [3.3, 0.6, -2.35]]));
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.5;
        SYSTEMS[0].routes.push(route([[3.3, y, -2.35], [3.3, y, 1.6], [-2.4, y, 1.6]]));
    }
    SYSTEMS[1].routes.push(route([[-3.2, 0, 0.7], [-3.2, TOP - 0.5, 0.7]]));
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.28;
        SYSTEMS[1].routes.push(route([[-3.2, y, 0.7], [1.4, y, 0.7], [1.4, y, 2.3]]));
    }
    for (const f of [0, 2, 4]) {
        const y = f * FH + 0.14;
        SYSTEMS[2].routes.push(route([[-3.2, 0, -0.7], [-3.2, y, -0.7], [0.6, y, -0.7]]));
    }
    SYSTEMS[3].routes.push(route([[-3.45, 0.2, -2.55], [-3.45, TOP - 0.3, -2.55]]));
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.12;
        SYSTEMS[3].routes.push(route([[-3.45, y, -2.55], [3.0, y, -2.55]]));
    }

    const COUNT = isMobile ? 60 : 150;
    const paths = [];

    function buildPath() {
        const sys = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)];
        const pts = sys.routes[Math.floor(Math.random() * sys.routes.length)];
        let len = 0;
        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
            len += pts[i].distanceTo(pts[i - 1]);
            cum.push(len);
        }
        return { pts, cum, len, t: Math.random(), ws: 1.1 + Math.random() * 1.5, color: sys.color };
    }
    for (let i = 0; i < COUNT; i++) paths.push(buildPath());

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(COUNT * 3);
    const pCol = new Float32Array(COUNT * 3);
    const tmpColor = new THREE.Color();
    function paintParticle(i) {
        tmpColor.setHex(paths[i].color);
        pCol[i * 3] = tmpColor.r; pCol[i * 3 + 1] = tmpColor.g; pCol[i * 3 + 2] = tmpColor.b;
    }
    for (let i = 0; i < COUNT; i++) paintParticle(i);
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
        size: isMobile ? 0.14 : 0.12, vertexColors: true,
        transparent: true, opacity: 0.95, sizeAttenuation: true
    });
    group.add(new THREE.Points(pGeo, pMat));

    function samplePath(path, t) {
        const dist = t * path.len;
        let i = 1;
        while (i < path.cum.length - 1 && path.cum[i] < dist) i++;
        const segLen = path.cum[i] - path.cum[i - 1];
        const k = segLen > 0 ? (dist - path.cum[i - 1]) / segLen : 0;
        return new THREE.Vector3().lerpVectors(path.pts[i - 1], path.pts[i], k);
    }

    /* ── Poziționare & responsive ───────────────── */
    const lookTarget = new THREE.Vector3(0, TOP / 2 - 1, 0);

    function layout() {
        const w = canvas.clientWidth || canvas.parentElement.clientWidth;
        const h = canvas.clientHeight || canvas.parentElement.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const mobile = window.matchMedia('(max-width: 920px)').matches;
        group.position.x = mobile ? 0 : Math.max(7.2, Math.min(11, 5.6 * camera.aspect));
        group.position.z = mobile ? -2 : 0;
        camera.updateProjectionMatrix();
    }
    layout();
    window.addEventListener('resize', layout);

    /* ── Parallax mouse ─────────────────────────── */
    let mx = 0, my = 0;
    if (!reduceMotion) {
        window.addEventListener('mousemove', e => {
            mx = (e.clientX / window.innerWidth - 0.5);
            my = (e.clientY / window.innerHeight - 0.5);
        }, { passive: true });
    }

    /* ── Buclă animație ─────────────────────────── */
    const clock = new THREE.Clock();
    let visible = true, raf = null;

    const io = new IntersectionObserver(entries => {
        visible = entries.some(e => e.isIntersecting);
        if (visible && raf === null) loop();
    });
    io.observe(canvas);

    function loop() {
        if (!visible || document.hidden) { raf = null; return; }
        raf = requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        group.rotation.y = reduceMotion ? 0.5 : t * 0.07 + mx * 0.35;
        camera.position.y = 9.5 + (reduceMotion ? 0 : my * -1.2 + Math.sin(t * 0.4) * 0.25);
        camera.lookAt(lookTarget);
        ctaFan.rotation.y = t * 4;

        if (!reduceMotion) {
            let recolored = false;
            for (let i = 0; i < COUNT; i++) {
                const p = paths[i];
                p.t += (p.ws * dt) / p.len;
                if (p.t >= 1) {
                    paths[i] = buildPath();
                    paths[i].t = 0;
                    paintParticle(i);
                    recolored = true;
                }
                const v = samplePath(paths[i], paths[i].t);
                pPos[i * 3] = v.x; pPos[i * 3 + 1] = v.y; pPos[i * 3 + 2] = v.z;
            }
            pGeo.attributes.position.needsUpdate = true;
            if (recolored) pGeo.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && visible && raf === null) loop();
    });

    if (reduceMotion) {
        for (let i = 0; i < COUNT; i++) {
            const v = samplePath(paths[i], paths[i].t);
            pPos[i * 3] = v.x; pPos[i * 3 + 1] = v.y; pPos[i * 3 + 2] = v.z;
        }
        pGeo.attributes.position.needsUpdate = true;
        group.rotation.y = 0.5;
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
    } else {
        loop();
    }
}

/* ════════════════════════════════════════════════
   SOWILO — scenă hero Three.js
   Clădire wireframe cu particule curgând prin
   trasee de instalații (riser-e + distribuții)
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

    /* ── Geometria clădirii ─────────────────────── */
    const FLOORS = 7, FH = 1.55;          // etaje, înălțime etaj
    const W = 8, D = 6;                   // amprentă (x, z)
    const XS = [-W / 2, 0, W / 2];        // axe stâlpi x
    const ZS = [-D / 2, 0, D / 2];        // axe stâlpi z
    const TOP = FLOORS * FH;

    const group = new THREE.Group();
    scene.add(group);

    const linePts = [];
    const seg = (a, b) => linePts.push(a, b);

    // contur placă la fiecare etaj
    for (let f = 0; f <= FLOORS; f++) {
        const y = f * FH;
        seg(new THREE.Vector3(-W / 2, y, -D / 2), new THREE.Vector3(W / 2, y, -D / 2));
        seg(new THREE.Vector3(W / 2, y, -D / 2),  new THREE.Vector3(W / 2, y, D / 2));
        seg(new THREE.Vector3(W / 2, y, D / 2),   new THREE.Vector3(-W / 2, y, D / 2));
        seg(new THREE.Vector3(-W / 2, y, D / 2),  new THREE.Vector3(-W / 2, y, -D / 2));
        // grinzi intermediare
        seg(new THREE.Vector3(-W / 2, y, 0), new THREE.Vector3(W / 2, y, 0));
        seg(new THREE.Vector3(0, y, -D / 2), new THREE.Vector3(0, y, D / 2));
    }
    // stâlpi
    for (const x of XS) for (const z of ZS) {
        seg(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, TOP, z));
    }

    const buildGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const buildMat = new THREE.LineBasicMaterial({ color: 0x2B5CF6, transparent: true, opacity: 0.16 });
    group.add(new THREE.LineSegments(buildGeo, buildMat));

    // nucleu tehnic (casa scării) — mai pronunțat
    const coreGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, TOP, 1.8));
    const coreMat = new THREE.LineBasicMaterial({ color: 0x2B5CF6, transparent: true, opacity: 0.42 });
    const core = new THREE.LineSegments(coreGeo, coreMat);
    core.position.set(-W / 4, TOP / 2, 0);
    group.add(core);

    // plan teren — grilă discretă
    const grid = new THREE.GridHelper(26, 13, 0x2B5CF6, 0x2B5CF6);
    grid.material.transparent = true;
    grid.material.opacity = 0.05;
    group.add(grid);

    /* ── Trasee instalații + particule ──────────── */
    // Fiecare particulă urcă printr-un riser apoi se distribuie orizontal pe un etaj.
    const COUNT = isMobile ? 60 : 150;
    const paths = [];

    const risers = [
        new THREE.Vector2(-W / 4 - 1.1, 0.9),   // lângă nucleu
        new THREE.Vector2(-W / 4 - 1.1, -0.9),
        new THREE.Vector2(W / 2 - 0.4, -D / 2 + 0.4),
        new THREE.Vector2(-W / 2 + 0.4, D / 2 - 0.4),
    ];

    function buildPath() {
        const r = risers[Math.floor(Math.random() * risers.length)];
        const floor = 1 + Math.floor(Math.random() * FLOORS);
        const y = floor * FH - 0.25;
        const p0 = new THREE.Vector3(r.x, 0, r.y);
        const p1 = new THREE.Vector3(r.x, y, r.y);
        // distribuție orizontală: întâi pe x, apoi pe z
        const tx = (Math.random() - 0.5) * (W - 1);
        const tz = (Math.random() - 0.5) * (D - 1);
        const p2 = new THREE.Vector3(tx, y, r.y);
        const p3 = new THREE.Vector3(tx, y, tz);
        const pts = [p0, p1, p2, p3];
        let len = 0;
        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
            len += pts[i].distanceTo(pts[i - 1]);
            cum.push(len);
        }
        return { pts, cum, len, t: Math.random(), speed: 0.04 + Math.random() * 0.05 };
    }
    for (let i = 0; i < COUNT; i++) paths.push(buildPath());

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(COUNT * 3);
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x2B5CF6, size: isMobile ? 0.13 : 0.11,
        transparent: true, opacity: 0.9, sizeAttenuation: true
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
        // pe desktop clădirea stă în dreapta textului (mai la dreapta pe ecrane late);
        // pe mobil — centrată în fundal
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

        if (!reduceMotion) {
            for (let i = 0; i < COUNT; i++) {
                const p = paths[i];
                p.t += p.speed * dt * 3;
                if (p.t >= 1) { paths[i] = buildPath(); paths[i].t = 0; }
                const v = samplePath(paths[i], paths[i].t);
                pPos[i * 3] = v.x; pPos[i * 3 + 1] = v.y; pPos[i * 3 + 2] = v.z;
            }
            pGeo.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && visible && raf === null) loop();
    });

    if (reduceMotion) {
        // un singur cadru static
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

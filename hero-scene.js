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

    /* ── Instalații: trasee vizibile pe sisteme ──── */
    // Trei sisteme colorate ca pe planșe: conducte (albastru), tubulaturi
    // HVAC (cyan, linie dublă), cabluri electrice (chihlimbar).
    const SYSTEMS = [
        { color: 0x2B5CF6, opacity: 0.55, routes: [] },                 // conducte
        { color: 0x16B3CF, opacity: 0.50, routes: [], double: true },   // tubulaturi
        { color: 0xF59E0B, opacity: 0.50, routes: [] },                 // cabluri
    ];
    const route = pts => pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));

    // conducte: două risere lângă nucleu, ramificații alternate pe etaje
    const prx = -3.1;
    SYSTEMS[0].routes.push(route([[prx, 0, 1.05], [prx, TOP - 0.4, 1.05]]));
    SYSTEMS[0].routes.push(route([[prx, 0, -1.05], [prx, TOP - 0.4, -1.05]]));
    for (let f = 1; f <= FLOORS; f++) {
        const y = f * FH - 0.35;
        if (f % 2 === 1) SYSTEMS[0].routes.push(route([[prx, y, 1.05], [1.8, y, 1.05], [1.8, y, 2.4]]));
        else             SYSTEMS[0].routes.push(route([[prx, y, -1.05], [2.6, y, -1.05], [2.6, y, -2.3]]));
    }
    // tubulaturi: șaht în colț, distribuție sub placă din două în două etaje
    const dx = 3.35, dz = -2.45;
    SYSTEMS[1].routes.push(route([[dx, 0, dz], [dx, TOP - 0.5, dz]]));
    for (let f = 1; f <= FLOORS; f += 2) {
        const y = f * FH - 0.55;
        SYSTEMS[1].routes.push(route([[dx, y, dz], [dx, y, 1.9], [-2.2, y, 1.9]]));
    }
    // cabluri: pat de cabluri pe perimetru, sub fiecare placă
    const cx = -3.45, cz = -2.55;
    SYSTEMS[2].routes.push(route([[cx, 0, cz], [cx, TOP - 0.3, cz]]));
    for (let f = 1; f <= FLOORS; f++) {
        const y = f * FH - 0.18;
        if (f % 2 === 0) SYSTEMS[2].routes.push(route([[cx, y, cz], [3.2, y, cz]]));
        else             SYSTEMS[2].routes.push(route([[cx, y, cz], [cx, y, 2.3], [0.8, y, 2.3]]));
    }

    // liniile vizibile ale sistemelor
    SYSTEMS.forEach(sys => {
        const pts = [];
        sys.routes.forEach(r => {
            for (let i = 1; i < r.length; i++) {
                pts.push(r[i - 1], r[i]);
                if (sys.double) {
                    const off = new THREE.Vector3(0, -0.16, 0);
                    pts.push(r[i - 1].clone().add(off), r[i].clone().add(off));
                }
            }
        });
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color: sys.color, transparent: true, opacity: sys.opacity });
        group.add(new THREE.LineSegments(g, m));
    });

    /* ── Particule curgând prin sisteme ─────────── */
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
        // viteză constantă în unități-lume, indiferent de lungimea traseului
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

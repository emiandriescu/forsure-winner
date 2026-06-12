/* ════════════════════════════════════════════════
   SOWILO — iconuri 3D animate (servicii)
   Un singur renderer WebGL desenează toate cele 6
   mini-scene prin scissor, peste grila de servicii.
   Fallback: SVG-urile statice rămân la
   prefers-reduced-motion sau fără WebGL.
   ════════════════════════════════════════════════ */
import * as THREE from 'three';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const grid = document.querySelector('.services-grid');
const stages = grid ? [...grid.querySelectorAll('.service-icon[data-icon]')] : [];

if (grid && stages.length && !reduceMotion) {
    try { init(); } catch (err) { console.warn('Iconuri 3D dezactivate:', err); }
}

function init() {
    const canvas = document.createElement('canvas');
    canvas.id = 'icons-canvas';
    grid.appendChild(canvas);
    document.body.classList.add('icons-3d');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setScissorTest(true);

    /* ── Materiale comune ───────────────────────── */
    const BLUE = 0x2B5CF6, CYAN = 0x35AECC, STEEL = 0xC9D4E8,
          DARK = 0x44506B, RED = 0xE0455A, WATER = 0x3D7BFF, SMOKE = 0x9AA7BD;
    const lamb = (c, opts = {}) => new THREE.MeshLambertMaterial({ color: c, ...opts });

    function makeScene() {
        const sc = new THREE.Scene();
        sc.add(new THREE.HemisphereLight(0xffffff, 0xdde6f5, 1.1));
        const d = new THREE.DirectionalLight(0xffffff, 0.8);
        d.position.set(2, 4, 3);
        sc.add(d);
        const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
        cam.position.set(0.9, 0.7, 2.9);
        cam.lookAt(0, 0, 0);
        return { sc, cam };
    }

    function makePoints(sc, count, color, size) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color, size, transparent: true, opacity: 0.95, sizeAttenuation: true
        });
        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false; // pozițiile se schimbă pe CPU; sfera de bounding ar rămâne veche
        sc.add(pts);
        return { pos, geo, mat };
    }

    /* ── Constructori de scene per specialitate ─── */
    const builders = {

        /* fulger extrudat care pulsează */
        electrice(sc) {
            const sh = new THREE.Shape();
            const pts = [[0.11, 1.11], [-0.78, -0.17], [-0.11, -0.17],
                         [-0.22, -1.11], [0.67, 0.17], [0, 0.17]];
            sh.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
            const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.28, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
            geo.center();
            const mat = new THREE.MeshStandardMaterial({
                color: BLUE, roughness: 0.35, metalness: 0.15,
                emissive: BLUE, emissiveIntensity: 0.15
            });
            const bolt = new THREE.Mesh(geo, mat);
            sc.add(bolt);
            return t => {
                bolt.rotation.y = Math.sin(t * 0.9) * 0.55;
                mat.emissiveIntensity = 0.12 + Math.max(0, Math.sin(t * 3.2)) * 0.35;
            };
        },

        /* vană care se deschide / închide, cu apă curgând */
        sanitare(sc) {
            sc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 14), lamb(STEEL))
                .rotateZ(Math.PI / 2));
            sc.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 12), lamb(BLUE)));
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), lamb(DARK));
            stem.position.y = 0.4;
            sc.add(stem);
            const wheel = new THREE.Group();
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 10, 24), lamb(RED));
            ring.rotation.x = Math.PI / 2;
            wheel.add(ring);
            for (let i = 0; i < 3; i++) {
                const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 6), lamb(RED));
                sp.rotation.x = Math.PI / 2;
                sp.rotation.y = (i * Math.PI) / 3;
                wheel.add(sp);
            }
            wheel.position.y = 0.6;
            sc.add(wheel);
            const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 12), lamb(STEEL));
            elbow.position.set(0.62, -0.22, 0);
            sc.add(elbow);

            const N = 36;
            const water = makePoints(sc, N, WATER, 0.08);
            const drops = Array.from({ length: N }, () => ({
                y: -0.4 - Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.06, x: 0.62, z: 0
            }));
            return (t, dt) => {
                const open = Math.sin(t * 0.7);
                wheel.rotation.y = open * 1.4;
                const flowing = open > -0.25;
                water.mat.opacity = flowing ? 0.95 : 0;
                for (let i = 0; i < N; i++) {
                    const p = drops[i];
                    p.y -= dt * (1.4 + i % 3 * 0.3);
                    p.x += p.vx * dt;
                    if (p.y < -1.15) { p.y = -0.42; p.x = 0.62; p.vx = (Math.random() - 0.5) * 0.06; }
                    water.pos[i * 3] = p.x; water.pos[i * 3 + 1] = p.y; water.pos[i * 3 + 2] = p.z;
                }
                water.geo.attributes.position.needsUpdate = true;
            };
        },

        /* tubulatură cu plenum și grilă, aer ieșind */
        hvac(sc) {
            const duct = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.42, 0.48), lamb(CYAN));
            duct.position.y = 0.55;
            sc.add(duct);
            const plen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.52), lamb(CYAN));
            plen.position.y = 0.18;
            sc.add(plen);
            const grille = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.72), lamb(STEEL));
            grille.position.y = -0.02;
            sc.add(grille);
            for (let i = -1; i <= 1; i++) {
                const slat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.09), lamb(DARK));
                slat.position.set(0, -0.06, i * 0.2);
                sc.add(slat);
            }
            const N = 54;
            const air = makePoints(sc, N, CYAN, 0.055);
            const parts = Array.from({ length: N }, () => ({ ph: Math.random() }));
            return (t, dt) => {
                for (let i = 0; i < N; i++) {
                    const p = parts[i];
                    p.ph = (p.ph + dt * 0.45) % 1;
                    let x, y, z;
                    if (p.ph < 0.45) {            // prin tubulatură
                        x = -0.85 + (p.ph / 0.45) * 0.85;
                        y = 0.55 + Math.sin(i) * 0.1;
                        z = Math.cos(i * 2.3) * 0.12;
                    } else {                      // coboară prin plenum și iese sub grilă
                        const k = (p.ph - 0.45) / 0.55;
                        x = Math.sin(i * 1.7) * 0.28 * k;
                        y = 0.4 - k * 1.35;
                        z = Math.cos(i * 1.3) * 0.28 * k;
                    }
                    air.pos[i * 3] = x; air.pos[i * 3 + 1] = y; air.pos[i * 3 + 2] = z;
                }
                air.geo.attributes.position.needsUpdate = true;
            };
        },

        /* detector cu LED care clipește și unde de alarmă */
        detectie(sc) {
            const plate = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 1.35), lamb(STEEL));
            plate.position.y = 0.78;
            sc.add(plate);
            const det = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.4, 0.24, 22), lamb(0xEDF1FA));
            det.position.y = 0.6;
            sc.add(det);
            const ledMat = new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 1 });
            const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), ledMat);
            led.position.set(0.2, 0.46, 0.2);
            sc.add(led);
            const rings = [0, 0.8].map(off => {
                const m = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.6 });
                const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 32), m);
                r.rotation.x = Math.PI / 2;
                r.position.y = 0.42;
                sc.add(r);
                return { r, m, off };
            });
            return t => {
                ledMat.emissiveIntensity = (t % 1.2) < 0.18 ? 1.6 : 0.15;
                rings.forEach(({ r, m, off }) => {
                    const k = ((t * 0.62 + off) % 1);
                    r.scale.setScalar(0.6 + k * 2.4);
                    r.position.y = 0.42 - k * 0.5;
                    m.opacity = 0.55 * (1 - k);
                });
            };
        },

        /* sprinkler care stropește */
        stingere(sc) {
            const plate = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 1.35), lamb(STEEL));
            plate.position.y = 0.82;
            sc.add(plate);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 10), lamb(RED));
            stem.position.y = 0.6;
            sc.add(stem);
            const defl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 16), lamb(DARK));
            defl.position.y = 0.38;
            sc.add(defl);
            const N = 130;
            const spray = makePoints(sc, N, 0x2F6BFF, 0.085);
            spray.mat.opacity = 1;
            // traiectorii balistice în formă închisă, fără stare integrată
            const parts = Array.from({ length: N }, () => ({
                a: Math.random() * Math.PI * 2,
                sp: 0.18 + Math.random() * 0.34,
                vy: 0.1 + Math.random() * 0.15,
                ph: Math.random(),
                dur: 1.05 + Math.random() * 0.4
            }));
            return (t, dt) => {
                for (let i = 0; i < N; i++) {
                    const p = parts[i];
                    p.ph += dt / p.dur;
                    if (p.ph >= 1) { p.ph = 0; p.a = Math.random() * Math.PI * 2; }
                    const tt = p.ph * p.dur;
                    spray.pos[i * 3]     = Math.cos(p.a) * p.sp * tt;
                    spray.pos[i * 3 + 1] = 0.4 - p.vy * tt - 0.7 * tt * tt;
                    spray.pos[i * 3 + 2] = Math.sin(p.a) * p.sp * tt;
                }
                spray.geo.attributes.position.needsUpdate = true;
            };
        },

        /* ventilator axial cu elice care se învârte, fum trecând */
        desfumare(sc) {
            const fan = new THREE.Group();
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 12, 30), lamb(STEEL));
            fan.add(ring);
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.22, 14), lamb(DARK));
            hub.rotation.x = Math.PI / 2;
            fan.add(hub);
            const blades = new THREE.Group();
            const bladeMat = new THREE.MeshStandardMaterial({
                color: BLUE, roughness: 0.4, emissive: BLUE, emissiveIntensity: 0.3
            });
            for (let i = 0; i < 4; i++) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.17, 0.035), bladeMat);
                const a = (i * Math.PI) / 2;
                b.position.set(Math.cos(a) * 0.33, Math.sin(a) * 0.33, 0);
                b.rotation.set(0.5, 0, a);
                blades.add(b);
            }
            fan.add(blades);
            fan.rotation.y = 0.45;
            sc.add(fan);
            const N = 26;
            const smoke = makePoints(sc, N, SMOKE, 0.09);
            smoke.mat.opacity = 0.55;
            const parts = Array.from({ length: N }, () => ({ ph: Math.random(), r: Math.random() * 0.4, a: Math.random() * Math.PI * 2 }));
            return (t, dt) => {
                blades.rotation.z -= dt * 7;
                for (let i = 0; i < N; i++) {
                    const p = parts[i];
                    p.ph = (p.ph + dt * 0.3) % 1;
                    const z = -1.1 + p.ph * 2.2;
                    smoke.pos[i * 3] = Math.cos(p.a + t * 0.4) * p.r * 0.8;
                    smoke.pos[i * 3 + 1] = Math.sin(p.a + t * 0.4) * p.r * 0.8;
                    smoke.pos[i * 3 + 2] = z;
                }
                smoke.geo.attributes.position.needsUpdate = true;
            };
        },
    };

    /* ── Construiește scenele ───────────────────── */
    const items = stages.map(stage => {
        const { sc, cam } = makeScene();
        const update = builders[stage.dataset.icon] ? builders[stage.dataset.icon](sc) : null;
        return { stage, sc, cam, update };
    }).filter(it => it.update);

    /* ── Dimensionare canvas peste grilă ────────── */
    function size() {
        const r = grid.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
    }
    size();
    new ResizeObserver(size).observe(grid);

    /* ── Buclă cu scissor per icon ──────────────── */
    const clock = new THREE.Clock();
    let visible = false, raf = null;

    const io = new IntersectionObserver(entries => {
        visible = entries.some(e => e.isIntersecting);
        if (visible && raf === null) loop();
    }, { rootMargin: '120px' });
    io.observe(grid);

    function loop() {
        if (!visible || document.hidden) { raf = null; return; }
        raf = requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        const gRect = grid.getBoundingClientRect();

        items.forEach(({ stage, sc, cam, update }) => {
            const r = stage.getBoundingClientRect();
            const left = r.left - gRect.left;
            const bottom = gRect.bottom - r.bottom;
            cam.aspect = r.width / r.height;
            cam.updateProjectionMatrix();
            renderer.setViewport(left, bottom, r.width, r.height);
            renderer.setScissor(left, bottom, r.width, r.height);
            update(t, dt);
            renderer.render(sc, cam);
        });
    }
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && visible && raf === null) loop();
    });
}

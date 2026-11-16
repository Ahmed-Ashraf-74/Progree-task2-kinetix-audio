/* ==========================================================================
   KINETIX KX-01 // INTERACTIVE 3D WEBGL HEADPHONE & TELEMETRY ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById("mobileToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-link");

  mobileToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    mobileToggle.setAttribute("aria-expanded", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
    });
  });

  // 2. Live Waveform & Neural ANC Toggle
  const waveformBox = document.getElementById("waveformBox");
  const waveBars = waveformBox.querySelectorAll("span");
  const ancToggleBtn = document.getElementById("ancToggleBtn");
  const ancBtnText = document.getElementById("ancBtnText");
  const dbReadout = document.getElementById("dbReadout");

  let ancEnabled = true;
  waveformBox.classList.add("anc-active");

  ancToggleBtn.addEventListener("click", () => {
    ancEnabled = !ancEnabled;
    waveformBox.classList.toggle("anc-active", ancEnabled);
    ancBtnText.textContent = ancEnabled
      ? "TEST NEURAL ANC: ON"
      : "TEST NEURAL ANC: OFF";
    dbReadout.textContent = ancEnabled ? "-48.4 dB" : "-04.0 dB";
    dbReadout.style.color = ancEnabled ? "#c8ff00" : "#ff4d00";
  });

  setInterval(() => {
    waveBars.forEach((bar) => {
      const minH = ancEnabled ? 12 : 35;
      const maxH = ancEnabled ? 42 : 98;
      const randomHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
      bar.style.height = `${randomHeight}%`;
    });
  }, 160);

  // 3. Interactive 3D Headphone Scene (Three.js)
  const stage = document.getElementById("webglStage");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 0.2, 6.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  // Studio Lighting Setup (Balanced 3-Point + Rim Illumination)
  const ambientLight = new THREE.AmbientLight(0xdce4f5, 1.15);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
  keyLight.position.set(5, 7, 8);
  scene.add(keyLight);

  const topBackLight = new THREE.DirectionalLight(0xe2e8f0, 1.35);
  topBackLight.position.set(-4, 6, -5);
  scene.add(topBackLight);

  const rimLight = new THREE.PointLight(0xff4d00, 2.4, 18);
  rimLight.position.set(-4.5, 1.5, 2.5);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xc8ff00, 1.4, 18);
  fillLight.position.set(4.5, -2.5, 4);
  scene.add(fillLight);

  // Materials (High-Contrast Brushed Titanium & Charcoal Cushions)
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x737d91,
    metalness: 0.62,
    roughness: 0.26,
  });

  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x282d38,
    metalness: 0.12,
    roughness: 0.72,
  });

  const metalAccentMat = new THREE.MeshStandardMaterial({
    color: 0xcbd2e0,
    metalness: 0.85,
    roughness: 0.18,
  });

  const ledRingMat = new THREE.MeshBasicMaterial({
    color: 0xff4d00,
  });

  // Procedural 3D Headphone Assembly
  const headphoneGroup = new THREE.Group();
  scene.add(headphoneGroup);

  // Headband Arc
  const bandGeo = new THREE.TorusGeometry(1.45, 0.13, 24, 64, Math.PI * 1.12);
  const headband = new THREE.Mesh(bandGeo, chassisMat);
  headband.rotation.z = -Math.PI * 0.06;
  headband.position.y = 0.35;
  headphoneGroup.add(headband);

  // Inner Headband Cushion
  const innerBandGeo = new THREE.TorusGeometry(
    1.34,
    0.07,
    16,
    48,
    Math.PI * 0.85,
  );
  const innerBand = new THREE.Mesh(innerBandGeo, cushionMat);
  innerBand.rotation.z = Math.PI * 0.075;
  innerBand.position.y = 0.35;
  headphoneGroup.add(innerBand);

  // Helper to build Left & Right Ear Cups
  function createEarCup(side) {
    const cupGroup = new THREE.Group();
    const dir = side === "left" ? -1 : 1;

    // Yoke / Slider Arm
    const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.85, 16);
    const arm = new THREE.Mesh(armGeo, metalAccentMat);
    arm.position.set(dir * 1.42, -0.05, 0);
    arm.rotation.z = dir * -0.14;
    cupGroup.add(arm);

    // Outer Shell Housing
    const shellGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.36, 36);
    const shell = new THREE.Mesh(shellGeo, chassisMat);
    shell.rotation.z = Math.PI / 2;
    shell.position.set(dir * 1.32, -0.55, 0);
    cupGroup.add(shell);

    // Glowing Telemetry LED Ring
    const ringGeo = new THREE.TorusGeometry(0.52, 0.025, 16, 48);
    const ring = new THREE.Mesh(ringGeo, ledRingMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(dir * 1.51, -0.55, 0);
    cupGroup.add(ring);

    // Memory Foam Ear Cushion
    const padGeo = new THREE.TorusGeometry(0.56, 0.19, 24, 48);
    const pad = new THREE.Mesh(padGeo, cushionMat);
    pad.rotation.y = Math.PI / 2;
    pad.position.set(dir * 1.08, -0.55, 0);
    cupGroup.add(pad);

    return { cupGroup, shell, ring, pad };
  }

  const leftEar = createEarCup("left");
  const rightEar = createEarCup("right");
  headphoneGroup.add(leftEar.cupGroup);
  headphoneGroup.add(rightEar.cupGroup);

  // Initial Hero Angle
  headphoneGroup.rotation.set(0.18, -0.45, 0.08);

  // 4. Hold & Drag 3D Rotation + Custom Cursor
  const customCursor = document.getElementById("customCursor");
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let targetRotY = -0.45;
  let targetRotX = 0.18;

  window.addEventListener("mousemove", (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;

    const overInteractive = e.target.closest(
      "button, a, .bento-card, .edition-card, .tech-card",
    );
    customCursor.classList.toggle("visible", !overInteractive);

    if (isDragging) {
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.006;
      targetRotX = Math.max(-0.8, Math.min(0.8, targetRotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    }
  });

  stage.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch Support for Mobile 3D Drag
  stage.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouse.x;
        const deltaY = e.touches[0].clientY - prevMouse.y;
        targetRotY += deltaX * 0.009;
        targetRotX += deltaY * 0.007;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    },
    { passive: true },
  );

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  // 5. Scroll-Driven Exploded View & Position Choreography
  let scrollProgress = 0;

  window.addEventListener(
    "scroll",
    () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    },
    { passive: true },
  );

  // 6. Interactive AI Modes & Chassis Finish Switchers
  const modeCards = document.querySelectorAll(".mode-trigger");
  modeCards.forEach((card) => {
    card.addEventListener("click", () => {
      modeCards.forEach((c) => {
        c.classList.remove("active");
        c.querySelector(".status-pill").textContent = "SELECT";
      });
      card.classList.add("active");
      card.querySelector(".status-pill").textContent = "ACTIVE";

      const hexColor = card.getAttribute("data-color");
      ledRingMat.color.set(hexColor);
      rimLight.color.set(hexColor);
    });
  });

  const editionCards = document.querySelectorAll(".edition-card");
  editionCards.forEach((card) => {
    card.addEventListener("click", () => {
      editionCards.forEach((c) => c.classList.remove("active-edition"));
      card.classList.add("active-edition");

      const bodyHex = card.getAttribute("data-hex");
      const accentHex = card.getAttribute("data-accent");
      chassisMat.color.set(bodyHex);
      ledRingMat.color.set(accentHex);
      rimLight.color.set(accentHex);
    });
  });

  // Reservation Toast Feedback
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editionName = btn
        .closest(".edition-card")
        .querySelector("h3").textContent;
      toastMsg.textContent = `${editionName} — ADDED TO RESERVATION QUEUE`;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3200);
    });
  });

  // 7. Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Gentle idle float
    headphoneGroup.position.y = Math.sin(elapsed * 1.4) * 0.08;

    // Auto subtle rotation when not dragging
    if (!isDragging) {
      targetRotY += 0.0025;
    }

    headphoneGroup.rotation.y +=
      (targetRotY - headphoneGroup.rotation.y) * 0.08;
    headphoneGroup.rotation.x +=
      (targetRotX - headphoneGroup.rotation.x) * 0.08;

    // Explode ear cups smoothly during Section 01 scroll
    const explodeFactor =
      Math.sin(Math.min(scrollProgress * 2.2, 1) * Math.PI) * 0.45;
    leftEar.shell.position.x = -1.32 - explodeFactor;
    leftEar.ring.position.x = -1.51 - explodeFactor * 1.35;
    rightEar.shell.position.x = 1.32 + explodeFactor;
    rightEar.ring.position.x = 1.51 + explodeFactor * 1.35;

    // Shift 3D model slightly left on desktop during Architecture section
    const isDesktop = window.innerWidth > 1024;
    const targetX =
      isDesktop && scrollProgress > 0.12 && scrollProgress < 0.48 ? -1.35 : 0;
    headphoneGroup.position.x += (targetX - headphoneGroup.position.x) * 0.06;

    renderer.render(scene, camera);
  }

  animate();

  // 8. Responsive Viewport Resize Handler
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scale down 3D headphone slightly on narrow mobile viewports
    const scale = window.innerWidth < 600 ? 0.78 : 1;
    headphoneGroup.scale.set(scale, scale, scale);
  });

  // Trigger initial scale check
  if (window.innerWidth < 600) {
    headphoneGroup.scale.set(0.78, 0.78, 0.78);
  }
});

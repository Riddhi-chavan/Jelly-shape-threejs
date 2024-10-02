import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.3,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000814);
document.body.appendChild(renderer.domElement);

// Create flower-like pattern
const segments = 250; // More segments for smoother shape
const baseRadius = 2;
const dotsGeometry = new THREE.BufferGeometry();
const dotsMaterial = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.07,
  sizeAttenuation: true,
});

const positions = new Float32Array(segments * 3);

camera.position.z = 7;

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add some damping for smoother movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 15;

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Animation
let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  frame += 0.1; // Slower animation

  // Update controls
  controls.update();

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;

    // Create a flower-like pattern with multiple sine waves
    const flowerShape = Math.sin(angle * 8) * 0.3; // Creates 6 "petals"
    const waveEffect = Math.sin(frame + angle * 4) * 0.2;

    const radius = baseRadius + flowerShape + waveEffect;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Move dots based on camera position
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const dotPosition = new THREE.Vector3(x, y, 0).add(
      cameraDirection.multiplyScalar(0.5)
    );

    positions[i * 3] = dotPosition.x;
    positions[i * 3 + 1] = dotPosition.y;
    positions[i * 3 + 2] = dotPosition.z;
  }

  dotsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  if (!scene.children.length) {
    const dots = new THREE.Points(dotsGeometry, dotsMaterial);
    scene.add(dots);
  } else {
    scene.children[0].geometry.attributes.position.needsUpdate = true;
  }

  // Raycasting for mouse interaction
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene.children[0]);

  if (intersects.length > 0) {
    const intersectPoint = intersects[0].point;

    for (let i = 0; i < segments; i++) {
      const dotPosition = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );

      const direction = dotPosition.clone().sub(intersectPoint).normalize();
      const distance = dotPosition.distanceTo(intersectPoint);
      const repulsionStrength = Math.max(0, 1 - distance / 2); // Adjust the repulsion strength based on distance

      const newPosition = dotPosition.add(
        direction.multiplyScalar(repulsionStrength * 0.5)
      ); // Increase the repulsion distance

      positions[i * 3] = newPosition.x;
      positions[i * 3 + 1] = newPosition.y;
      positions[i * 3 + 2] = newPosition.z;
    }
  }

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse move
window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

animate();

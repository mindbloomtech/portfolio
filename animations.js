// Three.js Background Animation
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to load
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const container = document.getElementById('model');
    if (!container) return;

    // Initialize 3D scene for all devices (only skip if user prefers reduced motion)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 6);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        // Lighting
        const amb = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 5, 5);
        scene.add(dir);
        const hemi = new THREE.HemisphereLight(0x6eebc0, 0x10203a, 0.2);
        scene.add(hemi);

        // Main orb
        const orbGeo = new THREE.IcosahedronGeometry(1.6, 4);
        const orbMat = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x001022,
            emissiveIntensity: 0.3
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        scene.add(orb);

        // Particles
        const particleCount = 3000;
        const particlesGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMat = new THREE.PointsMaterial({ color: 0x6ee7b7, size: 0.03 });
        const particles = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particles);

        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }, 100);
        });

        // Animation variables
        let t1 = 0;
        let scrollProgress = 0;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            t1 += 0.01;
            orb.position.y = Math.sin(t1) * 0.12;
            orb.rotation.x += 0.002 + scrollProgress * 0.02;
            orb.rotation.y += 0.004 + scrollProgress * 0.03;
            particles.rotation.y += 0.001;
            renderer.render(scene, camera);
        }

        // Scroll listener for 3D scene
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                scrollProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
                scrollTimeout = null;
            }, 16); // ~60fps
        }, { passive: true });

        animate();
    } else {
        // Fallback: simple gradient background for reduced motion
        container.style.background = 'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, rgba(11, 16, 32, 0.8) 70%)';
    }
});
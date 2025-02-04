// Get query parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');
const wish = urlParams.get('wish');

// Display the wish message
const wishMessage = document.getElementById('wish-message');
wishMessage.textContent = `Happy Birthday, ${name}!`;

// Three.js setup
let scene, camera, renderer, cake, candles = [];

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Cake
    const cakeGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
    const cakeMaterial = new THREE.MeshPhongMaterial({ color: 0xf4a460 });
    cake = new THREE.Mesh(cakeGeometry, cakeMaterial);
    scene.add(cake);

    // Candles
    const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 32);
    const candleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    for (let i = 0; i < 5; i++) {
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set((i - 2) * 0.3, 0.3, 0);
        cake.add(candle);

        // Flame
        const flameGeometry = new THREE.ConeGeometry(0.05, 0.2, 32);
        const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(0, 0.3, 0);
        candle.add(flame);

        candles.push({ candle, flame });
    }

    // Audio Context for Blowing Detection
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function detectBlow() {
                analyser.getByteFrequencyData(dataArray);
                let sum = dataArray.reduce((a, b) => a + b, 0);
                if (sum > 1000) { // Threshold for blowing detection
                    blowOutCandles();
                    wishMessage.textContent = `Your wish: ${wish}`;
                }
                requestAnimationFrame(detectBlow);
            }
            detectBlow();
        })
        .catch(err => {
            console.error('Error accessing microphone:', err);
        });

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);
}

function blowOutCandles() {
    candles.forEach(candle => {
        candle.flame.visible = false;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Flicker Flames
    candles.forEach(candle => {
        if (candle.flame.visible) {
            candle.flame.scale.y = 0.9 + Math.random() * 0.2;
        }
    });

    renderer.render(scene, camera);
}
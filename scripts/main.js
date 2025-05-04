import { Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, MeshBasicMaterial, Mesh, TextureLoader } from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Habilitar WebXR
document.body.appendChild(renderer.domElement);

// Agregar botón de AR
try {
    document.body.appendChild(ARButton.createButton(renderer));
} catch (error) {
    console.error("WebXR no está disponible en este dispositivo:", error);
    alert("AR no es compatible con tu dispositivo o navegador.");
}

// Card Data (Example)
const cardData = [
    { id: 1, name: "El Loco", texture: "https://pixabay.com/get/gf3b6d8b2c6f3e4c95f1aad7e56721c87a6b9b1f3f6aee53ec7a4264bb1c3f8f5f4b7ce4f6f5b4a3f6f4e8f5c6e8f7a7_640.jpg" },
    { id: 2, name: "El Mago", texture: "https://pixabay.com/get/gf3b6d8b2c6f3e4c95f1aad7e56721c87a6b9b1f3f6aee53ec7a4264bb1c3f8f5f4b7ce4f6f5b4a3f6f4e8f5c6e8f7a7_640.jpg" }
    // Add more cards as needed
];

const textureLoader = new TextureLoader();
const cardGeometry = new PlaneGeometry(0.3, 0.5); // Tamaño ajustado para AR
const cards = [];

// Generar cartas
cardData.forEach(card => {
    const texture = textureLoader.load(
        card.texture,
        () => console.log(`Textura cargada para ${card.name}`),
        undefined,
        (error) => console.error(`Error cargando textura para ${card.name}:`, error)
    );
    const material = new MeshBasicMaterial({ map: texture });
    const cardMesh = new Mesh(cardGeometry, material);
    cardMesh.userData = { id: card.id, name: card.name };
    cards.push(cardMesh);
});

// Posicionar las cartas inicialmente fuera del campo de visión
cards.forEach((card, index) => {
    card.position.set(0, -10, -index * 0.01); // Fuera de la vista inicial
    scene.add(card);
});

// Configuración de la cámara
camera.position.z = 1;

// Funcionalidad de barajar
document.getElementById('shuffle-button').addEventListener('click', () => {
    if (cards.length === 0) {
        alert("No hay cartas disponibles para barajar.");
        return;
    }
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i].position.z, cards[j].position.z] = [cards[j].position.z, cards[i].position.z];
    }
    alert('Cartas barajadas');
});

// Funcionalidad de seleccionar carta
document.getElementById('draw-button').addEventListener('click', () => {
    if (cards.length > 0) {
        const drawnCard = cards.pop();
        drawnCard.position.set(0, 0, -0.5); // Frente a la cámara
        scene.add(drawnCard);
        alert(`Carta seleccionada: ${drawnCard.userData.name}`);
    } else {
        alert('No hay más cartas en el mazo');
    }
});

// Funcionalidad de colocar carta
document.getElementById('place-button').addEventListener('click', () => {
    const selectedCard = cards.find(card => card.position.z === -0.5);
    if (selectedCard) {
        selectedCard.position.set(Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25, -0.5); // Colocar en posición aleatoria frente a la cámara
        alert(`Carta colocada: ${selectedCard.userData.name}`);
    } else {
        alert('No hay carta seleccionada para colocar');
    }
});

// Bucle de animación
function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();
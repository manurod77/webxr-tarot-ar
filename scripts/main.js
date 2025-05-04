import { Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, MeshBasicMaterial, Mesh, TextureLoader } from 'three';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Card Data (Example)
const cardData = [
    { id: 1, name: "El Loco", texture: "https://pixabay.com/get/gf3b6d8b2c6f3e4c95f1aad7e56721c87a6b9b1f3f6aee53ec7a4264bb1c3f8f5f4b7ce4f6f5b4a3f6f4e8f5c6e8f7a7_640.jpg" },
    { id: 2, name: "El Mago", texture: "https://pixabay.com/get/gf3b6d8b2c6f3e4c95f1aad7e56721c87a6b9b1f3f6aee53ec7a4264bb1c3f8f5f4b7ce4f6f5b4a3f6f4e8f5c6e8f7a7_640.jpg" }
    // Add more cards as needed
];

const textureLoader = new TextureLoader();
const cardGeometry = new PlaneGeometry(1, 1.5);
const cards = [];

// Generate Card Meshes
cardData.forEach(card => {
    const texture = textureLoader.load(card.texture);
    const material = new MeshBasicMaterial({ map: texture });
    const cardMesh = new Mesh(cardGeometry, material);
    cardMesh.userData = { id: card.id, name: card.name };
    cards.push(cardMesh);
});

// Position Cards in Deck
cards.forEach((card, index) => {
    card.position.set(0, 0, -index * 0.01); // Slight stacking
    scene.add(card);
});

// Camera Settings
camera.position.z = 5;

// Shuffle Functionality
document.getElementById('shuffle-button').addEventListener('click', () => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i].position.z, cards[j].position.z] = [cards[j].position.z, cards[i].position.z];
    }
    alert('Cartas barajadas');
});

// Draw Card Functionality
document.getElementById('draw-button').addEventListener('click', () => {
    if (cards.length > 0) {
        const drawnCard = cards.pop();
        drawnCard.position.set(0, 0, 0);
        scene.add(drawnCard);
        alert(`Carta seleccionada: ${drawnCard.userData.name}`);
    } else {
        alert('No hay más cartas en el mazo');
    }
});

// Place Card Functionality
document.getElementById('place-button').addEventListener('click', () => {
    const selectedCard = cards.find(card => card.position.z === 0);
    if (selectedCard) {
        selectedCard.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, 0); // Random placement
        alert(`Carta colocada: ${selectedCard.userData.name}`);
    } else {
        alert('No hay carta seleccionada para colocar');
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
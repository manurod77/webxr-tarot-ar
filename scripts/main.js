import { Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, MeshBasicMaterial, Mesh, CanvasTexture } from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Habilitar WebXR
document.body.appendChild(renderer.domElement);

// Agregar botón de AR
document.body.appendChild(ARButton.createButton(renderer));

// Datos de las cartas del Tarot (78 cartas)
const majorArcana = [
    { id: 0, name: "El Loco" },
    { id: 1, name: "El Mago" },
    { id: 2, name: "La Sacerdotisa" },
    { id: 3, name: "La Emperatriz" },
    { id: 4, name: "El Emperador" },
    { id: 5, name: "El Hierofante" },
    { id: 6, name: "Los Enamorados" },
    { id: 7, name: "El Carro" },
    { id: 8, name: "La Justicia" },
    { id: 9, name: "El Ermitaño" },
    { id: 10, name: "La Rueda de la Fortuna" },
    { id: 11, name: "La Fuerza" },
    { id: 12, name: "El Colgado" },
    { id: 13, name: "La Muerte" },
    { id: 14, name: "La Templanza" },
    { id: 15, name: "El Diablo" },
    { id: 16, name: "La Torre" },
    { id: 17, name: "La Estrella" },
    { id: 18, name: "La Luna" },
    { id: 19, name: "El Sol" },
    { id: 20, name: "El Juicio" },
    { id: 21, name: "El Mundo" }
];

const minorArcana = [
    ...Array.from({ length: 14 }, (_, i) => ({ id: 22 + i, name: `Copas ${i + 1}` })),
    ...Array.from({ length: 14 }, (_, i) => ({ id: 36 + i, name: `Espadas ${i + 1}` })),
    ...Array.from({ length: 14 }, (_, i) => ({ id: 50 + i, name: `Bastos ${i + 1}` })),
    ...Array.from({ length: 14 }, (_, i) => ({ id: 64 + i, name: `Oros ${i + 1}` }))
];

const fullDeck = [...majorArcana, ...minorArcana];

let currentDeck = [...majorArcana]; // Por defecto, usar solo los Arcanos Mayores
let selectedSpread = "one-card"; // Por defecto, tirada de una carta

// Función para crear una textura con texto
function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return new CanvasTexture(canvas);
}

const cardGeometry = new PlaneGeometry(0.3, 0.5);
const cards = [];

// Función para cargar el mazo
function loadDeck() {
    while (cards.length > 0) {
        const card = cards.pop();
        scene.remove(card);
    }

    currentDeck.forEach(card => {
        const texture = createTextTexture(`${card.id}: ${card.name}`);
        const material = new MeshBasicMaterial({ map: texture });
        const cardMesh = new Mesh(cardGeometry, material);
        cardMesh.userData = { id: card.id, name: card.name };
        cards.push(cardMesh);
    });

    cards.forEach((card, index) => {
        card.position.set(0, -10, -index * 0.01);
        scene.add(card);
    });
}

// Función para realizar diferentes tipos de tiradas
function performSpread() {
    if (selectedSpread === "one-card") {
        drawCards(1);
    } else if (selectedSpread === "three-cards") {
        drawCards(3);
    } else if (selectedSpread === "celtic-cross") {
        drawCards(10);
    }
}

// Función para seleccionar cartas del mazo
function drawCards(count) {
    if (cards.length < count) {
        alert("No hay suficientes cartas en el mazo.");
        return;
    }

    for (let i = 0; i < count; i++) {
        const card = cards.pop();
        card.position.set(i * 0.4 - count * 0.2, 0, -0.5);
        scene.add(card);
    }
}

// Configuración de eventos
document.getElementById('deck-selection').addEventListener('change', (event) => {
    currentDeck = event.target.value === 'full' ? fullDeck : majorArcana;
    loadDeck();
});

document.getElementById('spread-selection').addEventListener('change', (event) => {
    selectedSpread = event.target.value;
});

document.getElementById('shuffle-button').addEventListener('click', () => {
    cards.sort(() => Math.random() - 0.5);
    alert("Cartas barajadas");
});

document.getElementById('draw-button').addEventListener('click', performSpread);

loadDeck();
renderer.setAnimationLoop(() => renderer.render(scene, camera));
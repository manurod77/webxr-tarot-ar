import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Aunque no se use directamente para modelos, puede ser útil en el futuro

// Datos de las cartas (simplificado)
const cardsData = {
    "0": { name: "El Loco", type: "major", meaning: { general: "Nuevos comienzos, potencial ilimitado, espontaneidad.", past: "Una decisión impulsiva que marcó un nuevo camino.", present: "Estás al borde de una nueva experiencia.", future: "Abraza la incertidumbre y las nuevas posibilidades." } },
    "1": { name: "El Mago", type: "major", meaning: { general: "Voluntad, habilidad, poder manifestador.", past: "Utilizaste tus recursos de manera efectiva.", present: "Es tiempo de usar tu ingenio y tus habilidades.", future: "Manifestarás tus deseos a través de la acción." } },
    "2": { name: "La Suma Sacerdotisa", type: "major", meaning: { general: "Intuición, secretos, conocimiento oculto.", past: "Confiaste en tu intuición.", present: "Hay secretos o información oculta relevantes.", future: "Presta atención a tus sueños y corazonadas." } },
    "3": { name: "La Emperatriz", type: "major", meaning: { general: "Fertilidad, abundancia, naturaleza.", past: "Un período de crecimiento y nutrición.", present: "Estás en un momento de florecimiento.", future: "La abundancia y la creatividad te rodearán." } },
    "4": { name: "El Emperador", type: "major", meaning: { general: "Estructura, autoridad, control.", past: "Se tomaron decisiones firmes y se estableció orden.", present: "Necesitas tomar el control y ser decisivo.", future: "La estructura y la autoridad serán importantes." } },
    "5": { name: "El Hierofante", type: "major", meaning: { general: "Tradición, espiritualidad, guía.", past: "Seguiste las normas y buscaste consejo.", present: "Busca guía espiritual o tradicional.", future: "Las instituciones o las figuras de autoridad jugarán un papel." } },
    "6": { name: "Los Enamorados", type: "major", meaning: { general: "Relaciones, decisiones, armonía.", past: "Hubo una elección importante en una relación.", present: "Te enfrentas a una decisión importante en tus relaciones o valores.", future: "La armonía y las decisiones del corazón serán clave." } },
    "7": { name: "El Carro", type: "major", meaning: { general: "Voluntad, dirección, éxito.", past: "Superaste obstáculos con determinación.", present: "Tienes la fuerza de voluntad para avanzar.", future: "El éxito vendrá a través de la acción y la dirección." } },
    "8": { name: "La Fuerza", type: "major", meaning: { general: "Coraje, paciencia, control.", past: "Demostraste fuerza interior y resistencia.", present: "Necesitas paciencia y coraje para manejar la situación.", future: "La fuerza interior te permitirá superar desafíos." } },
    "9": { name: "El Ermitaño", type: "major", meaning: { general: "Introspección, soledad, búsqueda.", past: "Un tiempo de soledad y reflexión.", present: "Necesitas tiempo para la introspección.", future: "La sabiduría se encontrará en la soledad y la reflexión." } },
    "10": { name: "La Rueda de la Fortuna", type: "major", meaning: { general: "Ciclos, destino, cambio.", past: "Los eventos estaban fuera de tu control.", present: "Estás en un punto de inflexión, el cambio es inminente.", future: "El destino jugará un papel en los eventos futuros." } },
    "11": { name: "La Justicia", type: "major", meaning: { general: "Equilibrio, verdad, causa y efecto.", past: "Las acciones pasadas están influyendo en el presente.", present: "Busca la equidad y la verdad.", future: "Se harán juicios justos y se restablecerá el equilibrio." } },
    "12": { name: "El Colgado", type: "major", meaning: { general: "Sacrificio, perspectiva, entrega.", past: "Hiciste un sacrificio por una causa mayor.", present: "Necesitas una nueva perspectiva, considera la rendición.", future: "Una nueva perspectiva traerá claridad." } },
    "13": { name: "La Muerte", type: "major", meaning: { general: "Transformación, final de un ciclo, renacimiento.", past: "Un final significativo ocurrió.", present: "Estás pasando por una transformación.", future: "Un nuevo comienzo surgirá de un final." } },
    "14": { name: "La Templanza", type: "major", meaning: { general: "Armonía, equilibrio, paciencia.", past: "Encontraste el equilibrio en una situación.", present: "Busca la armonía y la moderación.", future: "La paciencia y el equilibrio traerán resultados positivos." } },
    "15": { name: "El Diablo", type: "major", meaning: { general: "Apegos, adicciones, limitaciones.", past: "Estabas atrapado por apegos o limitaciones.", present: "Examina tus ataduras y posibles adicciones.", future: "Liberarse de las limitaciones traerá libertad." } },
    "16": { name: "La Torre", type: "major", meaning: { general: "Cambio repentino, caos, liberación.", past: "Un evento inesperado causó agitación.", present: "Estás experimentando un cambio repentino.", future: "La destrucción de lo viejo abrirá camino a lo nuevo." } },
    "17": { name: "La Estrella", type: "major", meaning: { general: "Esperanza, inspiración, sanación.", past: "Un período de esperanza y renovación.", present: "Busca inspiración y confía en el universo.", future: "La esperanza y la guía te iluminarán." } },
    "18": { name: "La Luna", type: "major", meaning: { general: "Intuición, ilusiones, subconsciente.", past: "Estabas confundido o engañado.", present: "Confía en tu intuición a pesar de la incertidumbre.", future: "Las verdades ocultas saldrán a la luz." } },
    "19": { name: "El Sol", type: "major", meaning: { general: "Alegría, vitalidad, éxito.", past: "Un tiempo de felicidad y éxito.", present: "Disfruta de la alegría y la claridad.", future: "El éxito y la felicidad te esperan." } },
    "20": { name: "El Juicio", type: "major", meaning: { general: "Renovación, llamado, evaluación.", past: "Fuiste llamado a una nueva etapa.", present: "Es tiempo de evaluar y tomar decisiones importantes.", future: "Un renacimiento o una nueva fase comenzará." } },
    "21": { name: "El Mundo", type: "major", meaning: { general: "Finalización, plenitud, integración.", past: "Un ciclo llegó a su fin.", present: "Estás cerca de la plenitud y la realización.", future: "Lograrás la finalización y la satisfacción." } },
    "w1": { name: "Bastos 1", type: "minor", suit: "wands", number: 1, meaning: { general: "Nuevas ideas, potencial." } },
    "w2": { name: "Bastos 2", type: "minor", suit: "wands", number: 2, meaning: { general: "Planificación, decisiones." } },
    "p1": { name: "Copas 1", type: "minor", suit: "cups", number: 1, meaning: { general: "Emociones, intuición." } },
    "p2": { name: "Copas 2", type: "minor", suit: "cups", number: 2, meaning: { general: "Relaciones, armonía." } },
    "e1": { name: "Espadas 1", type: "minor", suit: "swords", number: 1, meaning: { general: "Verdad, claridad." } },
    "e2": { name: "Espadas 2", type: "minor", suit: "swords", number: 2, meaning: { general: "Dilemas, decisiones difíciles." } },
    "o1": { name: "Oros 1", type: "minor", suit: "pentacles", number: 1, meaning: { general: "Recursos, potencial material." } },
    "o2": { name: "Oros 2", type: "minor", suit: "pentacles", number: 2, meaning: { general: "Adaptabilidad, equilibrio." } },
    // ... más arcanos menores (puedes añadirlos si lo deseas)
};

let scene, camera, renderer, arSession, hitTestSource, gltfLoader;
let cardMeshes = {};
let deck = [];
let currentReading = [];
const interpretationDiv = document.getElementById('interpretation');

init();
animate();

async function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.getElementById('overlay') }
    }));

    gltfLoader = new GLTFLoader();

    const session = await renderer.xr.getSession();
    const referenceSpace = await session.requestReferenceSpace('local');
    hitTestSource = await session.requestHitTestSource({ space: referenceSpace });

    document.getElementById('startReading').addEventListener('click', startTarotReading);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    if (frame) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0 && currentReading.length < getNumberOfCardsForSpread()) {
            const hitPose = hitTestResults[0].getPose(frame.referenceSpace);
            if (hitPose) {
                placeCard(hitPose.transform);
            }
        }
    }
    renderer.render(scene, camera);
}

function getDeck() {
    const deckType = document.getElementById('deckType').value;
    let currentDeck = Object.keys(cardsData);
    if (deckType === 'major') {
        currentDeck = currentDeck.filter(key => cardsData[key].type === 'major');
    }
    return [...currentDeck];
}

function shuffleDeck(deckToShuffle) {
    const shuffledDeck = [...deckToShuffle];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}

function drawCard(shuffledDeck) {
    if (shuffledDeck.length > 0) {
        const cardId = shuffledDeck.pop();
        return { id: cardId, data: cardsData[cardId] };
    }
    return null;
}

function getNumberOfCardsForSpread() {
    const spreadType = document.getElementById('spreadType').value;
    switch (spreadType) {
        case 'one-card': return 1;
        case 'three-card': return 3;
        default: return 0;
    }
}

async function startTarotReading() {
    interpretationDiv.innerText = '';
    currentReading = [];
    deck = shuffleDeck(getDeck());
    scene.children.filter(child => child.userData && child.userData.isCard).forEach(child => scene.remove(child));

    const spreadType = document.getElementById('spreadType').value;
    const numberOfCards = getNumberOfCardsForSpread();

    for (let i = 0; i < numberOfCards; i++) {
        const drawnCard = drawCard(deck);
        if (drawnCard) {
            currentReading.push({ card: drawnCard.data, position: getCardPositionForSpread(spreadType, i) });
        }
    }
}

async function placeCard(transform) {
    if (currentReading.length > 0) {
        const cardToPlace = currentReading[currentReading.length - 1].card;

        const geometry = new THREE.PlaneGeometry(0.1, 0.15);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const cardMesh = new THREE.Mesh(geometry, material);
        cardMesh.position.set(transform.position.x, transform.position.y + 0.05, transform.position.z);
        cardMesh.quaternion.set(transform.orientation.x, transform.orientation.y, transform.orientation.z, transform.orientation.w);
        cardMesh.userData = { isCard: true, cardId: cardToPlace.name };

        const textCanvas = document.createElement('canvas');
        const context = textCanvas.getContext('2d');
        textCanvas.width = 256;
        textCanvas.height = 256;
        context.fillStyle = 'black';
        context.fillRect(0, 0, 256, 256);
        context.font = 'bold 30px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(cardToPlace.name, 128, 128);

        const texture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const textMesh = new THREE.Mesh(geometry, textMaterial);
        textMesh.position.copy(cardMesh.position);
        textMesh.quaternion.copy(cardMesh.quaternion);
        textMesh.translateZ(0.001); // Offset ligeramente para evitar z-fighting

        scene.add(cardMesh
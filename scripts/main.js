// Verificar soporte de WebXR
if (!navigator.xr) {
    alert('Tu navegador no soporta WebXR. Por favor, usa Chrome o Edge en un dispositivo compatible.');
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

// Configurar el renderer para WebXR
renderer.xr.addEventListener('sessionstart', () => {
    console.log('Sesión AR iniciada');
    const uiContainer = document.getElementById('ui-container');
    const arButton = document.getElementById('ar-button');
    if (uiContainer) uiContainer.style.display = 'block';
    if (arButton) arButton.style.display = 'none';
    renderer.domElement.style.zIndex = '1';
});

renderer.xr.addEventListener('sessionend', () => {
    console.log('Sesión AR finalizada');
    const uiContainer = document.getElementById('ui-container');
    const interpretationContainer = document.getElementById('interpretation-container');
    const arButton = document.getElementById('ar-button');
    if (uiContainer) uiContainer.style.display = 'none';
    if (interpretationContainer) interpretationContainer.style.display = 'none';
    if (arButton) arButton.style.display = 'block';
    renderer.domElement.style.zIndex = 'auto';
});

document.body.appendChild(renderer.domElement);

// Agregar botón de AR
const arButton = document.getElementById('ar-button');
if (arButton) {
    arButton.addEventListener('click', async () => {
        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });
            renderer.xr.setReferenceSpaceType('local');
            await renderer.xr.setSession(session);
        } catch (error) {
            console.error('Error al iniciar sesión AR:', error);
            alert('Error al iniciar la sesión AR. Por favor, asegúrate de que tu dispositivo sea compatible.');
        }
    });
}

// Datos de los Arcanos Mayores
const majorArcana = [
    { id: 0, name: "El Loco", meaning: "Nuevos comienzos, libertad, espontaneidad" },
    { id: 1, name: "El Mago", meaning: "Habilidad, creatividad, manifestación" },
    { id: 2, name: "La Sacerdotisa", meaning: "Intuición, misterio, sabiduría interior" },
    { id: 3, name: "La Emperatriz", meaning: "Fertilidad, creatividad, abundancia" },
    { id: 4, name: "El Emperador", meaning: "Autoridad, estructura, estabilidad" },
    { id: 5, name: "El Hierofante", meaning: "Tradición, espiritualidad, guía" },
    { id: 6, name: "Los Enamorados", meaning: "Amor, elección, armonía" },
    { id: 7, name: "El Carro", meaning: "Victoria, determinación, progreso" },
    { id: 8, name: "La Justicia", meaning: "Equilibrio, justicia, verdad" },
    { id: 9, name: "El Ermitaño", meaning: "Introspección, soledad, búsqueda interior" },
    { id: 10, name: "La Rueda de la Fortuna", meaning: "Cambio, ciclos, destino" },
    { id: 11, name: "La Fuerza", meaning: "Fuerza interior, coraje, paciencia" },
    { id: 12, name: "El Colgado", meaning: "Sacrificio, perspectiva, entrega" },
    { id: 13, name: "La Muerte", meaning: "Transformación, cambio, renovación" },
    { id: 14, name: "La Templanza", meaning: "Equilibrio, moderación, armonía" },
    { id: 15, name: "El Diablo", meaning: "Atadura, materialismo, tentación" },
    { id: 16, name: "La Torre", meaning: "Cambio repentino, revelación, destrucción" },
    { id: 17, name: "La Estrella", meaning: "Esperanza, inspiración, guía" },
    { id: 18, name: "La Luna", meaning: "Intuición, ilusión, subconsciente" },
    { id: 19, name: "El Sol", meaning: "Vitalidad, éxito, alegría" },
    { id: 20, name: "El Juicio", meaning: "Renacimiento, despertar, decisión" },
    { id: 21, name: "El Mundo", meaning: "Completitud, logro, viaje" }
];

const minorArcana = [
    ...Array.from({ length: 14 }, (_, i) => ({ 
        id: 22 + i, 
        name: `Copas ${i + 1}`, 
        meaning: `Emociones, relaciones, creatividad - Nivel ${i + 1}` 
    })),
    ...Array.from({ length: 14 }, (_, i) => ({ 
        id: 36 + i, 
        name: `Espadas ${i + 1}`, 
        meaning: `Intelecto, conflicto, decisión - Nivel ${i + 1}` 
    })),
    ...Array.from({ length: 14 }, (_, i) => ({ 
        id: 50 + i, 
        name: `Bastos ${i + 1}`, 
        meaning: `Energía, acción, creatividad - Nivel ${i + 1}` 
    })),
    ...Array.from({ length: 14 }, (_, i) => ({ 
        id: 64 + i, 
        name: `Oros ${i + 1}`, 
        meaning: `Material, trabajo, estabilidad - Nivel ${i + 1}` 
    }))
];

const fullDeck = [...majorArcana, ...minorArcana];

let currentDeck = [...majorArcana];
let selectedSpread = "one-card";
let drawnCards = [];
let hitTestSource = null;
let hitTestSourceRequested = false;

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

    return new THREE.CanvasTexture(canvas);
}

const cardGeometry = new THREE.PlaneGeometry(0.3, 0.5);
const cards = [];

// Función para cargar el mazo
function loadDeck() {
    try {
        while (cards.length > 0) {
            const card = cards.pop();
            scene.remove(card);
        }

        currentDeck.forEach(card => {
            const texture = createTextTexture(`${card.id}: ${card.name}`);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const cardMesh = new THREE.Mesh(cardGeometry, material);
            cardMesh.userData = { id: card.id, name: card.name, meaning: card.meaning };
            cards.push(cardMesh);
        });

        cards.forEach((card, index) => {
            card.position.set(0, -10, -index * 0.01);
            scene.add(card);
        });
    } catch (error) {
        console.error('Error al cargar el mazo:', error);
        alert('Error al cargar el mazo. Por favor, recarga la página.');
    }
}

// Función para realizar diferentes tipos de tiradas
function performSpread() {
    drawnCards = [];
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
        if (selectedSpread === "celtic-cross") {
            // Posiciones específicas para la cruz celta
            const positions = [
                [0, 0, -0.5],      // Centro
                [0, 0.4, -0.5],    // Cruzando
                [-0.4, 0, -0.5],   // Base
                [0.4, 0, -0.5],    // Pasado reciente
                [0, -0.4, -0.5],   // Corona
                [-0.4, -0.4, -0.5],// Futuro cercano
                [0.4, -0.4, -0.5], // Yo
                [-0.4, 0.4, -0.5], // Ambiente
                [0.4, 0.4, -0.5],  // Esperanzas y miedos
                [0, 0.8, -0.5]     // Resultado
            ];
            card.position.set(...positions[i]);
        } else if (selectedSpread === "three-cards") {
            // Posiciones para la tirada de tres cartas
            const positions = [
                [-0.4, 0, -0.5],   // Pasado
                [0, 0, -0.5],      // Presente
                [0.4, 0, -0.5]     // Futuro
            ];
            card.position.set(...positions[i]);
        } else {
            // Posición para una carta
            card.position.set(0, 0, -0.5);
        }
        scene.add(card);
        drawnCards.push(card);
    }
}

// Función para interpretar la tirada
function interpretSpread() {
    const interpretationContainer = document.getElementById('interpretation-container');
    const interpretationText = document.getElementById('interpretation-text');
    
    if (drawnCards.length === 0) {
        interpretationText.textContent = "Primero realiza una tirada.";
        interpretationContainer.style.display = 'block';
        return;
    }

    let interpretation = "";
    
    if (selectedSpread === "one-card") {
        interpretation = `Carta: ${drawnCards[0].userData.name}\n\nSignificado: ${drawnCards[0].userData.meaning}`;
    } else if (selectedSpread === "three-cards") {
        interpretation = `Pasado: ${drawnCards[0].userData.name}\n${drawnCards[0].userData.meaning}\n\n`;
        interpretation += `Presente: ${drawnCards[1].userData.name}\n${drawnCards[1].userData.meaning}\n\n`;
        interpretation += `Futuro: ${drawnCards[2].userData.name}\n${drawnCards[2].userData.meaning}`;
    } else if (selectedSpread === "celtic-cross") {
        interpretation = `1. Situación actual: ${drawnCards[0].userData.name}\n${drawnCards[0].userData.meaning}\n\n`;
        interpretation += `2. Desafío: ${drawnCards[1].userData.name}\n${drawnCards[1].userData.meaning}\n\n`;
        interpretation += `3. Base: ${drawnCards[2].userData.name}\n${drawnCards[2].userData.meaning}\n\n`;
        interpretation += `4. Pasado reciente: ${drawnCards[3].userData.name}\n${drawnCards[3].userData.meaning}\n\n`;
        interpretation += `5. Objetivos: ${drawnCards[4].userData.name}\n${drawnCards[4].userData.meaning}\n\n`;
        interpretation += `6. Futuro cercano: ${drawnCards[5].userData.name}\n${drawnCards[5].userData.meaning}\n\n`;
        interpretation += `7. Tu actitud: ${drawnCards[6].userData.name}\n${drawnCards[6].userData.meaning}\n\n`;
        interpretation += `8. Ambiente: ${drawnCards[7].userData.name}\n${drawnCards[7].userData.meaning}\n\n`;
        interpretation += `9. Esperanzas y miedos: ${drawnCards[8].userData.name}\n${drawnCards[8].userData.meaning}\n\n`;
        interpretation += `10. Resultado: ${drawnCards[9].userData.name}\n${drawnCards[9].userData.meaning}`;
    }

    interpretationText.textContent = interpretation;
    interpretationContainer.style.display = 'block';
}

// Configuración de eventos
const spreadSelection = document.getElementById('spread-selection');
if (spreadSelection) {
    spreadSelection.addEventListener('change', (event) => {
        selectedSpread = event.target.value;
        const spreadInfo = document.getElementById('spread-info');
        if (spreadInfo) {
            switch (selectedSpread) {
                case 'one-card':
                    spreadInfo.textContent = 'La tirada de una carta es ideal para preguntas específicas y respuestas claras.';
                    break;
                case 'three-cards':
                    spreadInfo.textContent = 'La tirada de tres cartas representa el pasado, presente y futuro de tu situación.';
                    break;
                case 'celtic-cross':
                    spreadInfo.textContent = 'La Cruz Celta es una tirada completa que analiza todos los aspectos de tu situación.';
                    break;
            }
        }
    });
}

const shuffleButton = document.getElementById('shuffle-button');
if (shuffleButton) {
    shuffleButton.addEventListener('click', () => {
        cards.sort(() => Math.random() - 0.5);
        alert("Cartas barajadas");
    });
}

const drawButton = document.getElementById('draw-button');
if (drawButton) {
    drawButton.addEventListener('click', performSpread);
}

const interpretButton = document.getElementById('interpret-button');
if (interpretButton) {
    interpretButton.addEventListener('click', interpretSpread);
}

// Función para manejar la detección de superficies
function onXRFrame(time, frame) {
    if (!hitTestSourceRequested) {
        const session = frame.session;
        session.requestReferenceSpace('viewer').then((referenceSpace) => {
            session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                hitTestSource = source;
            });
        });
        hitTestSourceRequested = true;
    }

    if (hitTestSource && drawnCards.length > 0) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(renderer.xr.getReferenceSpace());
            if (pose && pose.transform && pose.transform.matrix) {
                // Actualizar la posición de las cartas según la superficie detectada
                drawnCards.forEach((card, index) => {
                    const position = new THREE.Vector3();
                    try {
                        position.setFromMatrixPosition(pose.transform.matrix);
                        card.position.copy(position);
                        
                        // Ajustar la posición según el tipo de tirada
                        if (selectedSpread === "celtic-cross") {
                            const positions = [
                                [0, 0, 0],      // Centro
                                [0, 0.4, 0],    // Cruzando
                                [-0.4, 0, 0],   // Base
                                [0.4, 0, 0],    // Pasado reciente
                                [0, -0.4, 0],   // Corona
                                [-0.4, -0.4, 0],// Futuro cercano
                                [0.4, -0.4, 0], // Yo
                                [-0.4, 0.4, 0], // Ambiente
                                [0.4, 0.4, 0],  // Esperanzas y miedos
                                [0, 0.8, 0]     // Resultado
                            ];
                            if (index < positions.length) {
                                card.position.add(new THREE.Vector3(...positions[index]));
                            }
                        } else if (selectedSpread === "three-cards") {
                            const positions = [
                                [-0.4, 0, 0],   // Pasado
                                [0, 0, 0],      // Presente
                                [0.4, 0, 0]     // Futuro
                            ];
                            if (index < positions.length) {
                                card.position.add(new THREE.Vector3(...positions[index]));
                            }
                        }
                    } catch (error) {
                        console.warn('Error al actualizar la posición de la carta:', error);
                    }
                });
            }
        }
    }
}

// Modificar el bucle de renderizado
function animate() {
    renderer.setAnimationLoop((time, frame) => {
        if (frame) {
            onXRFrame(time, frame);
        }
        renderer.render(scene, camera);
    });
}

// Iniciar la aplicación
try {
    loadDeck();
    animate();
} catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    alert('Error al iniciar la aplicación. Por favor, recarga la página.');
}
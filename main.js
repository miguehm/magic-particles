//import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const res = await fetch('mariposa.json');
const data = await res.json();
console.log(data['shapes']);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 500);

let renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	antialias: true,
	logarithmicDepthBuffer: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new OrbitControls(camera, renderer.domElement);

let objectsC = [];

function createBg(data){
	const bgWidth = data['shapes'][0]['data'][2];
	const bgHeight = data['shapes'][0]['data'][3];
	const bgColor = 'rgb('
		+data['shapes'][0]['color'][0]+', '
		+data['shapes'][0]['color'][1]+', '
		+data['shapes'][0]['color'][2]
		+')';

	const bg = new THREE.Mesh(
		new THREE.PlaneGeometry(
			bgWidth,
			bgHeight
		),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(bgColor),
		})
	);
	scene.add(bg);
}

// const bgInfo = data['shapes'][0];
// const bgWidth = bgInfo['data'][2];
// const bgHeight = bgInfo['data'][3];
// const bgColor = 'rgb('
// 	+bgInfo['color'][0]+', '
// 	+bgInfo['color'][1]+', '
// 	+bgInfo['color'][2]
// 	+')';
// 
// const bg = new THREE.Mesh(
// 	new THREE.PlaneGeometry(
// 		bgWidth,
// 		bgHeight
// 	),
// 	new THREE.MeshBasicMaterial({
// 		color: new THREE.Color(bgColor),
// 	})
// )
// 
// scene.add(bg);

//createBgFigure(bgFigure1);

let fixZF = 0.05;
function createCircle(data, step){
	const colorC = 'rgb('
		+data['shapes'][step]['color'][0]+', '
		+data['shapes'][step]['color'][1]+', '
		+data['shapes'][step]['color'][2]
		+')';

	const bgWidth = data['shapes'][0]['data'][2];
	const bgHeight = data['shapes'][0]['data'][3];

	const pos = {
		x: data['shapes'][step]['data'][0]-bgWidth/2,
		y: -data['shapes'][step]['data'][1]+bgHeight/2
	};

	const r = data['shapes'][step]['data'][2];

	const circle = new THREE.Mesh(
		new THREE.CircleGeometry(r, 18),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(colorC),
			transparent: true,
			opacity: 0.5
		})
	);
	circle.position.set(pos.x, pos.y, fixZF);
	fixZF += 0.04;

	scene.add(circle);
	objectsC.push(circle);
}

// for (let i = 1; i<data['shapes'].length; i++){
// 	createCircle(data['shapes'][i]);
// }
//createCircle(data['shapes'][1])
//console.log(objectsC);

// const pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
// pointLight.position.set( -100, 0, 10 );
// scene.add( pointLight );

createBg(data);

controls.update();

document.addEventListener('keydown', () => {
	pointLight.position.x += 10;
});

let step = 1;
function animate(){
	requestAnimationFrame(animate);
	controls.update();

	if (step < data['shapes'].length){
		createCircle(data, step);
		step+=1;
	}

	camera.updateProjectionMatrix();
	
	renderer.render(scene, camera);
}

animate();

// Creamos el audio context
// será el destino del audio
const audioContext = new AudioContext();

// objeto buffer genérico
// se almacenan los datos del sonido
const buffer = audioContext.createBuffer(
	1, // audio mono
	audioContext.sampleRate * 1, 
	audioContext.sampleRate
);

// Se trabaja con el primer canal de audio
const channelData = buffer.getChannelData(0)

// Datos del primer canal
for (let i = 0; i < buffer.length; i++){
	channelData[i] = Math.random() * 2 - 1
}

// modulo que modifica la ganancia
const primaryGainControl = audioContext.createGain()
primaryGainControl.gain.setValueAtTime(0.06, 0)
// conecta la ganancia al nodo destino del audio context
primaryGainControl.connect(audioContext.destination)

const button = document.createElement('button')
button.innerText = 'Sonido blanco'

button.addEventListener('click', () => {
	// creando un buffer fuente
	const whiteNoiseSource = audioContext.createBufferSource();
	// toma el objeto del buffer genérico
	whiteNoiseSource.buffer = buffer;
	// conecta con el control de ganancia
	whiteNoiseSource.connect(primaryGainControl)
	// reproduce el sonido
	whiteNoiseSource.start()
})

// document.body.appendChild(button)

const snareFilter = audioContext.createBiquadFilter()
snareFilter.type = "highpass"
snareFilter.frequency.value = 1500
snareFilter.connect(primaryGainControl)

const snareButton = document.createElement('button')
snareButton.innerText = 'Snare'
snareButton.addEventListener('click', () => {
	const whiteNoiseSource = audioContext.createBufferSource()
	whiteNoiseSource.buffer = buffer
	whiteNoiseSource.connect(snareFilter)
	whiteNoiseSource.start()
})

// document.body.appendChild(snareButton)

// piano

const la4 = 440.0
const r = 1.059463

const kickButton = document.createElement('button')
kickButton.innerText = 'Kick'
kickButton.addEventListener('click', () => {
	// crear oscilador para emular la frecuencia de sonido de las notas
	const kickOscillator = audioContext.createOscillator()
	// pasar un array de todas las posibles oscilaciones de las notas de piano?
	const note = la4 * Math.pow(r, 3) //la5#
	kickOscillator.frequency.setValueAtTime(note, 0)
	// tipo de onda del oscilador
	kickOscillator.type = 'sine'
	kickOscillator.connect(primaryGainControl)
	kickOscillator.start()
	// detiene el oscilador despues de 0.5 segundos
	kickOscillator.stop(audioContext.currentTime + 0.5)
})
// document.body.appendChild(kickButton)

// nodos
// .  kickOscillator
// -> primaryGainControl
// -> audioContext.destination

// tambor
// const kickButton = document.createElement('button')
// kickButton.innerText = 'tambor'
// kickButton.addEventListener('click', () => {
// 	const kickOscillator = audioContext.createOscillator()
// 
// 	kickOscillator.frequency.setValueAtTime(500, 0)
// 	kickOscillator.frequency.exponentialRampToValueAtTime(
// 		0.001,
// 		audioContext.currentTime + 0.5
// 	)
// 
// 	const kickGain = audioContext.createGain()
// 	kickGain.gain.setValueAtTime(1, 0)
// 	kickGain.gain.exponentialRampToValueAtTime(
// 		0.001,
// 		audioContext.currentTime + 0.5
// 	)
// 
// 	kickOscillator.connect(kickGain)
// 	kickGain.connect(primaryGainControl)
// 	kickOscillator.start()
// 	kickOscillator.stop(audioContext.currentTime + 0.5)
// })
// 
// document.body.appendChild(kickButton)

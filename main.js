import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const mariposaRes = await fetch('mariposa.json');
const mariposaData = await mariposaRes.json();

const rubikRes = await fetch('rubik.json');
const rubikData = await rubikRes.json();

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 270);

let renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	antialias: true,
	logarithmicDepthBuffer: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new OrbitControls(camera, renderer.domElement);

function createBg(data){
	const bgWidth = data['shapes'][0]['data'][2];
	const bgHeight = data['shapes'][0]['data'][3];
	const bgColor = 'rgb('
		+ data['shapes'][0]['color'][0]+', '
		+ data['shapes'][0]['color'][1]+', '
		+ data['shapes'][0]['color'][2]
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
	return bg;
}

function createCircle(data, step, zFight, x, y, z, rx, ry, rz){
	const colorC = 'rgb('
		+data['shapes'][step]['color'][0]+', '
		+data['shapes'][step]['color'][1]+', '
		+data['shapes'][step]['color'][2]
		+')';

	const bgWidth = data['shapes'][0]['data'][2];
	const bgHeight = data['shapes'][0]['data'][3];

	const pos = {
		x: data['shapes'][step]['data'][0]-bgWidth/2 + x,
		y: -data['shapes'][step]['data'][1]+bgHeight/2 + y,
		z: zFight + z
	};

	const r = data['shapes'][step]['data'][2];

	const circle = new THREE.Mesh(
		new THREE.CircleGeometry(r, 18),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(colorC),
			transparent: true,
			opacity: 0.5,
			//side: THREE.DoubleSide
		})
	);

	ry = (ry*Math.PI)/180;
	circle.rotation.y = ry;
	
	// rotationY
	circle.position.x = pos.x*Math.cos(ry) + pos.z*Math.sin(ry);
	circle.position.y = pos.y;
	circle.position.z = -pos.x*Math.sin(ry)+pos.z*Math.cos(ry);

	scene.add(circle);
	return circle;
}

class Figure {
	constructor (data) {
		this.data = data;
		this.objects = [];
		this.zFight = 0.05;
		this.step = 1;
		this.rx = 0;
		this.ry = 0;
		this.rz = 0;
	}

	createBg(){
		const bg = createBg(this.data);
		this.objects.push(bg);
	}

	createCircle(x, y, z){

		const posX = (x!=null)?x:0;
		const posY = (y!=null)?y:0;
		const posZ = (z!=null)?z:0;

		const circle = createCircle(
			this.data,
			this.step, 
			this.zFight,
			posX,
			posY,
			posZ,
			this.rx,
			this.ry,
			this.rz
		);
		this.objects.push(circle);
		this.step += 1;
		this.zFight += 0.05;
	}

	set rotationY(ry){
		this.ry = ry;
	}

	objects(){
		return this.objects;
	}

	data(){
		return this.data;
	}
}

let mariposa = new Figure(mariposaData);
//mariposa.createBg();
let rubik = new Figure(rubikData);
//rubik.createBg();

const axesHelper = new THREE.AxesHelper(300);
scene.add(axesHelper);

// function createBg(data){
// 	const bgWidth = data['shapes'][0]['data'][2];
// 	const bgHeight = data['shapes'][0]['data'][3];
// 	const bgColor = 'rgb('
// 		+data['shapes'][0]['color'][0]+', '
// 		+data['shapes'][0]['color'][1]+', '
// 		+data['shapes'][0]['color'][2]
// 		+')';
// 
// 	const bg = new THREE.Mesh(
// 		new THREE.PlaneGeometry(
// 			bgWidth,
// 			bgHeight
// 		),
// 		new THREE.MeshBasicMaterial({
// 			color: new THREE.Color(bgColor),
// 		})
// 	);
// 	scene.add(bg);
// }


// const pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
// pointLight.position.set( -100, 0, 10 );
// scene.add( pointLight );

controls.update();

document.addEventListener('keydown', () => {
// 	pointLight.position.x += 10;
	for (let i = 0; i < rubik.objects.length; i++){
		//scene.remove(rubik.objects[i]);
	}
	console.log('removed')
});

let stepR = 1;
let stepM = 1;

	//console.log(rubikData['shapes'].length);

rubik.rotationY = 180;
function animate(){
	requestAnimationFrame(animate);
	controls.update();

	if (stepR < rubikData['shapes'].length){
		//rubik.createCircle();
		rubik.createCircle();
		stepR+=1;
	}

	if (stepM < mariposaData['shapes'].length){
		mariposa.createCircle();
		stepM += 1;
	}

	camera.updateProjectionMatrix();
	
	renderer.render(scene, camera);
}

animate();

// ================ AUDIO ===============

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

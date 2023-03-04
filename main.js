import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, -70);

let renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	antialias: true,
	logarithmicDepthBuffer: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new OrbitControls(camera, renderer.domElement);

// audio analyser
var audio = new Audio("audio.mp3");
window.onload = (event) => {
	audio.play();
};

var context = new AudioContext();
var src = context.createMediaElementSource(audio);
var analyser = context.createAnalyser();
src.connect(analyser);
analyser.connect(context.destination);
analyser.fftSize = 32;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
console.log(dataArray);

// loading particles info files
const mariposaRes = await fetch('mariposa.json');
const mariposaData = await mariposaRes.json();

const rubikRes = await fetch('rubik.json');
const rubikData = await rubikRes.json();

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

// particle creation
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

	// rotate image
	ry = (ry*Math.PI)/180;
	circle.rotation.y = ry;
	
	// transformation matrix - y-axis
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

		// circle objs array
		this.objects.push(circle);
		this.step += 1;

		// Fix Z fighting
		this.zFight += 0.05;
	}

	set rotationY(ry){
		this.ry = ry;
	}

	restartFigure(){
		this.step = 1;
		this.zFight = 0.05;
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
rubik.rotationY = 180;
//rubik.createBg();

// const axesHelper = new THREE.AxesHelper(300);
// scene.add(axesHelper);

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

// document.addEventListener('keydown', () => {
// // 	pointLight.position.x += 10;
// 	for (let i = 0; i < rubik.objects.length; i++){
// 		//scene.remove(rubik.objects[i]);
// 	}
// 	console.log('removed')
// });

let stepR = 1;
let stepM = 1;
let musicInfo;
let cameraPos = 10;

function animate(){
	analyser.getByteFrequencyData(dataArray);
	//console.log(dataArray[3]/255);

	requestAnimationFrame(animate);
	controls.update();

	if (stepR < rubikData['shapes'].length && dataArray[3]/255 >= 0.7){
		//rubik.createCircle();
		rubik.createCircle();
		stepR+=1;
	} else if (stepR >= rubikData['shapes'].length){
		for (let i = 0; i < rubik.objects.length; i++){
			scene.remove(rubik.objects[i]);
		}
		stepR = 1;
		rubik.restartFigure();
	}

	if (cameraPos <= 270){
		camera.position.z = -cameraPos;
		cameraPos += 0.5;
	}

	if (stepM < mariposaData['shapes'].length){
		mariposa.createCircle();
		stepM += 1;
	}

	camera.updateProjectionMatrix();
	
	renderer.render(scene, camera);
}

animate();

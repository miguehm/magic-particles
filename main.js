//import './style.css'

import * as THREE from 'three';

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

document.body.appendChild(button)
// nodo de conexión
// .  whiteNoiseSource
// -> primaryGainControl
// -> audioContext.destination

// 

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

document.body.appendChild(snareButton)

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

document.body.appendChild(kickButton)

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

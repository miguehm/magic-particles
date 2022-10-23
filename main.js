//import './style.css'

import * as THREE from 'three';

const audioContext = new AudioContext();
const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);

const channelData = buffer.getChannelData(0)

for (let i = 0; i < buffer.length; i++){
	channelData[i] = Math.random() * 2 - 1
}

const primaryGainControl = audioContext.createGain()
primaryGainControl.gain.setValueAtTime(0.06, 0)
primaryGainControl.connect(audioContext.destination)

const button = document.createElement('button')
button.innerText = 'Sonido blanco'
button.addEventListener('click', () => {
	const whiteNoiseSource = audioContext.createBufferSource();
	whiteNoiseSource.buffer = buffer;
	whiteNoiseSource.connect(primaryGainControl)
	whiteNoiseSource.start()
})

document.body.appendChild(button)

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
const kickButton = document.createElement('button')
kickButton.innerText = 'Kick'
kickButton.addEventListener('click', () => {
	const kickOscillator = audioContext.createOscillator()

	kickOscillator.frequency.setValueAtTime(523.2, 0)
	kickOscillator.type = 'square'
	kickOscillator.connect(primaryGainControl)
	kickOscillator.start()
	kickOscillator.stop(audioContext.currentTime + 0.5)
})
document.body.appendChild(kickButton)

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

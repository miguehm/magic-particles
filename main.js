//import './style.css'

import * as THREE from 'three';

const audioContext = new AudioContext();
const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);

const channelData = buffer.getChannelData(0)

for (let i = 0; i < buffer.length; i++){
	channelData[i] = Math.random() * 2 - 1
}

const primaryGainControl = audioContext.createGain()
primaryGainControl.gain.setValueAtTime(0.20, 0)
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

const kickButton = document.createElement('button')
kickButton.innerText = 'Kick'
kickButton.addEventListener('click', () => {
	const kickOscillator = audioContext.createOscillator()

	kickOscillator.frequency.setValueAtTime(523.2, 0)
	kickOscillator.connect(primaryGainControl)
	kickOscillator.start()
	kickOscillator.stop(audioContext.currentTime + 0.5)
})

document.body.appendChild(kickButton)

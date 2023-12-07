import * as THREE from "three";

function degToRad(deg) {
	return deg * (Math.PI / 180)
}

// set rows
let main = document.getElementById('main')
for (let i = 0; i < main.children.length; i++) {
	main.children[i].style.gridRow = i + 1
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('bg')
})

// background
const spaceTexture = new THREE.TextureLoader().load('./Images/space.jpg')
scene.background = spaceTexture


// lights
const pointLight = new THREE.PointLight(0xFFFFFF, 600, 40)
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4)
scene.add(ambientLight)


// helpers
const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50)
const axesHelper = new THREE.AxesHelper(50, 50, 50)
// scene.add(lightHelper)
// scene.add(gridHelper)
// scene.add(axesHelper)

let pictures = []

class Picture {
	constructor(
		id,
		size,
		scale,
		position,
		rotation,
		src,
		loop = false
	) {
		this.id = id
		this.size = size
		this.scale = scale
		this.position = position
		this.rotation = rotation
		this.src = src
		this.video
		this.loop = loop

		const geometry = new THREE.PlaneGeometry(this.size.x, this.size.y, 1, 1)
		let texture

		if (this.src.endsWith('.mp4')) {
			if (!this.video) {
				this.video = document.createElement('video')
				document.body.appendChild(this.video)
			} else this.video = document.getElementById(this.id)
			this.video.src = this.src
			this.video.id = this.id
			this.video.loop = this.loop
			this.video.play()

			texture = new THREE.VideoTexture(this.video)
		} else
			texture = new THREE.TextureLoader().load(this.src)

		const mesh = new THREE.MeshStandardMaterial({
			map: texture,
			transparent: true,
			side: THREE.DoubleSide
		})
		this.picture = new THREE.Mesh(geometry, mesh)
		this.picture.rotation.set(rotation.x, rotation.y, rotation.z)
		this.picture.scale.set(this.scale, this.scale, this.scale)

		scene.add(this.picture)
	}

	setSrc = (src) => {
		if (this.src == src) return

		this.src = src

		if (this.src.endsWith('.mp4')) {
			if (!this.video) {
				this.video = document.createElement('video')
				this.video.id = this.id
				this.video.muted = true
				document.body.appendChild(this.video)
			}
			this.video = document.getElementById(this.id)
			this.video.src = this.src
			this.video.loop = this.loop
			this.video.play()

			this.texture = new THREE.VideoTexture(this.video)
		} else
			this.texture = new THREE.TextureLoader().load(this.src)

		this.picture.material.map = this.texture
	}

	resize = (scale) => {
		this.picture.scale.set(
			this.scale * scale * 0.6,
			this.scale * scale * 0.6,
			this.scale * scale * 0.6
		)

		if (window.innerWidth <= 600) {
			this.picture.position.set(
				this.position.mobile.x * scale * 0.6,
				this.position.mobile.y * scale,
				this.position.mobile.z
			)
		} else {
			this.picture.position.set(
				this.position.desktop.x + Math.abs(this.position.desktop.x) / scale,
				this.position.desktop.y + this.position.desktop.y * -scale * 0.2,
				this.position.desktop.z
			)
		}
	}
}

function addPicture({ size, scale, position, rotation, src, loop }) {
	if (!rotation) rotation = new THREE.Vector3()
	if (!rotation.x) rotation.x = 0
	if (!rotation.y) rotation.y = 0
	if (!rotation.z) rotation.z = 0

	rotation.x = degToRad(rotation.x)
	rotation.y = degToRad(rotation.y)
	rotation.z = degToRad(rotation.z)

	pictures.push(new Picture(pictures.length, size, scale, position, rotation, src, loop))
}

// pictures
addPicture({
	size: { x: 4032, y: 3024 },
	scale: 0.005,
	position: {
		desktop: { x: 7, y: 5, z: -20 },
		mobile: { x: 7, y: 5, z: -20 }
	},
	rotation: { y: -10 },
	src: './Images/me.png'
})

// Software Development
addPicture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	position: {
		desktop: { x: -1, y: -20, z: -20 },
		mobile: { x: -1, y: -20, z: -20 }
	},
	rotation: { y: 25 },
	src: './Images/Icons/javascript.png'
})
addPicture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	position: {
		desktop: { x: 1.5, y: -23, z: -20 },
		mobile: { x: 1.5, y: -23, z: -20 }
	},
	rotation: { y: -30, z: -10 },
	src: './Images/Icons/python.png'
})
addPicture({
	size: { x: 2135, y: 2083 },
	scale: 0.0015,
	position: {
		desktop: { x: -6, y: -45, z: -20 },
		mobile: { x: -6, y: -45, z: -20 }
	},
	rotation: { z: -30 },
	src: './Images/Icons/GitHub.png'
})

// Information Technology
// addPicture({
// 	size: { x: 588, y: 588 },
// 	scale: 0.005,
// 	position: { x: 3, y: -61, z: -20 },
// 	rotation: { y: 20, z: 10 },
// 	src: './Images/Icons/windows.png'
// })
// addPicture({
// 	size: { x: 512, y: 512 },
// 	scale: 0.005,
// 	position: { x: 1, y: -64, z: -20 },
// 	rotation: { z: -20, y: 10 },
// 	src: './Images/Icons/linux.png'
// })

// Accomplishments
// addPicture({
// 	size: { x: 1696, y: 2198 },
// 	scale: 0.007,
// 	position: { x: -4, y: -114, z: -23 },
// 	rotation: { y: 15, z: 10 },
// 	src: './Images/Certifications and Awards/National Honor Society.png'
// })


// Formal Education / Certifications
// addPicture({
// 	size: { x: 2187, y: 1632 },
// 	scale: 0.006,
// 	position: { x: -9, y: -138, z: -20 },
// 	rotation: { y: 40 },
// 	src: './Images/Honor Roll/21-22-Q2.png'
// })
// addPicture({
// 	size: { x: 2187, y: 1622 },
// 	scale: 0.006,
// 	position: { x: -4.4, y: -138, z: -20 },
// 	rotation: { y: 0 },
// 	src: './Images/Honor Roll/21-22-Q3.png'
// })
// addPicture({
// 	size: { x: 2187, y: 1611 },
// 	scale: 0.006,
// 	position: { x: 1, y: -138, z: -20 },
// 	rotation: { y: -40 },
// 	src: './Images/Honor Roll/21-22-Q4.png'
// })

// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: { x: -9, y: -149, z: -20 },
// 	rotation: { y: 40 },
// 	src: './Images/Honor Roll/22-23-Q1.png'
// })
// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: { x: -4, y: -149, z: -20 },
// 	rotation: { y: 0 },
// 	src: './Images/Honor Roll/22-23-Q2.png'
// })
// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: { x: 1, y: -149, z: -20 },
// 	rotation: { y: -40 },
// 	src: './Images/Honor Roll/22-23-Q3.png'
// })


// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: { x: 1, y: -161, z: -20 },
// 	src: './Images/Certifications and Awards/Outstanding Chemistry.png'
// })
// addPicture({
// 	size: { x: 2208, y: 1696 },
// 	scale: 0.006,
// 	position: { x: -6, y: -169, z: -20 },
// 	src: './Images/Certifications and Awards/Civic Knowledge.png'
// })
// addPicture({
// 	size: { x: 2200, y: 1700 },
// 	scale: 0.006,
// 	position: { x: 2, y: -178, z: -20 },
// 	src: './Images/Certifications and Awards/OSHA Certifacate.png'
// })
// addPicture({
// 	size: { x: 2200, y: 1700 },
// 	scale: 0.006,
// 	position: { x: -5, y: -186, z: -20 },
// 	src: './Images/Certifications and Awards/ITF Certifacate.png'
// })

function isVisible(element) {
	const rect = element.getBoundingClientRect()
	const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
	return rect.bottom >= 0 && rect.top - screenHeight < 0
}

let fazLoopTimeout = null
function scroll() {
	const scrollAmount = document.body.getBoundingClientRect().top
	const cameraPosition = scrollAmount * 0.03
	const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)

	pointLight.position.y = cameraPosition + 10
	camera.position.y = cameraPosition

	const fazTerminal = document.getElementById('Faz-Terminal')
	const fazTerminalRect = fazTerminal.getBoundingClientRect()
	if (
		fazTerminalRect.bottom < fazTerminalRect.height * 0.3 ||
		fazTerminalRect.top >= screenHeight - fazTerminalRect.height * 0.3
	) {
		fazTerminal.src = './Images/Projects/Faz-Terminal-Blank.png'
		clearTimeout(fazLoopTimeout)
	} else if (fazTerminal.src.endsWith('/Images/Projects/Faz-Terminal-Blank.png')) {
		fazTerminal.src = './Images/Projects/Faz-Terminal-Load.png'
		fazTerminal.onload = () => {
			fazLoopTimeout = setTimeout(() => {
				fazTerminal.src = './Images/Projects/Faz-Terminal-Loop.png'
			}, 17400)
		}
	}
}
document.body.onscroll = scroll
scroll()

function resizeWindow() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)

	for (const picture of pictures) {
		picture.resize(window.innerWidth / window.innerHeight)
	}
}
resizeWindow()
window.onresize = resizeWindow

function animate(time) {
	requestAnimationFrame(animate)

	renderer.render(scene, camera)
}

animate()
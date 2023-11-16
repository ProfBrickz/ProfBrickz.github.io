import * as THREE from "three";

function degToRad(deg) {
	return deg * (Math.PI / 180)
}

// set rows
let main = document.getElementsByTagName('main')[0]
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

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

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
scene.add(lightHelper)
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
		this.picture.position.set(position.x, position.y, position.z)
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
	position: { x: 11, y: 5, z: -20 },
	rotation: { y: -10 },
	src: './Images/me.png'
})

// Software Development
addPicture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	position: { x: -8, y: -20, z: -20 },
	rotation: { y: 25 },
	src: './Images/Icons/javascript.png'
})
addPicture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	position: { x: 0, y: -22, z: -20 },
	rotation: { y: -30, z: -10 },
	src: './Images/Icons/python.png'
})
addPicture({
	size: { x: 2135, y: 2083 },
	scale: 0.0015,
	position: { x: -9, y: -45, z: -20 },
	rotation: { y: 40 },
	src: './Images/Icons/GitHub.png'
})

// Information Technology
addPicture({
	size: { x: 588, y: 588 },
	scale: 0.005,
	position: { x: 2, y: -61, z: -20 },
	rotation: { y: 20, z: 10 },
	src: './Images/Icons/windows.png'
})
addPicture({
	size: { x: 512, y: 512 },
	scale: 0.005,
	position: { x: -4, y: -64, z: -20 },
	rotation: { z: -20, y: 10 },
	src: './Images/Icons/linux.png'
})

// Accomplishments
addPicture({
	size: { x: 1696, y: 2198 },
	scale: 0.007,
	position: { x: -5, y: -103, z: -23 },
	rotation: { y: 15, z: 10 },
	src: './Images/Certifications and Awards/National Honor Society.png'
})


// Formal Education / Certifications
addPicture({
	size: { x: 2187, y: 1632 },
	scale: 0.006,
	position: { x: -18, y: -122, z: -20 },
	rotation: { y: 40 },
	src: './Images/Honor Roll/21-22-Q2.png'
})
addPicture({
	size: { x: 2187, y: 1622 },
	scale: 0.006,
	position: { x: -8.8, y: -122, z: -20 },
	rotation: { y: 0 },
	src: './Images/Honor Roll/21-22-Q3.png'
})
addPicture({
	size: { x: 2187, y: 1611 },
	scale: 0.006,
	position: { x: 2, y: -122, z: -20 },
	rotation: { y: -40 },
	src: './Images/Honor Roll/21-22-Q4.png'
})

addPicture({
	size: { x: 2198, y: 1696 },
	scale: 0.006,
	position: { x: -18, y: -133, z: -20 },
	rotation: { y: 40 },
	src: './Images/Honor Roll/22-23-Q1.png'
})
addPicture({
	size: { x: 2198, y: 1696 },
	scale: 0.006,
	position: { x: -8.8, y: -133, z: -20 },
	rotation: { y: 0 },
	src: './Images/Honor Roll/22-23-Q2.png'
})
addPicture({
	size: { x: 2198, y: 1696 },
	scale: 0.006,
	position: { x: 2, y: -133, z: -20 },
	rotation: { y: -40 },
	src: './Images/Honor Roll/22-23-Q3.png'
})


addPicture({
	size: { x: 2198, y: 1696 },
	scale: 0.006,
	position: { x: -15, y: -147, z: -20 },
	src: './Images/Certifications and Awards/Outstanding Chemistry.png'
})
addPicture({
	size: { x: 2208, y: 1696 },
	scale: 0.006,
	position: { x: 1, y: -152, z: -20 },
	src: './Images/Certifications and Awards/Civic Knowledge.png'
})
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.006,
	position: { x: -18, y: -158, z: -20 },
	src: './Images/Certifications and Awards/OSHA Certifacate.png'
})
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.006,
	position: { x: -2, y: -163, z: -20 },
	src: './Images/Certifications and Awards/ITF Certifacate.png'
})

// Projects
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.007,
	position: { x: 10, y: -206, z: -20 },
	rotation: { y: -10, z: 4 },
	src: './Images/Projects/Fax-Terminal Blank.png'
})
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.004,
	position: { x: 15, y: -212, z: -15 },
	rotation: { y: -20, z: 4 },
	src: './Images/Projects/Faz-cade.png'
})

let maxScroll = window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight)

function moveCamera() {
	const scrollAmount = document.body.getBoundingClientRect().top

	let fazTerminal = pictures[pictures.length - 2];

	let fazTerminalScrollAmount = -6400
	if (
		scrollAmount < fazTerminalScrollAmount &&
		fazTerminal.src == './Images/Projects/Fax-Terminal Blank.png'
	) {
		fazTerminal.setSrc('./Images/Projects/Faz-Terminal Load.mp4')
		fazTerminal.video
		fazTerminal.video.onended = () => {
			fazTerminal.setSrc('./Images/Projects/Faz-Terminal Loop.mp4')
			fazTerminal.video.loop = true
		}
	} else if (
		scrollAmount > fazTerminalScrollAmount &&
		fazTerminal.src != './Images/Projects/Fax-Terminal Blank.png'
	) fazTerminal.setSrc('./Images/Projects/Fax-Terminal Blank.png')

	const cameraPosition = scrollAmount * 0.03

	pointLight.position.y = cameraPosition + 10
	camera.position.y = cameraPosition
}
moveCamera()
document.body.onscroll = moveCamera

function animate(time) {
	requestAnimationFrame(animate)

	renderer.render(scene, camera)
}

animate()
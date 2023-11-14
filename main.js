import * as THREE from "three";

function degToRad(deg) {
	return deg * Math.PI / 180
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
		src
	) {
		this.id = id
		this.size = size
		this.position = position
		this.rotation = rotation
		this.src = src
		this.scale = scale

		const geometry = new THREE.PlaneGeometry(this.size.x, this.size.y, 1, 1)
		const texture = new THREE.TextureLoader().load(this.src)
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
}

function addPicture({ size, scale, position, rotation, src }) {
	if (!rotation) rotation = new THREE.Vector3()
	if (!rotation.x) rotation.x = 0
	if (!rotation.y) rotation.y = 0
	if (!rotation.z) rotation.z = 0

	rotation.x = degToRad(rotation.x)
	rotation.y = degToRad(rotation.y)
	rotation.z = degToRad(rotation.z)

	pictures.push(new Picture(pictures.length, size, scale, position, rotation, src))
}

// pictures
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

// Formal Education / Certifications
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.007,
	position: { x: -18, y: -142, z: -23 },
	rotation: { y: 35, z: 10 },
	src: './Images/Certifications and Awards/OSHA Certifacate.png'
})
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.007,
	position: { x: -2, y: -153, z: -20 },
	rotation: { y: 20, z: -3 },
	src: './Images/Certifications and Awards/ITF Certifacate.png'
})

// Projects
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.006,
	position: { x: 8, y: -193, z: -20 },
	rotation: { y: -20, z: 4 },
	src: './Images/Projects/Faz-Terminal.png'
})
addPicture({
	size: { x: 2200, y: 1700 },
	scale: 0.005,
	position: { x: 16, y: -194, z: -15 },
	rotation: { y: -10, z: 4 },
	src: './Images/Projects/Faz-cade.png'
})

function moveCamera() {
	const scrollAmount = document.body.getBoundingClientRect().top

	const cameraPosition = scrollAmount * 0.03


	// pointLight.position.z = -20
	pointLight.position.y = cameraPosition + 10
	camera.position.y = cameraPosition
}
moveCamera()
document.body.onscroll = moveCamera

let maxScroll = window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight)

function animate(time) {
	requestAnimationFrame(animate)

	renderer.render(scene, camera)
}

animate()
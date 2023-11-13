import * as THREE from "three";

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
		src
	) {
		this.id = id
		this.size = size
		this.position = position
		this.src = src
		this.scale = scale

		const geometry = new THREE.PlaneGeometry(this.size[0], this.size[1], 1, 1)
		const texture = new THREE.TextureLoader().load(this.src)
		const mesh = new THREE.MeshStandardMaterial({
			map: texture,
			transparent: true
		})
		this.picture = new THREE.Mesh(geometry, mesh)

		this.picture.position.set(...position)
		this.picture.scale.set(this.scale, this.scale, this.scale)

		scene.add(this.picture)
	}
}

function addPicture(size, scale, position, src) {
	pictures.push(new Picture(pictures.length, size, scale, position, src))
}

// pictures
// Software Development
addPicture([500, 500], 0.007, [-10, -20, -20], './Images/javascript.png')
addPicture([500, 500], 0.007, [-3, -23, -20], './Images/python.png')
addPicture([2135, 2083], 0.0015, [-9, -50, -20], './Images/GitHub.png')

// Information Technology
addPicture([588, 588], 0.005, [2, -68, -20], './Images/windows.png')
addPicture([512, 512], 0.005, [-4, -71, -20], './Images/linux.png')

// Accomplishments

// Formal Education / Certifications
addPicture([2200, 1700], 0.008, [-2, -165, -20], './Images/Certifications and Awards/ITF Certifacate.png')
addPicture([2200, 1700], 0.008, [-17, -155, -23], './Images/Certifications and Awards/OSHA Certifacate.png')

// Projects


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
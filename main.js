import * as THREE from "./three.module.js"

function loadTexture(texture) {
	return new THREE.TextureLoader().load(texture)
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.y = 20
camera.position.z = 100

//LIGHTS
const pointLight = new THREE.PointLight(0xFFFFFF, 1000, 1000)
pointLight.position.set(0, 0, 50)

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1)

scene.add(pointLight)
scene.add(ambientLight)


//HELPERS
const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50)
const axesHelper = new THREE.AxesHelper(50, 50, 50)
// scene.add(lightHelper, gridHelper, axesHelper)


const geoPog = new THREE.CylinderGeometry(41.37, 41.37, 6, 320)
const texturePog = new THREE.TextureLoader().load('eevee.png')
const matPog = new THREE.MeshStandardMaterial({
	color: 0xFFFFFF,
	wireframe: false,
	map: texturePog
})
const pogMaterials = [
	new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		map: loadTexture('eevee_side.png'),
		wireframe: false
	}),
	new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		map: loadTexture('eevee.png'),
		wireframe: false
	}),
	new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		map: loadTexture('eevee_back.png'),
		wireframe: false
	})
]


const pog = new THREE.Mesh(geoPog, pogMaterials)
pog.rotation.x = 45 * Math.PI / 180

scene.add(pog)

function newStar() {
	const gemometry = new THREE.SphereGeometry(0.5, 24, 24);
	const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
	const star = new THREE.Mesh(gemometry, material);

	const x = THREE.MathUtils.randFloatSpread(500)
	const y = THREE.MathUtils.randFloatSpread(500) - 20
	const z = THREE.MathUtils.randFloatSpread(500) - 100

	star.position.set(x, y, z);
	scene.add(star);
}
Array(1000).fill().forEach(newStar)

const spaceTexture = new THREE.TextureLoader().load('space.jpg')
scene.background = spaceTexture

let t = document.body.getBoundingClientRect().top

function moveCamera() {
	t = document.body.getBoundingClientRect().top

	pog.rotation.x += 0.05
	pog.rotation.y += 0.075
	pog.rotation.z += 0.05

	camera.position.x = t * -0.0002
	camera.position.y = t * -0.0002
	camera.position.z = t * -0.02 + 100
}
document.body.onscroll = moveCamera

let maxScroll = window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight)

function animate(time) {
	requestAnimationFrame(animate)

	console.log(t, maxScroll);
	if (-1 * t >= maxScroll * 0.8) {
		pog.rotation.x += 0.05 * 0.1
		pog.rotation.y += 0.075 * 0.1
		pog.rotation.z += 0.05 * 0.1

		pog.position.x = Math.sin(pog.rotation.x) * camera.position.z * 0.7
		pog.position.y = Math.sin(pog.rotation.y) * camera.position.z * 0.7
		pog.position.z = Math.sin(pog.rotation.z) * camera.position.z * 0.07
	} else {
		pog.position.set(0, 0, 0)
	}

	renderer.render(scene, camera)
}

animate()
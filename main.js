import * as THREE from "three"

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
const pointLight = new THREE.PointLight(0xFFFFFF, 400, 40)
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
	constructor({
		id,
		size,
		scale,
		linkedTo,
		alignment = {},
		offset = {},
		depth = 10,
		rotation = {},
		src,
		loop = false
	}) {
		if (typeof alignment == 'string') {
			alignment = {
				desktop: alignment,
				mobile: alignment
			}
		}

		if (!alignment.desktop) alignment.desktop = 'center'
		if (!alignment.mobile) alignment.mobile = 'center'


		if (typeof offset.x == 'number' && typeof offset.y == 'number') {
			offset = {
				desktop: offset,
				mobile: offset
			}
		}

		if (!offset.desktop) offset.desktop = {}
		if (!offset.desktop.x) offset.desktop.x = 0
		if (!offset.desktop.y) offset.desktop.y = 0
		if (!offset.mobile) offset.mobile = {}
		if (!offset.mobile.x) offset.mobile.x = 0
		if (!offset.mobile.y) offset.mobile.y = 0

		if (!rotation.x) rotation.x = 0
		if (!rotation.y) rotation.y = 0
		if (!rotation.z) rotation.z = 0

		rotation.x = degToRad(rotation.x)
		rotation.y = degToRad(rotation.y)
		rotation.z = degToRad(rotation.z)


		this.id = id
		this.size = size
		this.scale = scale
		this.linkedTo = linkedTo
		this.alignment = alignment
		this.offset = offset
		this.depth = depth
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

		pictures.push(this)
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
	}

	setPosition = () => {
		let element = document.getElementById(this.linkedTo)
		let rect = element.getBoundingClientRect()

		let domX = rect.x
		let domY = rect.y

		let viewType = 'desktop'
		if (window.innerWidth <= 600) viewType = 'mobile'


		if (this.alignment[viewType].includes('right')) {
			domX += rect.width
		} else if (!this.alignment[viewType].includes('left')) {
			domX += rect.width / 2
		}

		if (this.alignment[viewType].includes('bottom')) {
			domY += rect.height
		} else if (!this.alignment[viewType].includes('top')) {
			domY += rect.height / 2
		}


		let newPosition = new THREE.Vector3()

		console.log(
			(window.innerWidth - rect.width),
			this.offset[viewType].x / 100
		);

		newPosition.set(
			((domX + (window.innerWidth - rect.width) * this.offset[viewType].x / 100) / window.innerWidth) * 2 - 1,
			-((domY - (window.innerWidth - rect.width) * this.offset[viewType].y / 100) / window.innerHeight) * 2 + 1,
			-this.depth
		)

		newPosition.unproject(camera)

		newPosition.sub(camera.position).normalize()

		let distance = -newPosition.z * 15

		newPosition.x = camera.position.x + newPosition.x * distance
		newPosition.y = camera.position.y + newPosition.y * distance
		newPosition.z = camera.position.z + newPosition.z * distance

		let boundingBox = new THREE.Box3().setFromObject(this.picture)
		let width = boundingBox.max.x - boundingBox.min.x
		let height = boundingBox.max.y - boundingBox.min.y

		if (this.alignment[viewType].includes('left')) {
			newPosition.x -= width / 2
		} else if (this.alignment[viewType].includes('right')) {
			newPosition.x += width / 2
		}

		if (this.alignment[viewType].includes('top')) {
			newPosition.y += height / 2
		} else if (this.alignment[viewType].includes('bottom')) {
			newPosition.y -= height / 2
		}

		this.picture.position.set(newPosition.x, newPosition.y, newPosition.z)

		this.picture.scale.set(
			-newPosition.z * this.scale * 0.06,
			-newPosition.z * this.scale * 0.06,
			-newPosition.z * this.scale * 0.06
		)
	}
}

// pictures
new Picture({
	size: { x: 1843, y: 2305 },
	scale: 0.0045,
	linkedTo: 'header',
	alignment: 'right',
	offset: {
		desktop: { x: 30, y: -10 },
		mobile: { x: -25, y: -20 }
	},
	rotation: { y: -20 },
	src: './Images/me.png'
})

// Software Development
new Picture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	linkedTo: 'software-dev',
	alignment: {
		desktop: 'right',
		mobile: 'bottom'
	},
	offset: {
		desktop: { x: 5, y: 0 },
		mobile: { x: 0, y: 5 }
	},
	depth: 10,
	rotation: { y: 30 },
	src: './Images/Icons/javascript.png'
})
new Picture({
	size: { x: 500, y: 500 },
	scale: 0.007,
	linkedTo: 'software-dev',
	alignment: {
		desktop: 'bottom right',
		mobile: 'bottom'
	},
	offset: {
		desktop: { x: 25, y: 120 },
		mobile: { x: 150, y: -25 }
	},
	depth: 10,
	rotation: { y: -30, z: -10 },
	src: './Images/Icons/python.png'
})
// addPicture({
// 	size: { x: 2135, y: 2083 },
// 	scale: 0.0015,
// 	position: {
// 		desktop: { x: -27, y: -49.5, z: -20 },
// 		mobile: { x: -27, y: -49.5, z: -20 }
// 	},
// 	rotation: { z: -30 },
// 	src: './Images/Icons/GitHub.png'
// })

// Information Technology
// addPicture({
// 	size: { x: 588, y: 588 },
// 	scale: 0.005,
// 	position: {
// 		desktop: { x: 6, y: -60, z: -20 },
// 		mobile: { x: 6, y: -60, z: -20 }
// 	},
// 	rotation: { y: 20, z: 10 },
// 	src: './Images/Icons/windows.png'
// })
// addPicture({
// 	size: { x: 512, y: 512 },
// 	scale: 0.005,
// 	position: {
// 		desktop: { x: 9, y: -71, z: -20 },
// 		mobile: { x: 9, y: -71, z: -20 }
// 	},
// 	rotation: { z: -40, y: -10 },
// 	src: './Images/Icons/linux.png'
// })

// Accomplishments
// addPicture({
// 	size: { x: 1696, y: 2198 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -7, y: -85, z: -23 },
// 		mobile: { x: -7, y: -85, z: -23 }
// 	},
// 	rotation: { y: 15, z: 10 },
// 	src: './Images/Certifications and Awards/National Honor Society.png'
// })


// Formal Education / Certifications
// addPicture({
// 	size: { x: 2187, y: 1632 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -9, y: -138, z: -20 },
// 		mobile: { x: -9, y: -138, z: -20 }
// 	},
// 	rotation: { y: 40 },
// 	src: './Images/Honor Roll/21-22-Q2.png'
// })
// addPicture({
// 	size: { x: 2187, y: 1622 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -4.4, y: -138, z: -20 },
// 		mobile: { x: -4.4, y: -138, z: -20 }
// 	},
// 	rotation: { y: 0 },
// 	src: './Images/Honor Roll/21-22-Q3.png'
// })
// addPicture({
// 	size: { x: 2187, y: 1611 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: 1, y: -138, z: -20 },
// 		mobile: { x: 1, y: -138, z: -20 }
// 	},
// 	rotation: { y: -40 },
// 	src: './Images/Honor Roll/21-22-Q4.png'
// })

// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -9, y: -149, z: -20 },
// 		mobile: { x: -9, y: -149, z: -20 }
// 	},
// 	rotation: { y: 40 },
// 	src: './Images/Honor Roll/22-23-Q1.png'
// })
// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -4, y: -149, z: -20 },
// 		mobile: { x: -4, y: -149, z: -20 }
// 	},
// 	rotation: { y: 0 },
// 	src: './Images/Honor Roll/22-23-Q2.png'
// })
// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: 1, y: -149, z: -20 },
// 		mobile: { x: 1, y: -149, z: -20 }
// 	},
// 	rotation: { y: -40 },
// 	src: './Images/Honor Roll/22-23-Q3.png'
// })


// addPicture({
// 	size: { x: 2198, y: 1696 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: 1, y: -161, z: -20 },
// 		mobile: { x: 1, y: -161, z: -20 }
// 	},
// 	src: './Images/Certifications and Awards/Outstanding Chemistry.png'
// })
// addPicture({
// 	size: { x: 2208, y: 1696 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -6, y: -169, z: -20 },
// 		mobile: { x: -6, y: -169, z: -20 }
// 	},
// 	src: './Images/Certifications and Awards/Civic Knowledge.png'
// })
// addPicture({
// 	size: { x: 2200, y: 1700 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: 2, y: -178, z: -20 },
// 		mobile: { x: 2, y: -178, z: -20 }
// 	},
// 	src: './Images/Certifications and Awards/OSHA Certifacate.png'
// })
// addPicture({
// 	size: { x: 2200, y: 1700 },
// 	scale: 0.006,
// 	position: {
// 		desktop: { x: -5, y: -186, z: -20 },
// 		mobile: { x: -5, y: -186, z: -20 }
// 	},
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
	const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
	// const cameraPosition = scrollAmount * 0.03

	// pointLight.position.y = cameraPosition + 10
	// camera.position.y = cameraPosition

	const fazTerminalRect = document.getElementById('Faz-Terminal-Box').getBoundingClientRect()
	const fazTerminalImage = document.getElementById('Faz-Terminal-Image')
	const fazTerminalVideo = document.getElementById('Faz-Terminal-Video')
	if (
		fazTerminalRect.bottom < fazTerminalRect.height * 0.3 ||
		fazTerminalRect.top >= screenHeight - fazTerminalRect.height * 0.3
	) {
		fazTerminalImage.style.display = 'block'
		fazTerminalVideo.style.display = 'none'
		fazTerminalVideo.pause()
		fazTerminalVideo.currentTime = 0
		fazTerminalVideo.loop = false
		fazTerminalVideo.src = './Images/Projects/Faz-Terminal-Load.mp4'
	} else if (fazTerminalImage.style.display != 'none') {
		fazTerminalImage.style.display = 'none'
		fazTerminalVideo.style.display = 'block'
		fazTerminalVideo.play()
		fazTerminalVideo.onended = () => {
			fazTerminalVideo.src = './Images/Projects/Faz-Terminal-Loop.mp4'
			fazTerminalVideo.play()
			fazTerminalVideo.loop = true
			fazTerminalVideo.onended = ''
		}
	}

	for (const picture of pictures) {
		picture.setPosition()
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
		picture.setPosition()
		// picture.resize(window.innerWidth / window.innerHeight)
	}
}
resizeWindow()
window.onresize = resizeWindow

function animate(time) {
	requestAnimationFrame(animate)

	renderer.render(scene, camera)
}

animate()
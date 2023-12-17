import * as THREE from "three"

function degToRad(deg) {
	return deg * (Math.PI / 180)
}

let rows = document.getElementsByClassName('row')
let boxes = document.getElementsByClassName('box')

let boxData = {}

for (let box of boxes) {
	boxData[box.id] = {
		column: Number(window.getComputedStyle(box).gridColumnStart) - 1,
		width: null
	}
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
const pointLight = new THREE.PointLight(0xFFFFFF, 100, 40)
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
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
		scale = {},
		linkedTo,
		alignment = {},
		offset = {},
		depth = 10,
		rotation = {},
		src,
		loop = false
	}) {
		if (typeof scale == 'number') {
			scale = {
				desktop: scale,
				mobile: scale
			}
		}

		if (typeof linkedTo == 'string') {
			linkedTo = {
				desktop: linkedTo,
				mobile: linkedTo
			}
		}

		if (typeof alignment == 'string') {
			alignment = {
				desktop: alignment,
				mobile: alignment
			}
		}

		if (!alignment.desktop) alignment.desktop = 'center'

		if (typeof offset.x == 'number' && typeof offset.y == 'number') {
			offset = {
				desktop: offset,
				mobile: offset
			}
		}

		if (!offset.desktop) offset.desktop = {}
		if (!offset.desktop.x) offset.desktop.x = 0
		if (!offset.desktop.y) offset.desktop.y = 0

		if (!rotation.x) rotation.x = 0
		if (!rotation.y) rotation.y = 0
		if (!rotation.z) rotation.z = 0

		rotation.x = degToRad(rotation.x)
		rotation.y = degToRad(rotation.y)
		rotation.z = degToRad(rotation.z)

		this.viewTypes = []

		for (let scaleKey of Object.keys(scale)) {
			if (!this.viewTypes.includes(scaleKey) && !isNaN(scaleKey))
				this.viewTypes.push(scaleKey)
		}

		for (let alignmentKey of Object.keys(alignment)) {
			if (!this.viewTypes.includes(alignmentKey) && !isNaN(alignmentKey))
				this.viewTypes.push(alignmentKey)
		}

		for (let offsetKey of Object.keys(offset)) {
			if (!this.viewTypes.includes(offsetKey) && !isNaN(offsetKey))
				this.viewTypes.push(offsetKey)
		}

		this.viewTypes = this.viewTypes.sort((a, b) => b - a)

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

		let scaleViewType = this.getViewType(this.scale)
		this.picture.scale.set(
			this.scale[scaleViewType],
			this.scale[scaleViewType],
			this.scale[scaleViewType]
		)

		scene.add(this.picture)

		pictures.push(this)
	}

	getViewType = (prop) => {
		let viewType = 'desktop'
		if (
			window.innerWidth <= 600 &&
			Object.keys(prop).includes('mobile')
		)
			viewType = 'mobile'

		for (let viewType of this.viewTypes) {
			if (
				window.innerWidth > Number(viewType)
			) continue

			if (
				Object.keys(prop).includes(viewType)
			) viewType = viewType
		}

		return viewType
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
		} else this.texture = new THREE.TextureLoader().load(this.src)

		this.picture.material.map = this.texture
	}

	update = () => {
		let scaleViewType = 'desktop'
		let alignmentViewType = 'desktop'
		let offsetViewType = 'desktop'
		let linkedToViewType = 'desktop'
		if (window.innerWidth <= 600) {
			if (Object.keys(this.scale).includes('mobile'))
				scaleViewType = 'mobile'
			if (Object.keys(this.linkedTo).includes('mobile'))
				linkedToViewType = 'mobile'
			if (Object.keys(this.alignment).includes('mobile'))
				alignmentViewType = 'mobile'
			if (Object.keys(this.offset).includes('mobile'))
				offsetViewType = 'mobile'
		}

		for (let viewType of this.viewTypes) {
			if (
				window.innerWidth > Number(viewType)
			) continue

			if (
				Object.keys(this.scale).includes(viewType) &&
				!(Object.keys(this.scale).includes('mobile') && window.innerWidth <= 600 && Number(viewType) >= 600)
			) scaleViewType = viewType
			if (
				Object.keys(this.linkedTo).includes(viewType) &&
				!(Object.keys(this.linkedTo).includes('mobile') && window.innerWidth <= 600 && Number(viewType) >= 600)
			) linkedToViewType = viewType
			if (
				Object.keys(this.alignment).includes(viewType) &&
				!(Object.keys(this.alignment).includes('mobile') && window.innerWidth <= 600 && Number(viewType) >= 600)
			) alignmentViewType = viewType
			if (
				Object.keys(this.offset).includes(viewType) &&
				!(Object.keys(this.offset).includes('mobile') && window.innerWidth <= 600 && Number(viewType) >= 600)
			) offsetViewType = viewType
		}


		let element = document.getElementById(this.linkedTo[linkedToViewType])
		let rect = element.getBoundingClientRect()

		let domX = rect.x
		let domY = rect.y

		if (this.alignment[alignmentViewType].includes('center-x')) {
			domX = window.innerWidth / 2
		} else if (this.alignment[alignmentViewType].includes('right')) {
			domX += rect.width
		} else if (!this.alignment[alignmentViewType].includes('left')) {
			domX += rect.width / 2
		}

		if (this.alignment[alignmentViewType].includes('center-y')) {
			domX = window.innerHeight / 2
		} else if (this.alignment[alignmentViewType].includes('bottom')) {
			domY += rect.height
		} else if (!this.alignment[alignmentViewType].includes('top')) {
			domY += rect.height / 2
		}


		let newPosition = new THREE.Vector3()

		let offsetX = 0
		let offsetXParts = null
		let offsetY = 0
		let offsetYParts = null


		if (typeof this.offset[offsetViewType].x == 'number') {
			offsetX = window.innerWidth * this.offset[offsetViewType].x / 100
		} else if (typeof this.offset[offsetViewType].x == 'string') {
			offsetXParts = this.offset[offsetViewType].x.match(/(-?\d*\.?\w+[%]?)/g);


			for (let part of offsetXParts) {
				if (part.endsWith('px')) {
					offsetX += Number(part.replace('px', ''))
				} else if (part.endsWith('w%')) {
					offsetX += window.innerWidth * Number(part.replace('w%', '')) / 100
				} else if (part.endsWith('e%')) {
					offsetX += rect.height * Number(part.replace('e%', '')) / 100
				}
			}
		}
		if (typeof this.offset[offsetViewType].y == 'number') {
			offsetY = window.innerHeight * this.offset[offsetViewType].y / 100
		} else if (typeof this.offset[offsetViewType].y == 'string') {
			offsetYParts = this.offset[offsetViewType].y.match(/(-?\d*\.?\w+[%]?)/g);

			for (let part of offsetYParts) {
				if (part.endsWith('px')) {
					offsetY += Number(part.replace('px', ''))
				} else if (part.endsWith('w%')) {
					offsetY += window.innerHeight * Number(part.replace('w%', '')) / 100
				} else if (part.endsWith('e%')) {
					offsetY += rect.height * Number(part.replace('e%', '')) / 100
				}
			}
		}

		newPosition.set(
			((domX + offsetX) / window.innerWidth) * 2 - 1,
			-((domY - offsetY) / window.innerHeight) * 2 + 1,
			-this.depth
		)

		newPosition.unproject(camera)

		newPosition.sub(camera.position).normalize()

		let distance = -newPosition.z * this.depth * 2.5

		newPosition.x = camera.position.x + newPosition.x * distance
		newPosition.y = camera.position.y + newPosition.y * distance
		newPosition.z = camera.position.z + newPosition.z * distance

		let boundingBox = new THREE.Box3().setFromObject(this.picture)
		let width = boundingBox.max.x - boundingBox.min.x
		let height = boundingBox.max.y - boundingBox.min.y

		if (this.alignment[alignmentViewType].includes('outside')) {
			if (!this.alignment[alignmentViewType].includes('center-x')) {
				if (this.alignment[alignmentViewType].includes('left')) {
					newPosition.x -= width / 2
				} else if (this.alignment[alignmentViewType].includes('right')) {
					newPosition.x += width / 2
				}
			}

			if (!this.alignment[alignmentViewType].includes('center-y')) {
				if (this.alignment[alignmentViewType].includes('top')) {
					newPosition.y += height / 2
				} else if (this.alignment[alignmentViewType].includes('bottom')) {
					newPosition.y -= height / 2
				}
			}
		} else if (this.alignment[alignmentViewType].includes('inside')) {
			if (!this.alignment[alignmentViewType].includes('center-x')) {
				if (this.alignment[alignmentViewType].includes('left')) {
					newPosition.x += width / 2
				} else if (this.alignment[alignmentViewType].includes('right')) {
					newPosition.x -= width / 2
				}
			}

			if (!this.alignment[alignmentViewType].includes('center-y')) {
				if (this.alignment[alignmentViewType].includes('top')) {
					newPosition.y -= height / 2
				} else if (this.alignment[alignmentViewType].includes('bottom')) {
					newPosition.y += height / 2
				}
			}
		}


		if (offsetXParts) {
			for (let part of offsetXParts) {
				if (part.endsWith('height')) {
					newPosition.x += height * Number(part.replace('height', ''))
				} else if (part.endsWith('width')) {
					newPosition.x += width * Number(part.replace('width', ''))
				}
			}
		}
		if (offsetYParts) {
			for (let part of offsetYParts) {
				if (part.endsWith('height')) {
					newPosition.y += height * Number(part.replace('height', ''))
				} else if (part.endsWith('width')) {
					newPosition.y += width * Number(part.replace('width', ''))
				}
			}
		}

		this.picture.position.set(newPosition.x, newPosition.y, newPosition.z)

		let windowScale = (window.innerWidth / window.innerHeight) ** 0.7
		windowScale = Math.abs(windowScale)

		this.picture.scale.set(
			-newPosition.z * this.scale[scaleViewType] * 0.06 * windowScale,
			-newPosition.z * this.scale[scaleViewType] * 0.06 * windowScale,
			-newPosition.z * this.scale[scaleViewType] * 0.06 * windowScale
		)
	}
}

// pictures
new Picture({
	size: { x: 1843, y: 2305 },
	scale: {
		desktop: 0.0035,
		'1000': 0.005,
		'500': 0.006
	},
	linkedTo: {
		desktop: 'main',
		mobile: 'skills'
	},
	alignment: {
		desktop: 'inside top right',
		mobile: 'outside top'
	},
	offset: {
		desktop: { x: -7, y: -7 },
		mobile: { x: 0, y: -2 },
		'850': { x: -5, y: -5 }
	},
	rotation: { z: 7, y: -10 },
	src: './Images/me.png'
})

// Software Development
new Picture({
	size: { x: 500, y: 500 },
	scale: {
		desktop: 0.005,
		'1000': 0.006
	},
	linkedTo: 'software-dev',
	alignment: {
		desktop: 'outside right',
		'700': 'outside bottom'
	},
	offset: {
		desktop: { x: 5, y: 10 },
		'700': { x: -25, y: -5 }
	},
	depth: 11,
	rotation: { y: 30 },
	src: './Images/Icons/javascript.png'
})
new Picture({
	size: { x: 500, y: 500 },
	scale: {
		desktop: 0.005,
		'1000': 0.006
	},
	linkedTo: 'software-dev',
	alignment: {
		desktop: 'outside right',
		'700': 'outside bottom'
	},
	offset: {
		desktop: { x: 4, y: -20 },
		'700': { x: 2, y: 0 }
	},
	depth: 10,
	rotation: { y: 30, z: -15 },
	src: './Images/Icons/python.png'
})
new Picture({
	size: { x: 2135, y: 2083 },
	scale: {
		desktop: 0.0011,
		mobile: 0.0015
	},
	linkedTo: 'software-dev',
	alignment: {
		desktop: 'outside bottom right',
		'700': 'outside bottom'
	},
	offset: {
		desktop: { x: 0, y: 4 },
		'700': { x: 25, y: -7 }
	},
	depth: 12,
	rotation: { z: -30 },
	src: './Images/Icons/GitHub.png'
})

// Information Technology
new Picture({
	size: { x: 588, y: 588 },
	scale: {
		desktop: 0.004,
		'1000': 0.005,
		mobile: 0.006
	},
	linkedTo: 'IT',
	alignment: {
		desktop: 'outside left',
		mobile: 'outside bottom'
	},
	offset: {
		desktop: { x: 0, y: 10 },
		mobile: { x: -20, y: -2 }
	},
	rotation: { y: 20, z: 10 },
	src: './Images/Icons/windows.png'
})
new Picture({
	size: { x: 512, y: 512 },
	scale: {
		desktop: 0.004,
		'1000': 0.005,
		mobile: 0.006
	},
	linkedTo: 'IT',
	alignment: {
		desktop: 'outside left',
		mobile: 'outside bottom'
	},
	offset: {
		desktop: { x: -5, y: -7 },
		mobile: { x: 15, y: -6 }
	},
	depth: 15,
	rotation: { z: -40, y: -10 },
	src: './Images/Icons/linux.png'
})

// Accomplishments
new Picture({
	size: { x: 1696, y: 2198 },
	scale: {
		desktop: 0.004,
		'1000': 0.005,
		'700': 0.006
	},
	linkedTo: 'accomplishments',
	alignment: {
		desktop: 'outside right',
		'1000': 'outside bottom'
	},
	offset: {
		desktop: { x: 2, y: 3 },
		mobile: { x: 0, y: 0 },
		'1100': { x: 0, y: 3 },
		'1000': { x: 0, y: 0 }
	},
	depth: 15,
	rotation: { y: 15, z: 10 },
	src: './Images/Certifications and Awards/National Honor Society.png'
})


// Formal Education / Certifications
new Picture({
	size: { x: 2187, y: 1632 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -35, y: '-1height-10e%' },
		'1300': { x: -25, y: -5 }
	},
	depth: 13,
	rotation: { y: 40 },
	src: './Images/Honor Roll/21-22-Q2.png'
})
new Picture({
	size: { x: 2187, y: 1622 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -14, y: '-1height-10e%' },
		'1300': { x: 0, y: -5 }
	},
	depth: 7,
	rotation: { y: 0 },
	src: './Images/Honor Roll/21-22-Q3.png'
})
new Picture({
	size: { x: 2187, y: 1611 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: 1, y: '-1height-10e%' },
		'1300': { x: 25, y: -5 }
	},
	depth: 13,
	rotation: { y: -40 },
	src: './Images/Honor Roll/21-22-Q4.png'
})

new Picture({
	size: { x: 2198, y: 1696 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -35, y: '-2height-12e%' },
		'1300': { x: -25, y: '-1height-7w%', },
		// mobile: { x: -25, y: -26 }
	},
	depth: 13,
	rotation: { y: 40 },
	src: './Images/Honor Roll/22-23-Q1.png'
})
new Picture({
	size: { x: 2198, y: 1696 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -14, y: '-2height-12e%' },
		'1300': { x: 0, y: '-1height-7w%' },
		// mobile: { x: 0, y: -26 }
	},
	depth: 7,
	rotation: { y: 0 },
	src: './Images/Honor Roll/22-23-Q2.png'
})
new Picture({
	size: { x: 2198, y: 1696 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1300': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: 1, y: '-2height-12e%' },
		'1300': { x: 25, y: '-1height-7w%' },
		// mobile: { x: 25, y: -26 }
	},
	depth: 13,
	rotation: { y: -40 },
	src: './Images/Honor Roll/22-23-Q3.png'
})


new Picture({
	size: { x: 2198, y: 1696 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1100': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -32, y: '-3height-20e%' },
		'1300': { x: '-1width-5w%', y: '-2height-16e%' },
		'1100': { x: -25, y: '-2height-10w%' }
	},
	depth: 10,
	src: './Images/Certifications and Awards/Outstanding Chemistry.png'
})
new Picture({
	size: { x: 2208, y: 1696 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1100': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -2, y: '-3height-20e%' },
		'1100': { x: 25, y: '-2height-10w%' }
	},
	depth: 10,
	src: './Images/Certifications and Awards/Civic Knowledge.png'
})
new Picture({
	size: { x: 2200, y: 1700 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1100': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: -2, y: '-4height-22e%' },
		'1300': { x: -2, y: '-1height-14e%' },
		'1100': { x: -25, y: '-3height-13w%' }
	},
	depth: 15,
	src: './Images/Certifications and Awards/OSHA Certifacate.png'
})
new Picture({
	size: { x: 2200, y: 1700 },
	scale: 0.0035,
	linkedTo: 'education',
	alignment: {
		desktop: 'outside top left',
		'1100': 'outside bottom center-x',
	},
	offset: {
		desktop: { x: '1width', y: '-4height-22e%' },
		'1300': { x: -2, y: '-2height-16e%' },
		'1100': { x: 25, y: '-3height-13w%' }
	},
	depth: 15,
	src: './Images/Certifications and Awards/ITF Certifacate.png'
})


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
		picture.update()
	}
}
document.body.onscroll = scroll
scroll()

function resizeWindow() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)

	for (let i = 0; i < rows.length; i++) {
		let row = rows[i]
		let box = boxes[i]

		let rowRect = row.getBoundingClientRect()
		let boxRect = box.getBoundingClientRect()

		if (
			boxData[box.id].column > 10 &&
			rowRect.width / 20 * boxData[box.id].column + (boxData[box.id].width ?? boxRect.width) > rowRect.width
		) {
			// row.style.backgroundColor = 'red'
			box.style.gridColumnStart = 'none'
			box.style.float = 'right'
			if (!boxData[box.id].width) {
				box.style.width = 'min-content'
				boxData[box.id].width = boxRect.width
				box.style.width = ''
			}
		} else {
			row.style.backgroundColor = ''
			box.style.gridColumnStart = ''
			box.style.float = ''
			box.style.width = ''
		}
	}

	for (const picture of pictures) {
		picture.update()
	}
}
window.onresize = resizeWindow
resizeWindow()

function animate(time) {
	requestAnimationFrame(animate)

	renderer.render(scene, camera)
}

animate()
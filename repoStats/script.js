// get query params
let urlParams = new URLSearchParams(window.location.search)
urlParams = Object.fromEntries(urlParams.entries())

if (!urlParams.code) {
	window.location.href = 'https://github.com/login/oauth/authorize?client_id=Ov23lip2neN6Jn4zu8tg'
}

let repo = {
	name: '',
	period: null,
	from: null,
	branches: [],
	contributors: {},
}
let stats = {
	issues: {
		'Closed issue assigned': {},
		'Percent of closed issues you assigned': {},
		'Closed issue authors': {},
		'Percent of closed issues you made': {},
		'Open issue authors': {},
		'Percent of open issues you made': {},
		'Issues opened and closed by the same person': {},
		'Percent of issues you opened and also closed': {},
	}
}
let themeLoaded = false


// HTML elements
const themeToggle = document.getElementById('theme-toggle-checkbox')
const themeToggleSwitch = document.getElementById('theme-toggle-switch')
const lightThemeStyle = document.getElementById('light-theme-style')
const darkThemeStyle = document.getElementById('dark-theme-style')
const lightThemeIcon = document.getElementById('light-theme-icon')
const darkThemeIcon = document.getElementById('dark-theme-icon')
const repoInput = document.getElementById('repo-input')
const repoPeriod = document.getElementById('repo-period')

// Theme toggle functionality
function setTheme(theme) {
	localStorage.setItem('theme', theme)
	themeToggle.checked = theme === 'dark'

	document.documentElement.setAttribute('data-theme', theme)

	if (themeLoaded === false) {
		document.body.style.visibility = 'visible'
		setTimeout(() => {
			document.body.style.transitionDuration = '0.3s'
		}, 0);

		themeLoaded = true
	}
}

function loadTheme() {
	const savedTheme = localStorage.getItem('theme')
	if (savedTheme) {
		setTheme(savedTheme)
	} else {
		const preferredScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		setTheme(preferredScheme)
	}
}

themeToggle.addEventListener('change', () => {
	const theme = themeToggle.checked ? 'dark' : 'light'
	setTheme(theme)
})

loadTheme()

repoInput.addEventListener('blur', (event) => {
	let repoName = event.target.value
})

let treeTogglers = document.getElementsByClassName('tree-toggler')
for (let treeToggler of treeTogglers) {
	treeToggler.addEventListener('click', function () {
		this.classList.toggle('open');
		this.nextElementSibling.classList.toggle('open');
	});
}

function updateTree() {
	updateBranch(stats, document.getElementById('tree'))
}

function updateBranch(stats, branch) {
	console.log(branch);

	let branchItems = branch.children
	let itemIndex = 0

	for (const [key, value] of Object.entries(stats)) {
		console.log(
			'\nkey:', key,
			'\nvalue:', value,
			'\nArray:', Array.isArray(value),
			'\nObject:', typeof value === 'object' && !Array.isArray(value),
		);
		if (key === 'total') {

		} else if (typeof value === 'object' && !Array.isArray(value)) {
			console.log(branchItems[itemIndex]);

			updateBranch(value, branchItems[itemIndex])
		} else {

		}
		itemIndex++
	}

	for (let i = branchItems.length - 1; i >= itemIndex; i--) {
		branchItems[i].remove()
	}
}

stats = {
	issues: {
		total: 210,
		open: {
			total: 120,
			JaneDoe123: 65,
			alexR2020: 80
		},
		closed: {
			total: 30,
			JaneDoe123: 40,
			alexR2020: 25
		}
	},
	commits: {
		total: 3250,
		JaneDoe123: 1700,
		alexR2020: 1550
	},
	pullRequests: {
		total: 110,
		JaneDoe123: 60,
		alexR2020: 50
	}
}

updateBranch(stats.issues.open, document.getElementById('tree').children[0].children[1].children[0])

// setTimeout(() => {
// 	stats = {
// 		issues: {
// 			total: 183,
// 			open: {
// 				total: 132,
// 				ProfBrickz: 78,
// 				csmith1188: 54
// 			},
// 			closed: {
// 				total: 51,
// 				ProfBrickz: 30,
// 				csmith1188: 21
// 			}
// 		},
// 		commits: {
// 			total: 2731,
// 			ProfBrickz: 1523,
// 			csmith1188: 1208
// 		},
// 		pullRequests: {
// 			total: 95,
// 			ProfBrickz: 52,
// 			csmith1188: 43
// 		}
// 	}

// 	updateTree()
// }, 5000);
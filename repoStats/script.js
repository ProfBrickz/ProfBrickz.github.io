// Imports
// import * as axios from 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'

// get query params
let urlParams = new URLSearchParams(window.location.search)
urlParams = Object.fromEntries(urlParams.entries())

// github oauth
if (!urlParams.code) {
   window.location.href =
      'https://github.com/login/oauth/authorize?client_id=Ov23lip2neN6Jn4zu8tg'
}

// functions
function updateTree() {
   tree.innerHTML = ''

   for (let [name, branch] of Object.entries(stats)) {
      tree.appendChild(makeBranch(branch, name))
   }
}

function makeBranch(branch, name) {
   let treeItem = document.createElement('li')
   treeItem.classList.add('tree-item')

   let treeToggler = document.createElement('span')
   treeToggler.classList.add('tree-toggler')
   treeToggler.textContent = name
   treeToggler.addEventListener('click', (event) => {
      let treeToggler = event.target

      treeToggler.classList.toggle('open')
      treeToggler.nextElementSibling.classList.toggle('open')
   })

   let total = document.createElement('span')
   total.classList.add('stat-value')
   total.textContent = `(${branch.total})`
   treeToggler.appendChild(total)

   treeItem.appendChild(treeToggler)

   let branchElement = document.createElement('ul')
   branchElement.classList.add('branch')

   for (let [key, value] of Object.entries(branch.values)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
         branchElement.appendChild(makeBranch(value, `${key} `))
      } else {
         let treeItem = document.createElement('li')
         treeItem.classList.add('tree-item')
         treeItem.textContent = key

         let statValue = document.createElement('span')
         statValue.classList.add('stat-value')
         statValue.textContent = `(${value})`
         treeItem.appendChild(statValue)

         branchElement.appendChild(treeItem)
      }
   }

   treeItem.appendChild(branchElement)

   return treeItem
}

function clearRepo() {
   repo = {
      name: '',
      period: null,
      from: null,
      branches: [],
      contributors: {}
   }

   stats = {
      issues: {
         'Closed issue assigned': {},
         'Percent of closed issues you assigned': {},
         'Closed issue authors': {},
         'Percent of closed issues you made': {},
         'Open issue authors': {},
         'Percent of open issues you made': {},
         'Issues opened and closed by the same person': {},
         'Percent of issues you opened and also closed': {}
      }
   }
}

function validateRepoName() {
   try {
      let repoName = repoInput.value.trim()
      let [username, repository] = repoName.split('/')

      let messages = []

      // Username validation
      if (username) {
         if (/^-|-$/.test(username)) {
            messages.push('Username cannot begin or end with a hyphen')
         }
         if (!/^[a-zA-Z0-9-]+$/.test(username)) {
            messages.push(
               'Username may only contain alphanumeric characters or single hyphens'
            )
         }
         if (username.includes('--')) {
            messages.push('Username cannot contain consecutive hyphens')
         }
         if (username.length > 39) {
            messages.push('Username is too long (maximum is 39 characters)')
         }
      } else {
         messages.push('Please enter a username')
      }

      // Repository validation
      if (repository) {
         if (!/^[ -~]+$/.test(repository)) {
            messages.push('Repository name can only contain ASCII characters')
         }
         if (repository.length > 100) {
            messages.push(
               'Repository name is too long (maximum is 100 characters)'
            )
         }
      } else {
         messages.push('Please enter a repository')
      }

      if (messages.length > 0) {
         repoError.innerText = messages.join(', ')

         repoError.classList.remove('hidden')

         repoLink.classList.add('hidden')
         repoLink.href = ''
      } else {
         repoError.innerText = ''

         repoError.classList.add('hidden')
      }
   } catch (error) {
      console.error(error)

      repoError.innerText = 'Unknown error'
      repoError.classList.remove('hidden')

      repoLink.classList.add('hidden')
      repoLink.href = ''
   }
}

async function checkRepoExistence() {
   try {
      let repoName = repoInput.value

      if (!repoError.classList.contains('hidden')) return

      let response = await axios.get(`https://api.github.com/repos/${repoName}`)

      if (response.status === 200) {
         repoLink.classList.remove('hidden')
         repoLink.href = `https://github.com/${repoName}`

         repo.name = repoName
      } else {
         repoError.innerText = `Unexpected status code: ${response.status}`
         repoError.classList.remove('hidden')

         repoLink.classList.add('hidden')
         repoLink.href = ''

         clearRepo()
      }
   } catch (error) {
      if (error.response.status === 404) {
         repoError.innerText = 'Repository does not exist'
         repoError.classList.remove('hidden')

         repoLink.classList.add('hidden')
         repoLink.href = ''

         clearRepo()
      } else {
         console.error(error)

         repoError.innerText = 'Unknown error'
         repoError.classList.remove('hidden')

         repoLink.classList.add('hidden')
         repoLink.href = ''

         clearRepo()
      }
   }
}

// variables
let repo = {}
let stats = {}
let themeLoaded = false

clearRepo()

// HTML elements
const themeToggle = document.getElementById('theme-toggle-checkbox')
const themeToggleSwitch = document.getElementById('theme-toggle-switch')
const lightThemeStyle = document.getElementById('light-theme-style')
const darkThemeStyle = document.getElementById('dark-theme-style')
const lightThemeIcon = document.getElementById('light-theme-icon')
const darkThemeIcon = document.getElementById('dark-theme-icon')
const repoInput = document.getElementById('repo-input')
const repoPeriod = document.getElementById('repo-period')
const treeTogglers = document.getElementsByClassName('tree-toggler')
const tree = document.getElementById('tree')
const repoLink = document.getElementById('repo-link')
const repoError = document.getElementById('repo-error')

// Theme toggle functionality
function setTheme(theme) {
   localStorage.setItem('theme', theme)
   themeToggle.checked = theme === 'dark'

   document.documentElement.setAttribute('data-theme', theme)

   if (themeLoaded === false) {
      document.body.style.visibility = 'visible'
      setTimeout(() => {
         document.body.style.transitionDuration = '0.3s'
      }, 0)

      themeLoaded = true
   }
}

// Load theme
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
   setTheme(savedTheme)
} else {
   const preferredScheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'
   setTheme(preferredScheme)
}

// Event listeners
themeToggle.addEventListener('change', () => {
   const theme = themeToggle.checked ? 'dark' : 'light'
   setTheme(theme)
})

repoInput.addEventListener('keydown', (event) => {
   if (event.key === 'Enter') {
      checkRepoExistence()

      repoInput.blur()
   } else validateRepoName()
})

repoInput.addEventListener('blur', checkRepoExistence)

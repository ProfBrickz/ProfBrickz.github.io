// Constants
const AUTHENTICATION_URL = 'http://127.0.0.1:3000'
const CLIENT_ID = 'Ov23lip2neN6Jn4zu8tg'
const REDIRECT_URL = 'http://127.0.0.1:3000/authenticate'

// functions
/**
 * Updates the DOM element representing a tree structure.
 *
 * This function clears the current content of the `tree` element and then iterates over the `stats` object.
 * For each entry in `stats`, it creates a new branch element using the `makeBranch` function and appends it to the `tree` element.
 *
 * @function updateTree
 */
function updateTree() {
   statsTree.innerHTML = ''

   for (let [name, branch] of Object.entries(stats)) {
      statsTree.appendChild(makeBranch(branch, name))
   }
}

/**
 * Creates a tree structure for a branch and its sub-branches.
 *
 * This function generates a nested list item (`<li>`) representing a branch and its sub-branches.
 * It recursively processes each sub-branch and appends them to the main branch element.
 * The branch element includes a summary with an icon, branch name, and statistics.
 *
 * @function makeBranch
 * @param {Object} branch - The branch object containing sub-branches and their values.
 * @param {string} name - The name of the branch.
 * @returns {HTMLElement} The tree item element representing the branch.
 */
function makeBranch(branch, name) {
   let treeItem = document.createElement('li')
   treeItem.classList.add('tree-item')

   let branchElement = document.createElement('details')
   branchElement.classList.add('branch')

   let branchSummary = document.createElement('summary')
   branchSummary.classList.add('branch-summary')

   let icon = document.createElement('i')
   icon.classList.add('icon')
   icon.setAttribute('data-lucide', 'chevron-right')

   branchSummary.appendChild(icon)

   let branchName = document.createElement('span')
   branchName.classList.add('branch-name')
   branchName.textContent = name
   branchSummary.appendChild(branchName)

   let statValue = document.createElement('span')
   statValue.classList.add('stat-value')
   statValue.textContent = `(${branch.total})`
   branchSummary.appendChild(statValue)

   branchElement.appendChild(branchSummary)

   let branchList = document.createElement('ul')
   branchList.classList.add('branch-list')

   for (let [key, value] of Object.entries(branch.values)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
         branchList.appendChild(makeBranch(value, `${key} `))
      } else {
         let treeItem = document.createElement('li')
         treeItem.classList.add('tree-item')
         treeItem.textContent = key

         let statValue = document.createElement('span')
         statValue.classList.add('stat-value')
         statValue.textContent = `(${value})`
         treeItem.appendChild(statValue)

         branchList.appendChild(treeItem)
      }
   }

   branchElement.appendChild(branchList)
   treeItem.appendChild(branchElement)

   return treeItem
}

/**
 * Resets the repository-related UI elements and data structures.
 *
 * This function hides the repository link, clears and disables branch and period selectors,
 * and resets the repository and statistics objects to their initial empty states.
 *
 * @function clearRepo
 */
function clearRepo() {
   repoLink.classList.add('hidden')
   repoLink.href = ''

   branchSelect.clear()
   branchSelect.clearOptions()
   branchSelect.disable()
   periodSelect.disable()

   repo = {
      name: '',
      period: '',
      defaultBranch: '',
      branches: [],
      contributors: [],
      issues: [],
      commits: [],
      pullRequests: []
   }

   stats = {}
}

/**
 * Toggles the enabled/disabled state of settings inputs.
 *
 * This function selects all input and select elements within elements with the class `setting`,
 * excluding the element with the ID `repo-input`. It then sets the `disabled` property of these elements
 * based on the `disable` parameter.
 *
 * @function toggleSettings
 * @param {boolean} disable - A boolean value indicating whether to disable (true) or enable (false) the settings inputs.
 */
function toggleSettings(disable) {
   let settingInputs = document.querySelectorAll(
      '.setting input:not(#repo-input), .setting select'
   )

   for (let settingInput of settingInputs) {
      settingInput.disabled = disable
   }
}

/**
 * Validates the repository name input and provides feedback on errors.
 *
 * This function checks the format of the repository name entered by the user. It validates both the username and repository name
 * according to specific rules, such as allowed characters and length. If any validation rules are violated, it displays error messages
 * and clears the repository data. If the input is valid, it hides any error messages.
 *
 * @function validateRepoName
 * @returns {string[]} An array of error messages, if any validation rules are violated.
 */
function validateRepoName() {
   try {
      let repoName = repoInput.value
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
         messages.push('Missing username')
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
         messages.push(
            'Missing repository or Missing / between username and repository'
         )
      }

      if (messages.length > 0) {
         repoError.innerText = messages.join(', ')

         repoError.classList.remove('hidden')

         clearRepo()
      } else {
         repoError.innerText = ''
         repoError.classList.add('hidden')
      }
      return messages
   } catch (error) {
      console.error(error)

      repoError.innerText = 'Unknown error'
      repoError.classList.remove('hidden')

      clearRepo()
   }
}

/**
 * Checks the existence of a GitHub repository and updates the UI accordingly.
 *
 * This asynchronous function sends a GET request to the GitHub API to verify if the repository specified in the `repoInput` exists.
 * If the repository exists, it updates the repository link, enables branch and period selectors, and fetches branch information.
 * If the repository does not exist or an error occurs, it displays an appropriate error message and resets the repository-related UI elements.
 *
 * @function checkRepoExistence
 */
async function checkRepoExistence() {
   try {
      let repoName = repoInput.value

      if (!repoError.classList.contains('hidden')) return

      let response = await apiQuery(`https://api.github.com/repos/${repoName}`)

      if (response.status === 200) {
         repoLink.classList.remove('hidden')
         repoLink.href = `https://github.com/${repoName}`

         repo.name = repoName
         repo.defaultBranch = response.data.default_branch

         branchSelect.enable()
         periodSelect.enable()

         getBranches()
         toggleSettings(false)
      } else {
         repoError.innerText = `Unexpected status code: ${response.status}`
         repoError.classList.remove('hidden')

         clearRepo()
         toggleSettings(true)
      }
   } catch (error) {
      if (error?.response?.status === 404) {
         repoError.innerText = 'Repository does not exist'
         repoError.classList.remove('hidden')

         clearRepo()
         toggleSettings(true)
      } else {
         console.error(error)

         repoError.innerText = 'Unknown error'
         repoError.classList.remove('hidden')

         clearRepo()
         toggleSettings(true)
      }
   }
}

/**
 * Fetches all branches of the specified GitHub repository and updates the branch list.
 *
 * This asynchronous function retrieves branches from the GitHub API in a paginated manner,
 * concatenating the results until no more branches are available. It then updates the repository's
 * branch list and calls `setBranches` to update the UI with the fetched branches.
 *
 * @function getBranches
 */
async function getBranches() {
   try {
      let branches = []
      let page = 1
      const perPage = 100

      do {
         try {
            let response = await apiQuery(
               `https://api.github.com/repos/${repo.name}/branches?per_page=${perPage}&page=${page}`
            )

            if (response.status === 200 && response.data.length > 0) {
               branches = branches.concat(response.data)
               page++
            } else {
               break
            }
         } catch (error) {
            console.error('Error fetching branches:', error)
            throw error
         }
      } while (true)

      repo.branches = branches.map((branch) => branch.name)

      setBranches()
   } catch (error) {}
}

/**
 * Populates the branch selector with the branches of the repository.
 *
 * This function iterates over the list of branches in the `repo` object and adds each branch as an option
 * to the `branchSelect` element. It also sets the default branch as the selected item in the selector.
 *
 * @function setBranches
 */
function setBranches() {
   for (let branch of repo.branches) {
      branchSelect.addOption({
         value: branch,
         text: branch
      })
   }

   branchSelect.addItem(repo.defaultBranch)
}

/**
 * Sets the theme of the application and updates the UI accordingly.
 *
 * This function saves the selected theme to local storage, updates the theme toggle state,
 * and applies the theme to the document. If the theme is being loaded for the first time,
 * it makes the body visible and sets a transition duration for smooth theme changes.
 *
 * @function setTheme
 * @param {string} theme - The theme to be applied ('light' or 'dark').
 */
function setTheme(theme) {
   localStorage.setItem('theme', theme)
   themeToggle.checked = theme === 'dark'

   if (theme === 'light') {
      githubLogo.src = './icons/github-mark.svg'
   } else if (theme === 'dark') {
      githubLogo.src = './icons/github-mark-white.svg'
   }

   document.documentElement.setAttribute('data-theme', theme)
}

async function checkAuth() {
   try {
      let urlParams = new URLSearchParams(window.location.search)
      urlParams = Object.fromEntries(urlParams.entries())

      let storageToken = localStorage.getItem('token')
      let queryToken = urlParams.token
      let user = {}
      let token = null

      if (queryToken) token = queryToken
      else if (storageToken) token = storageToken

      console.log(token)

      if (token) {
         user = await getUser(token)

         if (typeof user === 'string') {
            console.log(user)
            return
         }

         localStorage.setItem('token', token)

         currentUser.username = user.login
         currentUser.name = user.name
         currentUser.avatar = user.avatar_url
         currentUser.token = token

         loginButton.classList.toggle('hidden')

         avatar.src = currentUser.avatar
         avatar.title = currentUser.username

         usernameElement.textContent = currentUser.username

         githubLogo.classList.toggle('hidden')
         avatar.classList.toggle('hidden')
      }
   } catch (error) {
      console.log(error)
   }
}

async function getUser(token) {
   try {
      if (!token) return 'missing token'

      let response = await axios.get('https://api.github.com/user', {
         headers: {
            Authorization: `Bearer ${token}`
         }
      })

      return response.data
   } catch (error) {
      if (error?.response?.status === 401) {
         logout()

         return 'invalid token'
      } else {
         console.error(error)
      }
   }
}

function login() {
   window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
}

function logout() {
   localStorage.removeItem('token')

   currentUser = {
      username: '',
      name: '',
      avatar: '',
      token: ''
   }

   loginButton.classList.toggle('hidden')

   avatar.src = ''
   avatar.title = ''
   usernameElement.textContent = currentUser.username

   githubLogo.classList.toggle('hidden')
   avatar.classList.toggle('hidden')

   userDropdown.classList.add('hidden')

   avatar.title = ''
}

async function apiQuery(url, data, config) {
   if (currentUser.token) {
      if (!config) config = {}
      if (!config.headers) config.headers = {}

      config.headers.Authorization = `Bearer ${currentUser.token}`
   }

   return await axios.get(url, data, config)
}

function remToPx(rem) {
   return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

// Variables
let repo = {
   name: '',
   period: '',
   defaultBranch: '',
   branches: [],
   contributors: [],
   issues: [],
   commits: [],
   pullRequests: []
}
let stats = {}
let currentUser = {
   username: '',
   name: '',
   avatar: '',
   token: ''
}

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
const statsTree = document.getElementById('stats')
const repoLink = document.getElementById('repo-link')
const repoError = document.getElementById('repo-error')
const branchInput = document.getElementById('branch-input')
const navBar = document.getElementById('nav-bar')
const loginButton = document.getElementById('login-button')
const githubLogo = document.getElementById('github-logo')
const avatar = document.getElementById('avatar')
const userDropdown = document.getElementById('user-dropdown')
const logoutButton = document.getElementById('logout-button')
const usernameElement = document.getElementById('username')

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
   }
})

repoInput.addEventListener('input', () => {
   validateRepoName()
})

repoInput.addEventListener('blur', checkRepoExistence)

loginButton.addEventListener('click', login)

githubLogo.addEventListener('click', login)

avatar.addEventListener('click', () => {
   userDropdown.classList.toggle('hidden')
})

logoutButton.addEventListener('click', logout)

// Selects
let branchSelect = new TomSelect('#branch-input', {
   plugins: ['dropdown_input'],
   maxOptions: null,
   maxItems: 1
})

let periodSelect = new TomSelect('#period-input', {
   plugins: ['dropdown_input'],
   maxOptions: null,
   maxItems: 1
})

branchSelect.disable()
periodSelect.disable()

// Floating UI
FloatingUIDOM.autoUpdate(navBar, userDropdown, () => {
   FloatingUIDOM.computePosition(navBar, userDropdown, {
      placement: 'bottom-end',
      middleware: [
         FloatingUIDOM.offset({
            mainAxis: remToPx(0.25),
            crossAxis: remToPx(-0.5)
         })
      ]
   }).then(({ x, y }) => {
      Object.assign(userDropdown.style, { top: `${y}px`, left: `${x}px` })
   })
})

// Test
stats = {
   Issues: {
      total: 183,
      values: {
         Open: {
            total: 132,
            values: {
               ProfBrickz: 78,
               csmith1188: 51,
               Talon24229: 0
            }
         },
         Closed: {
            total: 51,
            values: {
               ProfBrickz: 30,
               csmith1188: 21,
               Talon24229: 0
            }
         },
         A: {
            total: 0,
            values: {
               ProfBrickz: 0,
               csmith1188: 0,
               Talon24229: 0
            }
         },
         All: {
            total: 183,
            values: {
               ProfBrickz: {
                  total: 108,
                  values: {
                     Open: 78,
                     Closed: 30
                  }
               },
               csmith1188: {
                  total: 72,
                  values: {
                     Open: 51,
                     Closed: 21
                  }
               },
               Talon24229: {
                  total: 0,
                  values: {
                     Open: 0,
                     Closed: 0
                  }
               }
            }
         },
         ALL: 183
      }
   },
   Commits: {
      total: 2731,
      values: {
         ProfBrickz: 1523,
         csmith1188: 1208,
         Talon24229: 0
      }
   },
   'Pull Requests': {
      total: 95,
      values: {
         ProfBrickz: 52,
         csmith1188: 43,
         Talon24229: 0
      }
   },
   a: {
      total: 0,
      values: {
         b: {
            total: 0,
            values: {
               c: {
                  total: 0,
                  values: {
                     d: {
                        total: 0,
                        values: {
                           e: 0
                        }
                     }
                  }
               }
            }
         }
      }
   }
}
updateTree()

// Load icons
lucide.createIcons()

checkAuth()

// Imports
/** @type {import('../node_modules/tom-select/dist/js/tom-select.complete.min.js')} */
const TomSelect = window['TomSelect'];
/** @type {import('../node_modules/@floating-ui/dom/dist/floating-ui.dom.d.ts')} */
const FloatingUIDOM = window['FloatingUIDOM'];
/** @type {import('../node_modules/lucide/dist/lucide.d.ts')} */
const lucide = window['lucide'];

// Types
/**
 * Represents the current user
 * @typedef {Object} CurrentUser
 * @property {string} username - The username of the current user
 * @property {string} name - The name of the current user
 * @property {string} avatar - The avatar URL of the current user
 * @property {string} token - The GitHub token of the current user
 */

/**
 * Represents a response from the GitHub API
 * @typedef {Object} APIResponse
 * @property {Headers} headers - The headers of the response
 * @property {boolean} ok - Indicates if the response was successful
 * @property {boolean} redirected - Indicates if the response was redirected
 * @property {number} status - The status code of the response
 * @property {string} statusText - The status message of the response
 * @property {string} type - The type of the response
 * @property {string} url - The URL of the response
 * @property {Object} data - The data of the response
 */

/**
 * Represents a GitHub repository
 * @typedef {Object} Repo
 * @property {string} name - The name of the repository
 * @property {string} period - The period for which the statistics are displayed
 * @property {string} defaultBranch - The default branch of the repository
 * @property {string[]} branches - An array of branch names
 * @property {Map<number, Contributor>} contributors - A map of contributors by ID
 * @property {Map<number, Issue>} issues - A map of issues by ID
 * @property {string[]} commits - An array of commits
 * @property {string[]} pullRequests - An array of pull requests
 * @property {Map<number, Label>} labels - A map of labels by ID
 */

/**
 * Represents a GitHub contributor
 * @typedef {Object} Contributor
 * @property {number} id - The contributor's ID
 * @property {string} username - The contributor's username
 */

/**
 * Represents a label
 * @typedef {Object} Label
 * @property {number} id - The label's ID
 * @property {string} name - The label's name
 * @property {string} description - The label's description
 * @property {string} color - The label's color
 */

/**
 * Represents a milestone
 * @typedef {Object} Milestone
 * @property {number} id - The milestone's ID
 * @property {string} title - The milestone's title
 * @property {string} description - The milestone's description
 * @property {string} state - The milestone's state
 * @property {string} creator - The milestone's creator
 * @property {string} openIssues - The milestone's open issues
 * @property {string} closedIssues - The milestone's closed issues
 * @property {string} createdOn - The milestone's creation date
 * @property {string} updatedOn - The milestone's last update date
 * @property {string} closedOn - The milestone's closure date
 * @property {string} dueOn - The milestone's due date
 */

/**
 * Represents a issue
 * @typedef {Object} Issue
 * @property {number} id - The issue's ID
 * @property {string} title - The issue's title
 * @property {string} body - The issue's body
 * @property {string} state - The issue's state
 * @property {string} author - The issue's author
 * @property {string[]} assignees - The issue's assignees
 * @property {Label[]} labels - The issue's labels
 * milestone
 * @property {boolean} locked - Whether the issue is locked or not
 * @property {string} createdOn - The issue's creation date
 * @property {string} updatedOn - The issue's last update date
 * @property {string} closedOn - The issue's closure date
 * @property {string} dueOn - The issue's due date
 */

// Constants
const MODE = 'dev';
const MODES = {
   production: {
      authenticationURL: 'http://129.80.106.196:3000/authenticate/production'
   },
   dev: {
      authenticationURL: 'http://129.80.106.196:3000/authenticate/dev'
   }
};

// functions
/**
 * Updates the DOM element representing a tree structure.
 *
 * This function clears the current content of the `tree` element and then iterates over the `stats` object.
 * For each entry in `stats`, it creates a new branch element using the `makeBranch` function and appends it to the `tree` element.
 *
 * @function updateTree
 *
 * @returns {void}
 */
function updateTree() {
   statsTree.innerHTML = '';

   for (let [name, branch] of Object.entries(stats)) {
      statsTree.appendChild(makeBranch(branch, name));
   }

   lucide.createIcons();
}

/**
 * Creates a tree structure for a branch and its sub-branches.
 *
 * This function generates a nested list item (`<li>`) representing a branch and its sub-branches.
 * It recursively processes each sub-branch and appends them to the main branch element.
 * The branch element includes a summary with an icon, branch name, and statistics.
 *
 * @function makeBranch
 *
 * @param {Object} branch - The branch object containing sub-branches and their values.
 * @param {string} name - The name of the branch.
 * @returns {HTMLElement} The tree item element representing the branch.
 */
function makeBranch(branch, name) {
   let treeItem = document.createElement('li');
   treeItem.classList.add('tree-item');

   let branchElement = document.createElement('details');
   branchElement.classList.add('branch');

   let branchSummary = document.createElement('summary');
   branchSummary.classList.add('branch-summary');

   let icon = document.createElement('i');
   icon.classList.add('icon');
   icon.setAttribute('data-lucide', 'chevron-right');

   branchSummary.appendChild(icon);

   let branchName = document.createElement('span');
   branchName.classList.add('branch-name');
   branchName.textContent = name;
   branchSummary.appendChild(branchName);

   let statValue = document.createElement('span');
   statValue.classList.add('stat-value');
   statValue.textContent = `(${branch.total})`;
   branchSummary.appendChild(statValue);

   branchElement.appendChild(branchSummary);

   let branchList = document.createElement('ul');
   branchList.classList.add('branch-list');

   for (let [key, value] of Object.entries(branch.values)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
         branchList.appendChild(makeBranch(value, `${key} `));
      } else {
         let treeItem = document.createElement('li');
         treeItem.classList.add('tree-item');
         treeItem.textContent = key;

         let statValue = document.createElement('span');
         statValue.classList.add('stat-value');
         statValue.textContent = `(${value})`;
         treeItem.appendChild(statValue);

         branchList.appendChild(treeItem);
      }
   }

   branchElement.appendChild(branchList);
   treeItem.appendChild(branchElement);

   return treeItem;
}

/**
 * Resets the repository-related UI elements and data structures.
 *
 * This function hides the repository link, clears and disables branch and period selectors,
 * and resets the repository and statistics objects to their initial empty states.
 *
 * @function clearRepo
 *
 * @returns {void}
 */
function clearRepo() {
   repoLink.classList.add('hidden');
   repoLink.href = '';

   branchSelect.clear();
   branchSelect.clearOptions();
   branchSelect.disable();
   periodSelect.disable();

   repo = {
      name: '',
      period: '',
      defaultBranch: '',
      branches: [],
      contributors: [],
      issues: new Map(),
      commits: [],
      pullRequests: [],
      labels: new Map()
   };

   stats = {};
}

/**
 * Toggles the enabled/disabled state of settings inputs.
 *
 * This function selects all input and select elements within elements with the class `setting`,
 * excluding the element with the ID `repo-input`. It then sets the `disabled` property of these elements
 * based on the `disable` parameter.
 *
 * @function toggleSettings
 *
 * @param {boolean} disable - A boolean value indicating whether to disable (true) or enable (false) the settings inputs.
 *
 * @returns {void}
 */
function toggleSettings(disable) {
   /**@type {NodeListOf<HTMLSelectElement>} */
   let settingInputs = document.querySelectorAll(
      '.setting input:not(#repo-input), .setting select'
   );

   for (let settingInput of settingInputs) {
      settingInput.disabled = disable;
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
 *
 * @returns {string[]|void} An array of validation error messages, if there are no errors.
 */
function validateRepoName() {
   try {
      let repoName = repoInput.value;
      let [username, repository] = repoName.split('/');

      let messages = [];

      // Username validation
      if (username) {
         if (/^-|-$/.test(username)) {
            messages.push('Username cannot begin or end with a hyphen');
         }
         if (!/^[a-zA-Z0-9-]+$/.test(username)) {
            messages.push('Username may only contain alphanumeric characters or single hyphens');
         }
         if (username.includes('--')) {
            messages.push('Username cannot contain consecutive hyphens');
         }
         if (username.length > 39) {
            messages.push('Username is too long (maximum is 39 characters)');
         }
      } else {
         messages.push('Missing username');
      }

      // Repository validation
      if (repository) {
         if (!/^[ -~]+$/.test(repository)) {
            messages.push('Repository name can only contain ASCII characters');
         }
         if (repository.length > 100) {
            messages.push('Repository name is too long (maximum is 100 characters)');
         }
      } else {
         messages.push('Missing repository or Missing / between username and repository');
      }

      if (messages.length > 0) {
         repoError.innerText = messages.join(', ');

         repoError.classList.remove('hidden');

         clearRepo();
      } else {
         repoError.innerText = '';
         repoError.classList.add('hidden');
      }

      return messages;
   } catch (error) {
      console.error(error);

      repoError.innerText = 'Unknown error';
      repoError.classList.remove('hidden');

      clearRepo();
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
 *
 * @returns {Promise<void>}
 */
async function checkRepoExistence() {
   try {
      let repoName = repoInput.value;

      if (!repoError.classList.contains('hidden')) return;

      let response = await apiQuery(`https://api.github.com/repos/${repoName}`);

      if (response.status === 200) {
         repoLink.classList.remove('hidden');
         repoLink.href = `https://github.com/${repoName}`;

         repo.name = repoName;
         repo.defaultBranch = response.data.default_branch;

         branchSelect.enable();
         periodSelect.enable();

         await getBranches();
         setBranches();

         await getLabels();
         await getIssues();

         getStats();

         toggleSettings(false);
      } else {
         repoError.innerText = `Unexpected status code: ${response.status}`;
         repoError.classList.remove('hidden');

         clearRepo();
         toggleSettings(true);
      }
   } catch (error) {
      if (error?.response?.status === 404) {
         repoError.innerText = 'Repository does not exist';
         repoError.classList.remove('hidden');

         clearRepo();
         toggleSettings(true);
      } else {
         console.error(error);

         repoError.innerText = 'Unknown error';
         repoError.classList.remove('hidden');

         clearRepo();
         toggleSettings(true);
      }
   }
}

/**
 * Fetches all branches of the specified GitHub repository and updates the branch list.
 *
 * This asynchronous function retrieves branches from the GitHub API using the paginatedApiQuery helper,
 * then updates the repository's branch list and calls `setBranches` to update the UI with the fetched branches.
 *
 * @function getBranches
 *
 * @returns {Promise<void>}
 */
async function getBranches() {
   try {
      const apiResponse = await paginatedApiQuery(`https://api.github.com/repos/${repo.name}/branches`, null);

      repo.branches = apiResponse.data.map(branch => branch.name);
   } catch (error) {
      console.error('Error fetching branches:', error);
   }
}

/**
 * Fetches all labels of the specified GitHub repository and updates the label list.
 *
 * This asynchronous function retrieves labels from the GitHub API in a paginated manner,
 * concatenating the results until no more labels are available. It then updates the repository's
 * label list and calls `setLabels` to update the UI with the fetched labels.
 *
 * @function getLabels
 *
 * @returns {Promise<void>}
 */
async function getLabels() {
   const apiResponse = await paginatedApiQuery(`https://api.github.com/repos/${repo.name}/labels`, null);

   repo.labels = new Map();

   for (let label of apiResponse.data) {
      repo.labels.set(label.id, {
         id: label.id,
         name: label.name,
         description: label.description,
         color: label.color
      });
   }
}

/**
 * Fetches all issues of the specified GitHub repository and updates the issue list.
 *
 * This asynchronous function retrieves issues from the GitHub API in a paginated manner,
 * concatenating the results until no more issues are available. It then updates the repository's
 * issue list and calls `setIssues` to update the UI with the fetched issues.
 *
 * @function getIssues
 *
 * @returns {Promise<void>}
 */
async function getIssues() {
   const apiResponse = await paginatedApiQuery(`https://api.github.com/repos/${repo.name}/issues`, {
      state: 'all'
   });

   repo.issues = new Map();

   for (let issue of apiResponse.data) {
      if (issue.pull_request) continue;

      repo.issues.set(issue.number, {
         id: issue.number,
         title: issue.title,
         body: issue.body,
         state: issue.state,
         author: issue.user.login,
         assignees: issue.assignees,
         labels: issue.labels,
         locked: issue.locked,
         createdOn: issue.created_at,
         updatedOn: issue.updated_at,
         closedOn: issue.closed_at,
         dueOn: issue.due_on
      });
   }
}

/**
 * Populates the branch selector with the branches of the repository.
 *
 * This function iterates over the list of branches in the `repo` object and adds each branch as an option
 * to the `branchSelect` element. It also sets the default branch as the selected item in the selector.
 *
 * @function setBranches
 *
 * @returns {void}
 */
function setBranches() {
   for (let branch of repo.branches) {
      branchSelect.addOption({
         value: branch,
         text: branch
      });
   }

   branchSelect.addItem(repo.defaultBranch);
}

/**
 * Sets the theme of the application and updates the UI accordingly.
 *
 * This function saves the selected theme to local storage, updates the theme toggle state,
 * and applies the theme to the document. If the theme is being loaded for the first time,
 * it makes the body visible and sets a transition duration for smooth theme changes.
 *
 * @function setTheme
 *
 * @param {'light' | 'dark'} theme - The theme to be applied ('light' or 'dark').
 * @returns {void}
 */
function setTheme(theme) {
   localStorage.setItem('theme', theme);
   themeToggle.checked = theme === 'dark';

   if (theme === 'light') {
      githubLogo.src = './icons/github-mark.svg';
   } else if (theme === 'dark') {
      githubLogo.src = './icons/github-mark-white.svg';
   }

   document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Checks the authentication status of the user and updates the UI accordingly.
 *
 * This asynchronous function checks if the user is authenticated by retrieving the user information from the GitHub API.
 * If the user is authenticated, it updates the current user object, sets the login button to hidden, and displays the user avatar.
 * If the user is not authenticated, it logs the user out and displays the login button.
 *
 * @function checkAuth
 *
 * @returns {Promise<void>}
 */
async function checkAuth() {
   try {
      let urlParams = new URLSearchParams(window.location.search);

      let storageToken = localStorage.getItem('token');
      let queryToken = urlParams.get('token');

      let user = {};
      let token = null;

      if (queryToken) token = queryToken;
      else if (storageToken) token = storageToken;

      if (token) {
         user = await getUser(token);

         if (typeof user === 'string') {
            console.error(user);
            return;
         }

         localStorage.setItem('token', token);

         currentUser.username = user.login;
         currentUser.name = user.name;
         currentUser.avatar = user.avatar_url;
         currentUser.token = token;

         loginButton.classList.toggle('hidden');

         avatar.src = currentUser.avatar;
         avatar.title = currentUser.username;

         usernameElement.textContent = currentUser.username;

         githubLogo.classList.toggle('hidden');
         avatar.classList.toggle('hidden');
      }
   } catch (error) {
      console.error(error);
   }
}

/**
 * Retrieves the user information from the GitHub API.
 *
 * This asynchronous function sends a GET request to the GitHub API to retrieve the user information.
 * If the user is authenticated, it returns the user object. If the user is not authenticated,
 * it logs the user out and returns an error message.
 *
 * @function getUser
 *
 * @param {string} token - The user's GitHub token.
 * @returns {Promise<Object | string>} The user object or an error message.
 */
async function getUser(token) {
   try {
      if (!token) return 'missing token';

      let response = await apiQuery('https://api.github.com/user', null, {
         headers: {
            Authorization: `Bearer ${token}`
         }
      });

      return response.data;
   } catch (error) {
      if (error?.response?.status === 401) {
         logout();

         return 'invalid token';
      } else {
         console.error(error);
      }
   }
}

/**
 * Logs the user in by redirecting to the GitHub OAuth login page.
 *
 * @function login
 *
 * @returns {void}
 */
function login() {
   let params = new URLSearchParams({
      redirect_uri: MODES[MODE].authenticationURL,
      scope: 'repo'
   });

   window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Logs the user out by removing the token from local storage,
 * resetting the current user object, and updating the UI.
 *
 * @function logout
 *
 * @returns {void}
 */
function logout() {
   localStorage.removeItem('token');

   currentUser = {
      username: '',
      name: '',
      avatar: '',
      token: ''
   };

   loginButton.classList.toggle('hidden');

   avatar.src = '';
   avatar.title = '';
   usernameElement.textContent = currentUser.username;

   githubLogo.classList.toggle('hidden');
   avatar.classList.toggle('hidden');

   userDropdown.classList.add('hidden');

   avatar.title = '';
}

/**
 * Sends a query to the GitHub API and returns the response.
 *
 * @function apiQuery
 *
 * @param {string} url - The URL of the API endpoint.
 * @param {object} [params] - The URLSearchParams object for the fetch request.
 * @param {object} [options] - The options object for the fetch request.
 * @returns {Promise<APIResponse>} The response from the API.
 */
async function apiQuery(url, params, options = {}) {
   if (currentUser.token) {
      if (!options.headers) options.headers = {};

      options.headers.Authorization = `Bearer ${currentUser.token}`;
   }

   const urlObject = new URL(url);
   if (params) urlObject.search = new URLSearchParams(params).toString();

   url = urlObject.toString();

   let response = await fetch(url, options);
   let data = await response.json();

   /** @type {APIResponse} */
   let responseData = {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      data: data
   };

   return responseData;
}

/**
 * Sends a paginated query to the GitHub API and returns the combined results.
 *
 * @function paginatedApiQuery
 *
 * @param {string} url - The URL of the API endpoint.
 * @param {object} [params] - The parameters for the request.
 * @param {object} [options] - The options for the fetch request.
 * @returns {Promise<APIResponse>} The combined response from all pages.
 */
async function paginatedApiQuery(url, params, options = {}) {
   let page = 1;
   const perPage = 100;
   let allData = [];
   let lastResponse = null;

   // Set up authorization if available
   if (currentUser.token) {
      options.headers = options.headers || {};
      options.headers.Authorization = `Bearer ${currentUser.token}`;
   }

   // Prepare URL with parameters
   const urlObject = new URL(url);
   const searchParams = new URLSearchParams(params);
   searchParams.set('per_page', String(perPage));

   // Fetch all pages
   do {
      searchParams.set('page', String(page));
      urlObject.search = searchParams.toString();

      lastResponse = await fetch(urlObject.toString(), options);
      const pageData = await lastResponse.json();
      allData = allData.concat(pageData);

      // Check if we've reached the last page
      const linkHeader = lastResponse.headers.get('Link');
      if (!linkHeader || !linkHeader.includes('rel="next"')) {
         break;
      }

      page++;
   } while (true);

   // Return combined response data with metadata from the last response
   return {
      headers: lastResponse.headers,
      ok: lastResponse.ok,
      redirected: lastResponse.redirected,
      status: lastResponse.status,
      statusText: lastResponse.statusText,
      type: lastResponse.type,
      url: lastResponse.url,
      data: allData
   };
}


function getIssueStats() {
   // Initialize the main stats structure
   const issues = stats.Issues = {
      total: repo.issues.size,
      values: {
         'Open issues by user': { total: 0, values: {} },
         'Closed issues by user': { total: 0, values: {} },
         'Issues closed by contributor': { total: 0, values: {} },
         Labels: { values: {} },
         All: { total: 0, values: {} }
      }
   };

   // Initialize labels
   for (const label of repo.labels.values()) {
      issues.values.Labels.values[label.name] = {
         total: 0,
         values: {}
      };
   }

   for (const issue of repo.issues.values()) {
   }
}

function getStats() {
   stats = {
      Issues: {}
   };

   getIssueStats();

   updateTree();
}

/**
 * Converts a value in REM units to pixels.
 *
 * @function remToPx
 *
 * @param {number} rem - The value in REM units.
 * @returns {number} The value in pixels.
 */
function remToPx(rem) {
   return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// Variables
/** @type {Repo} */
let repo = {
   name: '',
   period: '',
   defaultBranch: '',
   branches: [],
   contributors: new Map(),
   issues: new Map(),
   commits: [],
   pullRequests: [],
   labels: new Map()
};
let stats = {};
/** @type {CurrentUser} */
let currentUser = {
   username: '',
   name: '',
   avatar: '',
   token: ''
};

// HTML elements
const themeToggle = /**@type {HTMLInputElement} */ (document.getElementById('theme-toggle-checkbox'));
const repoInput = /**@type {HTMLInputElement} */ (document.getElementById('repo-input'));
const repoPeriod = /**@type {HTMLSelectElement} */ (document.getElementById('period-input'));
const statsTree = /**@type {HTMLDivElement} */ (document.getElementById('stats'));
const repoLink = /**@type {HTMLAnchorElement} */ (document.getElementById('repo-link'));
const repoError = /**@type {HTMLDivElement} */ (document.getElementById('repo-error'));
const branchInput = /**@type {HTMLSelectElement} */ (document.getElementById('branch-input'));
const navBar = /**@type {HTMLDivElement} */ (document.getElementById('nav-bar'));
const loginButton = /**@type {HTMLButtonElement} */ (document.getElementById('login-button'));
const githubLogo = /**@type {HTMLImageElement} */ (document.getElementById('github-logo'));
const avatar = /**@type {HTMLImageElement} */ (document.getElementById('avatar'));
const userDropdown = /**@type {HTMLDivElement} */ (document.getElementById('user-dropdown'));
const logoutButton = /**@type {HTMLButtonElement} */ (document.getElementById('logout-button'));
const usernameElement = /**@type {HTMLInputElement} */ (document.getElementById('username'));

// Load theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || savedTheme === 'light') {
   setTheme(savedTheme);
} else {
   if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
   else setTheme('light');
}

// Event listeners
themeToggle.addEventListener('change', () => {
   if (themeToggle.checked) setTheme('dark');
   else setTheme('light');
});

repoInput.addEventListener('keydown', (event) => {
   if (event.key === 'Enter') {
      checkRepoExistence();

      repoInput.blur();
   }
});

repoInput.addEventListener('input', () => {
   validateRepoName();
});

repoInput.addEventListener('blur', checkRepoExistence);

loginButton.addEventListener('click', login);

githubLogo.addEventListener('click', login);

avatar.addEventListener('click', () => {
   userDropdown.classList.toggle('hidden');
});

logoutButton.addEventListener('click', logout);

// Selects
let branchSelect = new TomSelect('#branch-input', {
   plugins: ['dropdown_input'],
   maxOptions: null,
   maxItems: 1
});

let periodSelect = new TomSelect('#period-input', {
   plugins: ['dropdown_input'],
   maxOptions: null,
   maxItems: 1
});

branchSelect.disable();
periodSelect.disable();

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
      Object.assign(userDropdown.style, { top: `${y}px`, left: `${x}px` });
   });
});

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
};
updateTree();

checkAuth();

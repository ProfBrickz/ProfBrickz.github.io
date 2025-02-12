// Imports
import fs from 'fs';
import cors from 'cors';
import express from 'express';

// Load settings from settings.json
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

// Initialize Express app
let app = express();

// Enable CORS
app.use(cors());

// Define authentication route
app.get(
   '/authenticate/:mode',
   cors({
      origin: [
         settings.dev.authenticationURL,
         settings.production.authenticationURL
      ],
      methods: ['POST'],
      credentials: true
   }),
   async (request, response) => {
      try {
         // Determine mode (default to 'production')
         let mode = request.params.mode || 'production';

         // Handle error query parameter
         if (request.query.error) {
            response.redirect(
               `${settings[mode].redirectURL}?error=${request.query.error}`
            );
            return;
         }

         // Extract code query parameter
         /** @type {string} */
         let code;
         if (typeof request.query.code === 'string') {
            code = request.query.code;
         } else {
            code = '';
         }

         // Prepare parameters for GitHub OAuth
         const params = new URLSearchParams({
            client_id: settings[mode].clientId,
            client_secret: settings[mode].clientSecret,
            code: code,
            redirect_uri: settings[mode].authenticationURL
         }).toString();

         // Request access token from GitHub
         let authenticationResponse = await fetch(
            `https://github.com/login/oauth/access_token?${params}`,
            {
               method: 'POST',
               headers: {
                  Accept: 'application/json'
               }
            }
         );

         // Parse authentication response
         let authentication = await authenticationResponse.json();

         // Handle authentication error
         if (authentication.error) {
            let params = new URLSearchParams(authentication);

            response.redirect(
               `${settings[mode].redirectURL}?error=${params.toString()}`
            );
            return;
         }

         // Redirect with access token
         response.redirect(
            `${settings[mode].redirectURL}?token=${authentication.access_token}`
         );
      } catch (error) {
         // Handle unexpected errors
         let mode = request.params.mode || 'production';

         response.redirect(
            `${settings[mode].redirectURL}?error=${error.message}`
         );
      }
   }
);

// Start the server
app.listen(settings.port, () => {
   console.log(`Listening on port ${settings.port}`);
});

// Imports
import fs from 'fs'
import cors from 'cors'
import express from 'express'

// Settings
const settings = JSON.parse(fs.readFileSync('settings.json'))

// Express
let app = express()

app.use(cors())

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
         let mode = request.params.mode || 'production'

         if (request.query.error) {
            response.redirect(
               `${settings[mode].redirectURL}?error=${request.query.error}`
            )
            return
         }

         let code = request.query.code

         const params = new URLSearchParams({
            client_id: settings[mode].clientId,
            client_secret: settings[mode].clientSecret,
            code: code,
            redirect_uri: settings[mode].authenticationURL
         }).toString()

         let authenticationResponse = await fetch(
            `https://github.com/login/oauth/access_token?${params}`,
            {
               method: 'POST',
               headers: {
                  Accept: 'application/json'
               }
            }
         )

         let authentication = await authenticationResponse.json()

         if (authentication.error) {
            let params = new URLSearchParams(authentication)

            response.redirect(
               `${settings[mode].redirectURL}?error=${params.toString()}`
            )
            return
         }

         response.redirect(
            `${settings[mode].redirectURL}?token=${authentication.access_token}`
         )
      } catch (error) {
         let mode = request.params.mode || 'production'

         response.redirect(
            `${settings[mode].redirectURL}?error=${error.message}`
         )
      }
   }
)

app.listen(settings.port, () => {
   console.log(`Listening on port ${settings.port}`)
})

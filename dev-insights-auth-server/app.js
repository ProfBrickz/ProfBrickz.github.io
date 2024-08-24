// Imports
import fs from 'fs'
import axios from 'axios'
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
         console.log(request.params)

         let mode = request.params.mode || 'production'

         if (request.query.error) {
            response.redirect(
               `${settings[mode].redirectURL}?error=${request.query.error}`
            )
            return
         }

         let code = request.query.code

         console.log(mode, settings[mode], code)

         let authenticate = await axios.post(
            'https://github.com/login/oauth/access_token',
            {},
            {
               params: {
                  client_id: settings[mode].clientId,
                  client_secret: settings[mode].clientSecret,
                  code: code,
                  redirect_uri: settings[mode].authenticationURL
               },
               headers: {
                  Accept: 'application/json'
               }
            }
         )

         console.log(authenticate.data)

         response.redirect(
            `${settings[mode].redirectURL}?token=${authenticate.data.access_token}`
         )
      } catch (error) {
         response.redirect(
            `${settings[mode].redirectURL}?error=${error.message}`
         )
      }
   }
)

app.listen(settings.port, () => {
   console.log(`Listening on port ${settings.port}`)
})

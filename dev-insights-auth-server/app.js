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
   '/authenticate',
   // cors({
   //    origin: settings.redirectUri,
   //    methods: ['POST'],
   //    credentials: true
   // }),
   async (request, response) => {
      try {
         if (request.query.error) {
            response.redirect(
               `${settings.redirectURL}?error=${request.query.error}`
            )
            return
         }

         let code = request.query.code

         let authenticate = await axios.post(
            'https://github.com/login/oauth/access_token',
            {},
            {
               params: {
                  client_id: settings.clientId,
                  client_secret: settings.clientSecret,
                  code: code,
                  redirect_uri: settings.redirectURI
               },
               headers: {
                  Accept: 'application/json'
               }
            }
         )

         response.redirect(
            `${settings.redirectURL}?token=${authenticate.data.access_token}`
         )
      } catch (error) {
         response.redirect(`${settings.redirectURL}?error=${error.message}`)
      }
   }
)

app.listen(settings.port, () => {
   console.log(`Listening on port ${settings.port}`)
})

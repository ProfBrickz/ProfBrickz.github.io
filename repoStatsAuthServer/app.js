// Imports
import fs from 'fs'
import axios from 'axios'
import cors from 'cors'
import express, { query } from 'express'

// Settings
const settings = JSON.parse(fs.readFileSync('settings.json'))

// Express
let app = express()

app.use(cors())

app.post(
   '/authenticate',
   // cors({
   //    origin: settings.redirectUri,
   //    methods: ['POST'],
   //    credentials: true
   // }),
   async (request, response) => {
      try {
         let code = request.query.code

         if (!code) {
            response.status(400).send('Missing code')
            return
         }

         let authenticate = await axios.post(
            'https://github.com/login/oauth/access_token',
            {},
            {
               params: {
                  client_id: settings.clientId,
                  client_secret: settings.clientSecret,
                  code: code,
                  redirect_uri: settings.redirectUri
               },
               headers: {
                  Accept: 'application/json'
               }
            }
         )

         console.log(authenticate.data)

         response.send({ token: authenticate.data.access_token })
      } catch (error) {
         response.status(500).send(error)
      }
   }
)

app.listen(settings.port, () => {
   console.log(`Listening on port ${settings.port}`)
})

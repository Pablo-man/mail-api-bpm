import {Router} from 'express'
import {sendEmail} from '../controllers/mail.controllers.js'

const router = Router()

router.post('/enviar-correo', sendEmail)

export default router
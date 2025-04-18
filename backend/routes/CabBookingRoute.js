import {Router} from 'express'
const CabBookingRouter = Router()
import { AccessRole, protect } from '../middleware/authMiddleware.js'
import { Create, GetAllCabBookingByCab, GetAllCabBookingByUser, GetCabBookingById, GetCabBookingsByCabId, Update, UpdateStatus } from '../controllers/CabBookingController.js'
import { GetAllBookingByHotelId } from '../controllers/BookingController.js'

CabBookingRouter.post('/create',protect,Create)
CabBookingRouter.get('/:id',protect,AccessRole(['cab','admin']),GetCabBookingById)
CabBookingRouter.get('/cab/:id',protect,AccessRole(['cab','admin']),GetAllCabBookingByCab)
CabBookingRouter.get('/cabBook/:id',protect,GetCabBookingsByCabId)
CabBookingRouter.put('/update/:id',protect,AccessRole(['admin','cab','user']),Update)
CabBookingRouter.put('/update/status/:id',protect,AccessRole(['admin','cab']),UpdateStatus)
CabBookingRouter.get('/user/:id',protect,AccessRole(['user']),GetAllCabBookingByUser)


export default CabBookingRouter
import {Router} from 'express';
import { AccessRole, admin, protect } from '../middleware/authMiddleware.js';
import { Create, GetAllBooking, GetAllBookingByHotelId,  GetAllBookingByuserId,  GetBookingById, Update, UpdateStatus }  from '../controllers/BookingController.js';
const BookingRouter = Router();


BookingRouter.get('/:id',protect,GetBookingById);
// BookingRouter.get('/user/:id',protect,GetAllBookingById);
BookingRouter.get('/hotel/:id',protect,GetAllBookingByHotelId);
BookingRouter.get('/user/:id',protect,GetAllBookingByuserId);
BookingRouter.get('/hotels',GetAllBooking);
BookingRouter.post('/create',protect,Create);
BookingRouter.put('/user/:id',protect,Update);
BookingRouter.put('/status/:id',protect,AccessRole(['admin','hotel']),UpdateStatus);


export default BookingRouter;
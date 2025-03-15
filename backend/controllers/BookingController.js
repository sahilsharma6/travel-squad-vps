import Booking from "../models/booking.js";
import CabBooking from "../models/cabBookingModel.js";
import Hotel from "../models/hotelModel.js";

export async function Create(req, res) {
    try {
        const { hotel, roomCount } = req.body;
        const getHotel = await Hotel.findById(hotel)
        if (!getHotel) return res.status(404).json({ success: false, message: "Hotel Not Found" })

        const booking = new Booking({
            user: req.user._id,
            hotel,
            roomCount,
            ammount: roomCount * getHotel.price,
        });
        getHotel.NumberofRooms = getHotel.NumberofRooms - roomCount
        await getHotel.save()
        await booking.save()
        res.status(200).json({ success: true, message: booking })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }

}

export async function GetBookingById(req, res) {
    try {
        const { id } = req.params;
        const getBooking = await Booking.findOne({ _id: id, user: req.user._id })
        res.json(getBooking)
    } catch (error) {

        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export async function UpdateStatus(req, res) {
    try {
        const { id } = req.params
        console.log(id)
        const { status } = req.body;
        console.log(status)
        if (!status) return res.status(404).json({ success: false, message: "Status is requierd" })
        const isUpdated = await Booking.findByIdAndUpdate(id, { status })
        if (!isUpdated) return res.status(304).json({ success: false, message: "Not updated status" })
        res.status(200).json({ success: true, message: isUpdated })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}


export async function Update(req, res) {
    try {
        const { id } = req.params
        const { bookingDate, roomCount, hotelid, userId } = req.body;
        if (!bookingDate || !roomCount) return res.status(404).json({ success: false, message: "All fields are requierd" })
        const getHotel = await Hotel.findById(hotelid);
        if (!getHotel) return res.status(404).json({ success: false, message: "Hotel Not Found" })
        const isUpdated = await Booking.findOne({ _id: id, user: userId })
        if (!isUpdated) return res.status(304).json({ success: false, message: "Not updated" })
        isUpdated.bookingDate = bookingDate
        isUpdated.ammount = roomCount * getHotel.price
        isUpdated.roomCount = roomCount
        if (roomCount > isUpdated.roomCount) {
            getHotel.NumberofRooms = getHotel.NumberofRooms - (roomCount - isUpdated.roomCount)
            await getHotel.save()
        }
        else {
            getHotel.NumberofRooms = getHotel.NumberofRooms + (isUpdated.roomCount - roomCount)
            await getHotel.save()
        }
        await isUpdated.save()

        res.status(200).json({ success: true, message: isUpdated })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export async function GetAllBookingUser(req, res) {
    try {
        const getBooking = await Booking.find({ user: req.user._id })
        res.json(getBooking)
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
export async function GetAllBookingByuserId(req, res) {
    try {
        const id = req.params.id; // Extract user ID from request parameters

        // Fetch both hotel and cab bookings
        const hotelBookings = await Booking.find({ user: id });
        const cabBookings = await CabBooking.find({ user: id });

        // If no bookings are found, return a specific message
        if (hotelBookings.length === 0 && cabBookings.length === 0) {
            return res.status(404).json({ success: false, message: "No bookings found for this user" });
        }

        res.json({
            success: true,
            hotelBookings,
            cabBookings
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


export async function GetAllBooking(req, res) {
    try {
        const getBooking = await Booking.find()
        res.json(getBooking)
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export  async function GetAllBookingByHotelId(req,res){
    try {
        const {id}=req.params
        const bookings=await Booking.find({hotel:id})
        if(bookings.length>0){
            res.status(200).json(bookings)
        }
        else res.status(400).json({ success: false, message: "Not Found" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
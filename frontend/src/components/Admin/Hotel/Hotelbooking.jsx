import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hotel, setHotel] = useState(null);
  
  // Backend URL - replace with your actual backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/users/profile`, {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        console.error("User not authenticated", error);
        setUser(null);
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [backendUrl]);

  // Fetch hotel data if user exists
  useEffect(() => {
    const fetchHotel = async () => {
      if (!user?._id) return;
      
      try {
        const response = await axios.get(`${backendUrl}/api/hotel/user/${user._id}`, {
          withCredentials: true,
        });
        
        const hotelData = response.data;
        if (hotelData) {
          setHotel(hotelData);
        }
      } catch (error) {
        console.error("Failed to fetch hotel data", error);
        setError("Failed to fetch hotel data. Please try again later.");
      }
    };
    
    if (user) {
      fetchHotel();
    }
  }, [user, backendUrl]);

  // Fetch bookings when hotel is loaded
  useEffect(() => {
    const fetchBookings = async () => {
      if (!hotel?._id) return;
      
      try {
        const response = await axios.get(`${backendUrl}/api/booking/hotel/${hotel._id}`, {
          withCredentials: true,
        });
        console.log(response)
        // Transform the booking data to match the expected format
        const formattedBookings = response.data.map(booking => {
          // Format dates from ISO to DD/MM/YYYY HH:MM
          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          };
          
          return {
            id: booking._id,
            guestName: booking.user ? booking.user.name || "Guest" : "Guest", // Assuming user object has name
            roomType: "Room", // This would need to be fetched from room data
            roomNumber: booking.roomCount ? `${booking.roomCount} rooms` : "N/A",
            checkInDate: booking.checkInDate ? formatDate(booking.checkInDate) : "N/A",
            checkOutDate: booking.checkOutDate ? formatDate(booking.checkOutDate) : "N/A",
            totalPrice: `₹ ${booking.ammount ? booking.ammount.toFixed(2) : "0.00"}`,
            status: booking.status || "Pending",
            createdAt: formatDate(booking.createdAt)
          };
        });
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        setError("Failed to fetch bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (hotel) {
      fetchBookings();
    }
  }, [hotel, backendUrl]);

  // Filtered bookings
  const filteredBookings = bookings
    .filter((booking) => 
      booking.id.includes(searchTerm) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.roomNumber && booking.roomNumber.includes(searchTerm))
    )
    .filter((booking) => 
      statusFilter === 'All Statuses' || booking.status === statusFilter
    )
    .sort((a, b) => {
      // Parse dates for comparison
      const dateA = new Date(a.createdAt.split(' ')[0].split('/').reverse().join('-') + ' ' + a.createdAt.split(' ')[1]);
      const dateB = new Date(b.createdAt.split(' ')[0].split('/').reverse().join('-') + ' ' + b.createdAt.split(' ')[1]);
      
      return sortOrder === 'Newest First' 
        ? dateB - dateA
        : dateA - dateB;
    });

  if (loading) {
    return <div className="p-6 ml-14">Loading bookings data...</div>;
  }

  if (error) {
    return <div className="p-6 ml-14 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 ml-14">
      <h1 className="text-2xl font-bold mb-6">Bookings Management</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by ID, guest name, or room number"
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded-md p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Cancelled</option>
        </select>

        <select
          className="border border-gray-300 rounded-md p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
        </select>
      </div>

      <p className="text-gray-500 mb-4">Showing {filteredBookings.length} bookings</p>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              <th className="py-3 px-4 font-medium">Booking ID</th>
              <th className="py-3 px-4 font-medium">Guest Name</th>
              <th className="py-3 px-4 font-medium">Room</th>
              <th className="py-3 px-4 font-medium">Check-in Date</th>
              <th className="py-3 px-4 font-medium">Check-out Date</th>
              <th className="py-3 px-4 font-medium">Total Price</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Created At</th>
              {/* <th className="py-3 px-4 font-medium">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="py-3 px-4">{booking.id}</td>
                  <td className="py-3 px-4">{booking.guestName}</td>
                  <td className="py-3 px-4">{booking.roomNumber}</td>
                  <td className="py-3 px-4">{booking.checkInDate}</td>
                  <td className="py-3 px-4">{booking.checkOutDate}</td>
                  <td className="py-3 px-4">{booking.totalPrice}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{booking.createdAt}</td>
                  {/* <td className="py-3 px-4">
                    <button className="text-blue-500 hover:text-blue-700 mr-2">
                      View
                    </button>
                    {booking.status === 'Pending' && (
                      <>
                        <button className="text-green-500 hover:text-green-700 mr-2">
                          Confirm
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          Cancel
                        </button>
                      </>
                    )}
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingDashboard;
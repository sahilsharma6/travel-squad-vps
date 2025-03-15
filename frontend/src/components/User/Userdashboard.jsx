import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CalendarDays, 
  User, 
  Edit, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  CreditCard, 
  Loader2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Set up axios defaults
axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const UserDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("bookings");
  
  // State for user data
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // State for bookings data
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  // State for selected booking and modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Properly declare userId state
  const [userId, setUserId] = useState("");
  
  // State for editing user profile
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // Fetch bookings data AFTER we have the user ID
  useEffect(() => {
    if (userId) {
      fetchBookingsData();
    }
  }, [userId]); // This dependency ensures bookings are fetched when userId changes
  
  const fetchUserData = async () => {
    setUserLoading(true);
    setUserError(null);
    
    try {
      const response = await axios.get('/users/profile');
      
      // Process the user data to match expected format
      const userData = {
        id: response.data._id,
        name: `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email,
        isAdmin: response.data.isAdmin,
        role: response.data.role,
        avatar: '/api/placeholder/150/150', // Placeholder since backend doesn't provide avatar
        memberSince: 'March 2023' // Placeholder since backend doesn't provide join date
      };
      
      // Set the user ID for bookings
      setUserId(userData.id);
      setUser(userData);
      setEditedUser(userData); // Initialize edited user with fetched user data
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserError(error.response?.data?.message || error.message);
      
      // Fallback to sample data in case of error
      const fallbackUser = {
        id: '123456',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 123-4567',
        avatar: '/api/placeholder/150/150',
        memberSince: 'March 2023'
      };
      
      setUserId(fallbackUser.id);
      setUser(fallbackUser);
      setEditedUser(fallbackUser);
    } finally {
      setUserLoading(false);
    }
  };
  
  const fetchBookingsData = async () => {
    setBookingsLoading(true);
    setBookingsError(null);

    try {
        const response = await axios.get(`/booking/user/${userId}`);
        const { hotelBookings = [], cabBookings = [] } = response.data;

        // Transform hotel bookings
        const transformedHotelBookings = hotelBookings.map(booking => ({
            id: booking._id,
            service: `Room Booking (${booking.roomCount} ${booking.roomCount > 1 ? 'rooms' : 'room'})`,
            date: booking.bookingDate ? booking.bookingDate.split('T')[0] : "Unknown Date",
            time: booking.time || "N/A",
            status: booking.status,
            location: "Hotel Property",
            provider: "Hotel Name",
            price: `$${(booking.ammount / 100).toFixed(2)}`,
            duration: "Check hotel policy",
            notes: `Booking created on ${booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "Unknown"}`
        }));

        // Transform cab bookings
        const transformedCabBookings = cabBookings.map(booking => ({
            id: booking._id,
            service: `Cab Booking (${booking.vehicleType || "Cab"})`,
            date: booking.bookingDate ? booking.bookingDate.split('T')[0] : "Unknown Date",
            time: booking.time || "N/A",
            status: booking.status,
            location: booking.pickupLocation || "Pickup Location Unknown",
            provider: booking.cabProvider || "Cab Company",
            price: `$${(booking.ammount / 100).toFixed(2)}`,
            duration: `${booking.rideDuration || "Varies"} mins`,
            notes: `Booking created on ${booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "Unknown"}`
        }));

        setBookings([...transformedHotelBookings, ...transformedCabBookings]);
    } catch (error) {
        console.error("Failed to fetch bookings data:", error);
        setBookingsError(error.response?.data?.message || "An error occurred while fetching bookings.");
    } finally {
        setBookingsLoading(false);
    }
};

  
  const updateUserProfile = async () => {
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    
    try {
      // Parse first and last name from full name
      const nameParts = editedUser.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Format data for the backend
      const userData = {
        firstName,
        lastName,
        email: editedUser.email
      };
      
      const response = await axios.put('/users/profile', userData);
      
      // Update local user state with response data
      const updatedUserData = {
        id: response.data._id,
        name: `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email,
        isAdmin: response.data.isAdmin,
        role: response.data.role,
        avatar: user.avatar, // Keep existing avatar
        memberSince: user.memberSince // Keep existing join date
      };
      
      setUser(updatedUserData);
      setUserId(updatedUserData.id);
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to update user data:", error);
      setUpdateError(error.response?.data?.message || error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await axios.post(`/bookings/${bookingId}/${action}`);
      
      // Refresh bookings after action
      fetchBookingsData();
      setBookingModalOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
      // Handle error appropriately
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedUser({...user});
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    updateUserProfile();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  // Helper function to get action button text based on booking status
  const getActionButtonText = (status) => {
    switch(status) {
      case 'Pending': return 'Confirm Booking';
      case 'Confirmed': return 'Reschedule';
      case 'Cancelled': return 'View History';
      default: return 'View Details';
    }
  };

  // Helper function to get action based on booking status
  const getBookingAction = (status) => {
    switch(status) {
      case 'Pending': return 'confirm';
      case 'Confirmed': return 'reschedule';
      case 'Cancelled': return 'history';
      default: return '';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* <h1 className="text-3xl font-bold mb-6">User Dashboard</h1> */}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full space-y-2">
                <button 
                  onClick={() => handleTabChange("bookings")} 
                  className={`flex items-center w-full justify-start py-3 px-4 text-left border rounded-md ${
                    activeTab === "bookings" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-secondary"
                  }`}
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  My Bookings
                </button>
                <button 
                  onClick={() => handleTabChange("profile")} 
                  className={`flex items-center w-full justify-start py-3 px-4 text-left border rounded-md ${
                    activeTab === "profile" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-secondary"
                  }`}
                >
                  <User className="mr-2 h-5 w-5" />
                  My Profile
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View all your past and upcoming appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading bookings...</span>
                  </div>
                ) : bookingsError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Error loading bookings: {bookingsError}
                    </AlertDescription>
                  </Alert>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">You don't have any bookings yet.</p>
                    <Button className="mt-4">Create New Booking</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.service}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleBookingClick(booking)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => fetchBookingsData()}>Refresh Bookings</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>View and update your personal information.</CardDescription>
                  </div>
                  {!userLoading && user && (
                    !isEditing ? (
                      <Button onClick={handleEditToggle} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button 
                          onClick={handleSaveChanges} 
                          variant="default" 
                          size="sm"
                          disabled={updateLoading}
                        >
                          {updateLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button onClick={handleEditToggle} variant="outline" size="sm" disabled={updateLoading}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading profile...</span>
                  </div>
                ) : userError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Error loading profile: {userError}
                    </AlertDescription>
                  </Alert>
                ) : user ? (
                  <>
                    {updateError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                          Error updating profile: {updateError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {updateSuccess && (
                      <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">
                          Profile updated successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-2">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">Member since {user.memberSince}</p>
                        {user.role && (
                          <div className="mt-2 px-3 py-1 bg-primary-foreground rounded-full text-xs font-medium">
                            {user.role}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            {isEditing ? (
                              <Input 
                                id="name"
                                name="name"
                                value={editedUser.name}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <p className="text-sm p-2 border rounded-md bg-muted">{user.name}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                              <Input 
                                id="email"
                                name="email"
                                type="email"
                                value={editedUser.email}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <p className="text-sm p-2 border rounded-md bg-muted">{user.email}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="id">User ID</Label>
                            <p className="text-sm p-2 border rounded-md bg-muted">{user.id}</p>
                          </div>
                          
                          {user.isAdmin !== undefined && (
                            <div className="space-y-2">
                              <Label htmlFor="isAdmin">Admin Status</Label>
                              <p className="text-sm p-2 border rounded-md bg-muted">
                                {user.isAdmin ? 'Administrator' : 'Regular User'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  {selectedBooking.service} - {selectedBooking.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start space-x-2">
                  <div className="p-2 bg-primary-foreground rounded-md">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Date & Time</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedBooking.date} at {selectedBooking.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="p-2 bg-primary-foreground rounded-md">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Duration</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedBooking.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="p-2 bg-primary-foreground rounded-md">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Location</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedBooking.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="p-2 bg-primary-foreground rounded-md">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Service Provider</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedBooking.provider}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="p-2 bg-primary-foreground rounded-md">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Price</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedBooking.price}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.notes}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setBookingModalOpen(false)}>Close</Button>
                  <Button 
                    disabled={selectedBooking.status === 'Cancelled'}
                    onClick={() => handleBookingAction(
                      selectedBooking.id, 
                      getBookingAction(selectedBooking.status)
                    )}
                  >
                    {getActionButtonText(selectedBooking.status)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
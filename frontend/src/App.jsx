import "./index.css"
import "./App.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./components/Home/Home"
import Blog from "./components/Blog/Blog"
import BlogPage from "./components/Blog/BlogPage"
import Tour from "./components/Tour/Tour"
import Ptour from "./components/Tour/Ptour"
import data from "./components/Tour/TourData"
import Hotel from "./components/Hotel/Hotel"
import Photel from "./components/Hotel/Photel"
import Hotelview from "./components/Hotel/Hotelview"
import BookingPage from "./components/Hotel/BookingPage"
import Cab from "./components/Cab/Cab"
import HotelPage from "./components/Hotel/HotelPage"
import CabPage from "./components/Cab/CabPage"
import ReviewBooking from "./components/Cab/ReviewBooking"
import Login from "./components/Login/Login"
import AdminRoutes from "./components/Adminroutes"
import UserDashboard from "./components/User/Userdashboard"

function App() {
  // Create the public routes
  const publicRoutes = [
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Home />
          <Footer />
        </>
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/blog",
      element: (
        <>
          <Navbar />
          <Blog />
          <Footer />
        </>
      ),
    },
    {
      path: "/blog/:id",
      element: (
        <>
          <Navbar />
          <BlogPage />
          <Footer />
        </>
      ),
    },
    {
      path: "/tour",
      element: (
        <>
          <Navbar />
          <Tour />
          <Footer />
        </>
      ),
    },
    {
      path: "/tour/:id",
      element: (
        <>
          <Navbar />
          <Ptour />
          <Footer />
        </>
      ),
    },
    // Tour data routes
    ...data.map((category, index) => ({
      path: `/tour/${category.title}/:id`,
      element: (
        <>
          <Navbar />
          <Ptour data={category.types} />
          <Footer />
        </>
      ),
    })),
    {
      path: "/hotel",
      element: (
        <>
          <Navbar />
          <Hotel />
          <Footer />
        </>
      ),
    },
    {
      path: "/hotel/:id",
      element: (
        <>
          <Navbar />
          <Hotelview />
          <Footer />
        </>
      ),
    },
    {
      path: "/hotel/booking/:id",
      element: (
        <>
          <Navbar />
          <BookingPage />
          <Footer />
        </>
      ),
    },
    // Hotel data routes
    ...data.slice(0, 2).map((category) => ({
      path: `/hotel/${category.title}/:id`,
      element: (
        <>
          <Navbar />
          <Photel data={category.types} />
          <Footer />
        </>
      ),
    })),
    {
      path: "/hotels",
      element: (
        <>
          <Navbar />
          <div className="flex container">
            <HotelPage />
          </div>
        </>
      ),
    },
    {
      path: "/cab",
      element: (
        <>
          <Navbar />
          <Cab />
          <Footer />
        </>
      ),
    },
    {
      path: "/c",
      element: (
        <>
          <Navbar />
          <div className="flex container">
            <CabPage />
          </div>
        </>
      ),
    },
    {
      path: "/cab/booking/:id",
      element: (
        <>
          <Navbar />
          <ReviewBooking />
          <Footer />
        </>
      ),
    },
    {
      path: "/user",
      element: (
        <>
          <Navbar />
          <UserDashboard/>
          <Footer />
        </>
      ),
    },
  ]

  // Create the admin routes - these will be handled by the AdminRoutes component
  const adminRoutes = {
    path: "/admin/*",
    element: <AdminRoutes />,
  }

  // Combine all routes
  const router = createBrowserRouter([...publicRoutes, adminRoutes])

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  )
}

export default App


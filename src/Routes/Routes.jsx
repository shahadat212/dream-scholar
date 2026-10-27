import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login-SignUp/Login";
import SignUp from "../pages/Login-SignUp/SignUp";
import AllScholarships from "../pages/Home/AllScholarships";
import ErrorPage from "../components/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardRedirect from "./DashboardRedirect";
import Home from "../pages/Home/Home";

const MyProfile = lazy(() => import("../pages/Dashboard/UserDashboard/MyProfile"));
const AllUsers = lazy(() => import("../pages/Dashboard/AdminDashboard/AllUsers"));
const AddScholar = lazy(() => import("../pages/Dashboard/AdminDashboard/AddScholar"));
const Details = lazy(() => import("../components/Details"));
const ApplicationForm = lazy(() => import("../components/ApplicationForm"));
const Compare = lazy(() => import("../pages/Home/Compare"));
const MyWishlist = lazy(() => import("../pages/Dashboard/UserDashboard/MyWishlist"));
const Analytics = lazy(() => import("../pages/Dashboard/AdminDashboard/Analytics"));
const ActivityLog = lazy(() => import("../pages/Dashboard/AdminDashboard/ActivityLog"));
const MyApplications = lazy(() => import("../pages/Dashboard/UserDashboard/MyApplications"));
const MyReviews = lazy(() => import("../pages/Dashboard/UserDashboard/MyReviews"));
const ManageScholarships = lazy(() => import("../pages/Dashboard/AdminDashboard/ManageScholarships"));
const ManageReviews = lazy(() => import("../pages/Dashboard/AdminDashboard/ManageReviews"));
const PaymentPage = lazy(() => import("../pages/payment/PaymentPage"));
const PaymentHistory = lazy(() => import("../pages/Dashboard/AdminDashboard/PaymentHistory"));
const EditApplicationForm = lazy(() => import("../components/EditApplicationForm"));
const ManageApplications = lazy(() => import("../pages/Dashboard/AdminDashboard/ManageApplications"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: '/',
        element: <Home></Home>
      },
      {
        path: 'scholarships',
        element: <AllScholarships></AllScholarships>
      },
      {
        path: 'compare',
        element: <Compare></Compare>
      },
      {
        path: 'scholarships/details/:id',
        element: <Details></Details>
      },
      {
        path: 'payment/:id',
        element: <PrivateRoute><PaymentPage /></PrivateRoute>
      },
      {
        path: '/applicationForm/:id',
        element: <PrivateRoute><ApplicationForm></ApplicationForm></PrivateRoute>
      },
      {
        path: 'login',
        element: <Login></Login>
      },
      {
        path: 'register',
        element: <SignUp></SignUp>
      }
    ]
  },

  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardRedirect></DashboardRedirect></PrivateRoute>
  },

  {
    path: '/userDashboard',
    element: <PrivateRoute><DashboardLayout></DashboardLayout></PrivateRoute>,
    children: [
      {
        path: 'myProfile',
        element: <MyProfile></MyProfile>
      },
      {
        path: 'myApplication',
        element: <MyApplications></MyApplications>
      },
      {
        path: 'editApplication/:id',
        element: <EditApplicationForm />,
      },
      {
        path: 'myReviews',
        element: <MyReviews></MyReviews>
      },
      {
        path: 'wishlist',
        element: <MyWishlist></MyWishlist>
      }
    ]
  },

  {
    path: '/adminDashboard',
    element: <PrivateRoute><AdminRoute><DashboardLayout></DashboardLayout></AdminRoute></PrivateRoute>,
    children: [
      {
        path: 'myProfile',
        element: <MyProfile></MyProfile>
      },
      {
        path: 'addScholarships',
        element: <AddScholar></AddScholar>
      },
      {
        path: 'manageScholarships',
        element: <ManageScholarships></ManageScholarships>
      },
      {
        path: 'manageApplications',
        element: <ManageApplications></ManageApplications>
      },
      {
        path: 'manageReviews',
        element: <ManageReviews></ManageReviews>
      },
      {
        path: 'history',
        element: <PaymentHistory></PaymentHistory>
      },
      {
        path: 'users',
        element: <AdminRoute adminOnly><AllUsers></AllUsers></AdminRoute>
      },
      {
        path: 'analytics',
        element: <Analytics></Analytics>
      },
      {
        path: 'activity',
        element: <AdminRoute adminOnly><ActivityLog></ActivityLog></AdminRoute>
      },
    ]
  },
  {
    path: '/*',
    element: <ErrorPage></ErrorPage>
  }
]);

export default router;

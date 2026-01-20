import { lazy, Suspense } from 'react'
import Loader from './components/Loader'
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute'

// Public Pages
const Home = lazy(() => import('./pages/Home'))
const Sermons = lazy(() => import('./pages/Sermons'))
const PrayerRequests = lazy(() => import('./pages/PrayerRequests'))
const BibleAIAssistant = lazy(() => import('./pages/BibleAIAssistant'))
const Donations = lazy(() => import('./pages/Donations'))
const Events = lazy(() => import('./pages/Events'))
const Gallery = lazy(() => import('./pages/Gallery'))

const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About')) // Added About page
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'))

// Member Layout & Pages
const MemberLayout = lazy(() => import('./components/Member/MemberLayout'))
const MemberDashboardPage = lazy(() => import('./pages/Member/MemberDashboardPage'))
const MemberProfile = lazy(() => import('./pages/Member/MemberProfile'))
const MemberPrayers = lazy(() => import('./pages/Member/MemberPrayers'))
const MemberDonations = lazy(() => import('./pages/Member/MemberDonations'))
const MemberAppointments = lazy(() => import('./pages/Member/MemberAppointments'))
const MemberDashboard = lazy(() => import('./pages/MemberDashboard')) // Old monolithic dashboard

// Pastor Layout & Pages
const PastorLayout = lazy(() => import('./components/Pastor/PastorLayout'))
const PastorDashboardPage = lazy(() => import('./pages/Pastor/PastorDashboardPage'))
const PastorPrayers = lazy(() => import('./pages/Pastor/PastorPrayers'))
const PastorSermons = lazy(() => import('./pages/Pastor/PastorSermons'))
const PastorDonations = lazy(() => import('./pages/Pastor/PastorDonations'))
const PastorRhema = lazy(() => import('./pages/Pastor/PastorRhema'))
const PastorAvailability = lazy(() => import('./pages/Pastor/PastorAvailability'))
const PastorAppointments = lazy(() => import('./pages/Pastor/PastorAppointments'))
const PastorDashboard = lazy(() => import('./pages/PastorDashboard')) // Temporary - old dashboard

// Admin Layout & Pages
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SermonsManagement = lazy(() => import('./features/sermons').then(m => ({ default: m.SermonsManagement })));
const ContactManagement = lazy(() => import('./features/contact').then(m => ({ default: m.ContactManagement })));
const MessagesManagement = lazy(() => import('./features/messages').then(m => ({ default: m.MessagesManagement })));
const PrayersManagement = lazy(() => import('./features/prayers').then(m => ({ default: m.PrayersManagement })));
const DonationsManagement = lazy(() => import('./features/donations').then(m => ({ default: m.DonationsManagement })));
const EventsManagement = lazy(() => import('./features/events').then(m => ({ default: m.EventsManagement })));
const GalleryManagement = lazy(() => import('./features/gallery').then(m => ({ default: m.GalleryManagement })));
const UsersManagement = lazy(() => import('./features/users').then(m => ({ default: m.UsersManagement })));
const AboutManagement = lazy(() => import('./features/about/AboutManagement')); // Added
const PastorCreation = lazy(() => import('./features/users').then(m => ({ default: m.PastorCreation })));
const AnnouncementsManagement = lazy(() => import('./features/announcements/AnnouncementsManagement'));
const AdminChat = lazy(() => import('./features/chat/components/AdminChat'));
const LivePlayer = lazy(() => import('./features/live/components/LivePlayer'));
const PastorLive = lazy(() => import('./features/live/components/PastorLive'));

const withSuspense = (Component) => (
    <Suspense fallback={<Loader />}>
        <Component />
    </Suspense>
)

const routes = [
    // Public Routes
    { path: '/', element: withSuspense(Home) },
    { path: '/sermons', element: withSuspense(Sermons) },
    { path: '/gallery', element: withSuspense(Gallery) },
    { path: '/prayer-requests', element: withSuspense(PrayerRequests) },
    { path: '/bible-ai', element: withSuspense(BibleAIAssistant) },
    { path: '/donations', element: withSuspense(Donations) },

    { path: '/events', element: withSuspense(Events) },
    { path: '/contact', element: withSuspense(Contact) },
    { path: '/about', element: withSuspense(About) }, // Added About route
    { path: '/login', element: withSuspense(Login) },
    { path: '/register', element: withSuspense(Register) },
    { path: '/forgot-password', element: withSuspense(ForgotPassword) },
    { path: '/reset-password/:uid/:token', element: withSuspense(ResetPassword) },

    // Member Routes with Layout
    {
        path: '/member',
        element: (
            <RoleProtectedRoute allowedRoles={['MEMBER', 'PASTOR', 'ADMIN']}>
                {withSuspense(MemberLayout)}
            </RoleProtectedRoute>
        ),
        children: [
            { index: true, element: withSuspense(MemberDashboardPage) },
            { path: 'profile', element: withSuspense(MemberProfile) },
            { path: 'prayers', element: withSuspense(MemberPrayers) },
            { path: 'donations', element: withSuspense(MemberDonations) },
            { path: 'appointments', element: withSuspense(MemberAppointments) },
            { path: 'live', element: withSuspense(LivePlayer) },
            { path: 'legacy', element: withSuspense(MemberDashboard) },
        ]
    },

    // Legacy routes for backward compatibility
    {
        path: '/dashboard',
        element: (
            <RoleProtectedRoute allowedRoles={['MEMBER']}>
                {withSuspense(MemberDashboard)}
            </RoleProtectedRoute>
        )
    },

    // Pastor Routes with Layout
    {
        path: '/pastor',
        element: (
            <RoleProtectedRoute allowedRoles={['PASTOR', 'ADMIN']}>
                {withSuspense(PastorLayout)}
            </RoleProtectedRoute>
        ),
        children: [
            { index: true, element: withSuspense(PastorDashboardPage) },
            { path: 'prayers', element: withSuspense(PastorPrayers) },
            { path: 'sermons', element: withSuspense(PastorSermons) },
            { path: 'donations', element: withSuspense(PastorDonations) },
            { path: 'rhema', element: withSuspense(PastorRhema) },
            { path: 'availabilities', element: withSuspense(PastorAvailability) },
            { path: 'appointments', element: withSuspense(PastorAppointments) },
            { path: 'live', element: withSuspense(PastorLive) },
            { path: 'legacy', element: withSuspense(PastorDashboard) },
        ]
    },

    // Legacy pastor route - redirects to old full dashboard temporarily
    {
        path: '/pastor-dashboard',
        element: (
            <RoleProtectedRoute allowedRoles={['PASTOR']}>
                {withSuspense(PastorDashboard)}
            </RoleProtectedRoute>
        )
    },

    // Admin Routes with Layout
    {
        path: '/admin',
        element: (
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
                {withSuspense(AdminLayout)}
            </RoleProtectedRoute>
        ),
        children: [
            { index: true, element: withSuspense(AdminDashboard) },
            { path: 'announcements', element: withSuspense(AnnouncementsManagement) },
            { path: 'support', element: withSuspense(AdminChat) },
            { path: 'live', element: withSuspense(LivePlayer) },
            { path: 'users', element: withSuspense(UsersManagement) },
            { path: 'create-pastor', element: withSuspense(PastorCreation) },
            { path: 'sermons', element: withSuspense(SermonsManagement) },
            { path: 'prayers', element: withSuspense(PrayersManagement) },
            { path: 'donations', element: withSuspense(DonationsManagement) },
            { path: 'events', element: withSuspense(EventsManagement) },
            { path: 'gallery', element: withSuspense(GalleryManagement) },
            { path: 'contact', element: withSuspense(ContactManagement) },
            { path: 'about', element: withSuspense(AboutManagement) }, // Added
            { path: 'messages', element: withSuspense(MessagesManagement) },
        ]
    }
]

export default routes

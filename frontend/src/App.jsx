import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout, ProtectedRoute, ToastHub } from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CataloguePage from './pages/CataloguePage.jsx';
import ContentDetailPage from './pages/ContentDetailPage.jsx';
import { AdminLoginPage, LoginPage, RegisterPage, SavedPage } from './pages/AccountPages.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import TheatrePages from './pages/TheatrePages.jsx';
import ProductionPage from './pages/ProductionPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import './dialogs.css';
import './pages.css';
import './admin.css';
import './operations.css';
import './posters.css';
import './auth.css';

function NotFound() {
  return <div className="page-wrap"><div className="empty-state"><div><h3>Page not found</h3><p>This route is outside the current archive.</p><Link className="text-link" to="/">Return to discovery →</Link></div></div></div>;
}

function SignedIn({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

const adminOnly = ['admin'];

export default function App() {
  return <><Routes><Route element={<AppLayout />}>
    <Route path="/" element={<SignedIn><HomePage /></SignedIn>} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/admin-login" element={<AdminLoginPage />} />

    <Route path="/movies" element={<SignedIn><CataloguePage type="movie" /></SignedIn>} />
    <Route path="/shows" element={<SignedIn><CataloguePage type="show" /></SignedIn>} />
    <Route path="/content/:id" element={<SignedIn><ContentDetailPage /></SignedIn>} />
    <Route path="/watchlist" element={<SignedIn><SavedPage kind="watchlist" /></SignedIn>} />
    <Route path="/favourites" element={<SignedIn><SavedPage kind="favourites" /></SignedIn>} />

    <Route path="/admin" element={<SignedIn roles={adminOnly}><AdminPage /></SignedIn>} />
    <Route path="/admin/catalogue" element={<SignedIn roles={adminOnly}><AdminPage /></SignedIn>} />
    <Route path="/admin/submissions" element={<SignedIn roles={adminOnly}><SubmissionsPage /></SignedIn>} />
    <Route path="/theatres" element={<SignedIn roles={adminOnly}><TheatrePages mode="list" /></SignedIn>} />
    <Route path="/theatres/:theatreId" element={<SignedIn roles={adminOnly}><TheatrePages mode="detail" /></SignedIn>} />
    <Route path="/production" element={<SignedIn roles={adminOnly}><ProductionPage /></SignedIn>} />
    <Route path="/reports" element={<SignedIn roles={adminOnly}><ReportsPage /></SignedIn>} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes><ToastHub /></>;
}

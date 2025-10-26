import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import AboutPage from './pages/AboutPage';
import InstructorsPage from './pages/InstructorsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseAccessRoute from './components/auth/CourseAccessRoute';
import CoursePackDetailPage from './pages/CoursePackDetailPage';
import AdminRoute from './components/admin/AdminRoute';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
          // Handle course detail routes
          if (path.startsWith('/course/')) {
            setCurrentPage('course-detail');
            return;
          }

          // Handle course pack routes
          if (path.startsWith('/pack/')) {
            setCurrentPage('pack-detail');
            return;
          }
      
      switch (path) {
        case '/':
          setCurrentPage('home');
          break;
        case '/courses':
          setCurrentPage('courses');
          break;
        case '/about':
          setCurrentPage('about');
          break;
        case '/instructors':
          setCurrentPage('instructors');
          break;
        case '/contact':
          setCurrentPage('contact');
          break;
        case '/login':
          setCurrentPage('login');
          break;
        case '/register':
          setCurrentPage('register');
          break;
        case '/forgot-password':
          setCurrentPage('forgot-password');
          break;
        case '/reset-password':
          setCurrentPage('reset-password');
          break;
        case '/dashboard':
          setCurrentPage('dashboard');
          break;
        case '/admin':
          setCurrentPage('admin');
          break;
        default:
          setCurrentPage('home');
      }
    };

    // Set initial route
    handleRouteChange();

    // Listen for browser back/forward
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'courses':
        return <CoursesPage />;
      case 'about':
        return <AboutPage />;
      case 'instructors':
        return <InstructorsPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'reset-password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute onUnauthorized={() => handleNavigate('login')}>
            <StudentDashboardPage />
          </ProtectedRoute>
        );
      case 'admin':
        return <AdminRoute />;
          case 'course-detail':
            return (
              <CourseAccessRoute requireAccess={false}>
                <CourseDetailPage />
              </CourseAccessRoute>
            );
          case 'pack-detail':
            return <CoursePackDetailPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Navigation function that updates both state and URL
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const path = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', path);
  };

  const authPages = ['login', 'register', 'forgot-password', 'reset-password', 'dashboard', 'admin'];
  const hideHeaderFooter = authPages.includes(currentPage);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              duration: 4000,
            }}
          />
          {!hideHeaderFooter && <Header currentPage={currentPage} onNavigate={handleNavigate} />}
          <main>{renderPage()}</main>
          {!hideHeaderFooter && <Footer onNavigate={handleNavigate} />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

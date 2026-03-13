import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AiChatbot from '../../../features/chatbot/components/AiChatbot';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="content">
                <Outlet />
            </main>
            <AiChatbot />
            <Footer />
        </div>
    );
};

export default Layout;

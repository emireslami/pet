import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import App from './App';
import AuthGate from './AuthGate';
import LandingPage from './LandingPage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ConfigProvider direction="rtl" locale={faIR} theme={{token:{fontFamily:'IRANSans, sans-serif',colorPrimary:'#2563EB',colorSuccess:'#22C55E',colorWarning:'#F59E0B',colorError:'#EF4444',colorText:'#0F172A',colorTextSecondary:'#64748B',colorBorder:'#E5E7EB',borderRadius:12,colorBgLayout:'#F8FAFC'}}}>{window.location.pathname.startsWith('/app')?<AuthGate><App/></AuthGate>:<LandingPage/>}</ConfigProvider></React.StrictMode>
);

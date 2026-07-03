import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import App from './App';
import AuthGate from './AuthGate';
import LandingPage from './LandingPage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ConfigProvider direction="rtl" locale={faIR} theme={{token:{fontFamily:'IRANSans, sans-serif',colorPrimary:'#315F52',borderRadius:14,colorBgLayout:'#F4F7F6'}}}>{window.location.pathname.startsWith('/app')?<AuthGate><App/></AuthGate>:<LandingPage/>}</ConfigProvider></React.StrictMode>
);

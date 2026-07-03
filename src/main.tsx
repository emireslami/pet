import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import App from './App';
import AuthGate from './AuthGate';
import LandingPage from './LandingPage';
import './styles.css';
import './apple.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ConfigProvider direction="rtl" locale={faIR} theme={{token:{fontFamily:'IRANSans, sans-serif',colorPrimary:'#0071E3',colorPrimaryHover:'#0077ED',colorSuccess:'#34C759',colorWarning:'#FF9F0A',colorError:'#FF3B30',colorText:'#1D1D1F',colorTextSecondary:'#6E6E73',colorBorder:'#D2D2D7',colorBgBase:'#FFFFFF',colorBgLayout:'#F5F5F7',borderRadius:14,controlHeight:44,boxShadow:'0 8px 30px rgba(0,0,0,.06)'}}}>{window.location.pathname.startsWith('/app')?<AuthGate><App/></AuthGate>:<LandingPage/>}</ConfigProvider></React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import AuthGate from './AuthGate';
import LandingPage from './LandingPage';
import { theme } from './theme';
import './styles.css';
import './apple.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline />{window.location.pathname.startsWith('/login')?<AuthGate forceFresh><App/></AuthGate>:window.location.pathname.startsWith('/app')?<AuthGate><App/></AuthGate>:<LandingPage/>}</ThemeProvider></React.StrictMode>
);

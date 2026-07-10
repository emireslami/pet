import React from 'react';
import ReactDOM from 'react-dom/client';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import App from './App';
import AuthGate from './AuthGate';
import LandingPage from './LandingPage';
import { theme } from './theme';
import './styles.css';
import './apple.css';

document.documentElement.setAttribute('dir', 'rtl');
document.body.setAttribute('dir', 'rtl');

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><CacheProvider value={rtlCache}><ThemeProvider theme={theme}><CssBaseline />{window.location.pathname.startsWith('/login')?<AuthGate forceFresh><App/></AuthGate>:window.location.pathname.startsWith('/app')?<AuthGate><App/></AuthGate>:<LandingPage/>}</ThemeProvider></CacheProvider></React.StrictMode>
);

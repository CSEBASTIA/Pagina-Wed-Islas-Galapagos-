import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ManageSite from './pages/Manage.jsx';
import { Router } from './router.jsx';
import './styles.css';

const isManage = /^\/gestion\/?$/.test(window.location.pathname);

createRoot(document.getElementById('root')).render(isManage ? <ManageSite /> : <Router><App /></Router>);

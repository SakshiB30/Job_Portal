import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

const token = localStorage.getItem('token');
if (token) axios.defaults.headers.common['Authorization'] = token;

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)


'use client';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export const Toast = () => (
    <ToastContainer position="bottom-right" theme="dark" autoClose={2000} />
);

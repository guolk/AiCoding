import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { MaterialProvider } from './context/MaterialContext';
import { JokeProvider } from './context/JokeContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { RecordProvider } from './context/RecordContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MaterialProvider>
        <JokeProvider>
          <PerformanceProvider>
            <RecordProvider>
              <App />
            </RecordProvider>
          </PerformanceProvider>
        </JokeProvider>
      </MaterialProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

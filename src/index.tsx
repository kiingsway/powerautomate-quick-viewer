import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FluentProvider, teamsDarkTheme, webDarkTheme } from '@fluentui/react-components';

// console.log(webDarkTheme)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <FluentProvider theme={webDarkTheme}>
      <App />
  </FluentProvider>,
);
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <FluentProvider theme={webDarkTheme}>
      <App />
  </FluentProvider>,
);
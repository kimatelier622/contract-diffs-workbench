import ReactDOM from 'react-dom/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import App from './App';
import './styles.css';

const client = new QueryClient({defaultOptions: {queries: {staleTime: 60000, retry: 1}}});
ReactDOM.createRoot(document.getElementById('root')!)
  .render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  );

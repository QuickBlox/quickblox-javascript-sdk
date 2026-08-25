import { createRoot } from 'react-dom/client';
import QB from 'quickblox';
import './styles.scss';

window.QB = QB;

const root = createRoot(document.getElementById('root')!);

void import('./App').then(({ default: App }) => {
  root.render(<App />);
});

import React, { useEffect, useState } from 'react';
import Activity from './pages/Activity';
import Borrowing from './pages/Borrowing';
import Dashboard from './pages/Dashboard';
import Lending from './pages/Lending';
import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import Header from './components/Header';
import Sidebar, { type KaiaFiPage } from './components/Sidebar';
import { Web3Provider } from './context/Web3Provider';
import type { VaultActivity } from './types';

const pages: KaiaFiPage[] = ['overview', 'lending', 'borrowing', 'markets', 'portfolio', 'activity'];

const pageFromHash = (): KaiaFiPage => {
  const page = window.location.hash.replace(/^#\/?/, '') as KaiaFiPage;
  return pages.includes(page) ? page : 'overview';
};

const KaiaFiWorkspace: React.FC = () => {
  const [page, setPage] = useState<KaiaFiPage>(pageFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activity, setActivity] = useState<VaultActivity[]>([]);

  useEffect(() => {
    const syncPage = () => setPage(pageFromHash());
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const navigate = (nextPage: KaiaFiPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
    if (window.location.hash !== `#/${nextPage}`) {
      window.location.hash = `/${nextPage}`;
    }
  };

  const recordActivity = (next: VaultActivity) => {
    setActivity((current) => {
      const exists = current.some((item) => item.hash === next.hash);
      if (!exists) return [next, ...current];
      return current.map((item) => item.hash === next.hash ? next : item);
    });
  };

  const content = {
    overview: <Dashboard onNavigate={navigate} />,
    lending: <Lending onActivity={recordActivity} />,
    borrowing: <Borrowing />,
    markets: <Markets />,
    portfolio: <Portfolio />,
    activity: <Activity items={activity} />,
  }[page];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar
        page={page}
        open={sidebarOpen}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {content}
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-6 text-xs leading-5 text-slate-500 sm:px-6 lg:px-8">
          Arc mainnet · USDC is used for gas. The ERC-20 interface uses 6 decimals; native gas balance uses 18 decimals.
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <KaiaFiWorkspace />
    </Web3Provider>
  );
}

export default App;

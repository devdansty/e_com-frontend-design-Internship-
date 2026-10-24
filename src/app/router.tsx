import { BrowserRouter, Routes, Route } from 'react-router-dom';

/** Minimal placeholder — will be replaced with real pages in later phases. */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-medium text-vyro-text-primary">{title}</h1>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-5xl font-semibold text-vyro-text-primary">404</h1>
      <p className="text-vyro-text-secondary">Page not found</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="VYRO" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

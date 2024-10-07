import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TestPagination from './pages/TestPagination';
import { ModeToggle } from './components/mode-toggle';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';

const routes = [{ path: '/test-pagination', Component: TestPagination, label: 'Test Pagination' }];

function App() {
  const { pathname } = useLocation();

  return (
    <div className='p-4'>
      <ModeToggle />
      <div className='py-2'>
        {routes.map(({ label, path }) => {
          const isActive = pathname.includes(path);
          return (
            <Link key={path} to={path}>
              <Badge variant={isActive ? 'default' : 'outline'}>{label}</Badge>
            </Link>
          );
        })}
      </div>
      <div className='py-2'>
        <Separator />
      </div>
      <Routes>
        {routes.map(({ Component, path }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path='*' element={<Navigate to='/test-pagination' />} />
      </Routes>
    </div>
  );
}

export default App;

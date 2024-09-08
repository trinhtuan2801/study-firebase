import { Link, Navigate, Route, Routes } from 'react-router-dom';
import TestPagination from './pages/TestPagination';
import { ModeToggle } from './components/mode-toggle';
import { Badge } from './components/ui/badge';

function App() {
  return (
    <div className='p-4'>
      <ModeToggle />
      <div className='py-2'>
        <Link to='/test-pagination'>
          <Badge variant='outline'>Test Pagination</Badge>
        </Link>
      </div>
      <Routes>
        <Route path='/test-pagination' element={<TestPagination />} />
        <Route path='*' element={<Navigate to='/test-pagination' />} />
      </Routes>
    </div>
  );
}

export default App;

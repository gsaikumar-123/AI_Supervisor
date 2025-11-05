import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestCall from './pages/TestCall';
import Supervisor from './pages/Supervisor';
import Caller from './pages/Caller';
import Learned from './pages/Learned';
import Layout from './components/Layout';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TestCall />} />
          <Route path="/supervisor" element={<Supervisor />} />
          <Route path="/caller" element={<Caller />} />
          <Route path="/learned" element={<Learned />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;

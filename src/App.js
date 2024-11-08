import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import WelcomePage from './Pages/WelcomePage/WelcomePage';
import Login from './Components/Login/Login';
import CoordinatorFormTable from './Pages/CoordinatorFormTable/CoordinatorFormTable';
import UserList from './Pages/UserList/UserList';

// import Dummy from './Pages/dummy/Dummy';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          {/* <Route path="/admin" element={<CoordinatorFormTable />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/coordinator" element={<CoordinatorFormTable />} />
          <Route path="/user-list" element={<UserList />} />
          {/* <Route path="/pages" element={<Dummy />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;

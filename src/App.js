import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
// import WelcomePage from './Pages/WelcomePage/WelcomePage';
import Login from './Components/Login/Login';
// import Location from './Components/Location/Location';
import CoordinatorFormTable from './Pages/CoordinatorFormTable/CoordinatorFormTable';
import UserList from './Pages/UserList/UserList';
import LocationComponent from './Pages/Location/Location';
import AddUserAdmin from './Pages/AddUserAdmin/AddUserAdmin';
import { Provider } from 'react-redux';
import store from './store';

// import Dummy from './Pages/dummy/Dummy';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <Routes>
            {/* <Route path="/" element={<WelcomePage />} /> */}
            {/* <Route path="/admin" element={<CoordinatorFormTable />} /> */}
            <Route path="/" element={<Login />} />
            <Route path="/coordinator" element={<CoordinatorFormTable />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/location" element={<LocationComponent />} />
            <Route path="/add-user-admin" element={<AddUserAdmin />} />
            {/* <Route path="/pages" element={<Dummy />} /> */}
          </Routes>
        </Router>
      </div>
    </Provider>
  );
}

export default App;

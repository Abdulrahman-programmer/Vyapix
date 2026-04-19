// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Before_logIn from './Pages/BeforelogIn';
import After_logIn from './Pages/Afterlogin';
import Dashboard from './Pages/Dashboard';
import Inventory from './Pages/Inventory';
import Sales from './Pages/Sales';
import Report from './Pages/Report';
import LowStock from './Pages/LowStock';



function App() {
  return (
   
    
    
      <Routes>
        <Route path="/" element={<Before_logIn />} />

        {/* Parent route with children */}
        <Route path="/afterlogin" element={<After_logIn />}>
          <Route index element={<Dashboard />} />   {/* /afterlogin */}
          <Route path="inventory" element={<Inventory />} />   {/* /afterlogin/inventory */}
          <Route path="sales" element={<Sales />} />           {/* /afterlogin/sales */}
          <Route path="report" element={<Report />} />         {/* /afterlogin/report */}
          <Route path="lowstock" element={<LowStock />} />     {/* /afterlogin/lowstock */}
          
        </Route>
        
      </Routes>
    
  );
}

export default App;

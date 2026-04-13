import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import VehiclesPage from './pages/VehiclesPage';
import AddVehiclePage from './pages/AddVehiclePage';
import EditVehiclePage from './pages/EditVehiclePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ServicePage from './pages/ServicePage';
import ConditionPage from './pages/ConditionPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-svh bg-gray-50">
        <Routes>
          <Route path="/" element={<VehiclesPage />} />
          <Route path="/vehicles/new" element={<AddVehiclePage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/vehicles/:id/edit" element={<EditVehiclePage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/condition" element={<ConditionPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

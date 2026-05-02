import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import GetStartedScreen from "./pages/GetStartedScreen/GetStartedScreen";
import FormScreen from "./pages/FormScreen/FormScreen";
import YourTripScreen from "./pages/YourTripScreen/YourTripScreen";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<GetStartedScreen />} />
        <Route path="/create-trip" element={<FormScreen />} />
        <Route path="/your-trip" element={<YourTripScreen />} />
      </Routes>
    </Router>
  );
}


import './App.css';

import React from 'react';
import {Routes,Route, Router} from "react-router"
import Register from './Components/GuideRegister/GuideRegister';
import AdminDashboard from './Components/AdminDashboad/AdminDashboard';
import GuideLogin from './Components/GuideLogin/GuideLogin';
import GuideProfile from './Components/GuideProfile/GuideProfile';
import GuideList from './Components/GuideSort/GuideSort';
import AddReviewForm from './Components/AddReview/AddReview';
import PublicGuideProfile from './Components/PublicGuideProfile/PublicGuideProfile';
import LandingPage from './Components/LandingPage/LandingPage';
import ForgotPassword from './Components/GuideForgotPassword/GuideForgotPassword';
import ResetPassword from './Components/GuideResetPassword/GuideResetPassword';
import AdminLogin from './Components/AdminLogin/AdminLogin';
import RegistrationSuccess from './Components/RegistrationSuccess/RegistrationSuccess';



function App() {
  
  return (
    <div className="App">
      <React.Fragment>
        <Routes>
        <Route path="/" element={<LandingPage/>}/>
         <Route path="/guideRegister" element={<Register/>}/>
         <Route path="/adminDashboard" element={<AdminDashboard/>}/>
         <Route path='/guideLogin' element={<GuideLogin/>}/>
         <Route path="/guideProfile" element={<GuideProfile/>}/>
         <Route path="/guideList" element={<GuideList/>}/>
         <Route path="/guides/:guideId/add-review" element={<AddReviewForm/>} />
         <Route path="/guides/:id" element={<PublicGuideProfile/>}/>
         <Route path="/landingPage" element={<LandingPage/>}/>
         <Route path="/forgot-password" element={<ForgotPassword/>}/>
         <Route path="/reset-password/:token" element={<ResetPassword/>}/>
         <Route path="/adminLogin" element={<AdminLogin/>}/>
         <Route path="/registration-confirmation" element={<RegistrationSuccess/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;

// Pages/Afterlogin.js
import { Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';



function After_logIn(params) {
  const location = useLocation();
const { name, email } = location.state || {};

  return (
    <>
      <Header islogin={true} />
      <Menu name={name} email={email} />

      {/* This is where child routes render */}
      <div>
        <Outlet context={{ name, email }} />
      </div>
    </>
  );
}

export default After_logIn;

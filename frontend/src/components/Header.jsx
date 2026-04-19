//Components / Header.jsx
import Logo from '../assets/logo.png';
import Login_btn from './loginbar';

import "./components.css"


function Header(params) {
  
   return (<>

      <header className={'header ' + `${params.islogin ? " justify-center" : " justify-between"}`} >
         <div className={'logo ' + `${params.islogin ? "lg:ml-72" : " "}`}>
            <img src={Logo} alt="" className='h-15' />
            Vyapix
         </div>
     
         {!params.islogin && <Login_btn open = {params.openLogin}  openAbout={params.openAbout} />}
         
      </header> 
   </>
   );
}
export default Header;
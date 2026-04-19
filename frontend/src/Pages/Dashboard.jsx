//Pages / Dashboard.jsx
import Greeting from "../components/Greeting";
import OverViewBox from "../components/OverViewBox";
import MaxSales from "../components/MaxSales";
import { useOutletContext } from "react-router-dom";

function Dashboard(params) {
    const { name, email } = useOutletContext();
    return (
    <>
        <Greeting />
        <OverViewBox />
        <div className='flex flex-col py-4 gap-4 lg:ml-72 lg:flex-row mx-4'>
            
            <MaxSales />
        </div>
    </>
    );
}
export default Dashboard;
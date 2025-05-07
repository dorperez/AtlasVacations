import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import PlaneTakeoffFramer from "./PlaneTakeoffFramer";

const Logout = () => {
    const auth = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        auth?.setIsLogout(true)
        setTimeout(() => {
            if (auth?.logout) {
                auth.logout();
                navigate("/auth");
                auth?.setIsLogout(false)
            }
        }, 3000);
    }, []);

    return (
        <div className="logoutContainer">
            <PlaneTakeoffFramer />
            <h2>Logging out ...</h2>
            <h4>Thank you for visiting, Hope to see you again soon!</h4>
        </div>
    );
};

export default Logout
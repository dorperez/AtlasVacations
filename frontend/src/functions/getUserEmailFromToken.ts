import { jwtDecode } from "jwt-decode";

const getUserEmailFromToken = (userToken: string) => {
    try {
        const decodedToken: { email: string } = jwtDecode(userToken);
        return decodedToken.email
    } catch (error) {
        console.error("Error decoding token:", error);
        return null
    }
};

export default getUserEmailFromToken;
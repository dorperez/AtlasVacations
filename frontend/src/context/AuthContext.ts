import { createContext } from "react"
import UserType from "../types/UserType";

interface AuthContextType {
    userToken: string | null
    setUserToken: (token: string | null) => void
    user: UserType | null
    setUser: (user: UserType | null) => void
    isAdmin: boolean
    setIsAdmin: (value: boolean) => void
    logout: () => void
    setIsLogout: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
    userToken: null,
    setUserToken: () => {},
    user: null,
    setUser: () => {},
    isAdmin: false,
    setIsAdmin: () => {},
    logout: () => {},
    setIsLogout: () => {},
})

export default AuthContext


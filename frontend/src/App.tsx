import './styles/main.scss'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './components/Homepage'
import LoginRegisterPage from './components/LoginRegisterPage'
import Navbar from './components/Navbar'
import { useState, useEffect, useMemo } from 'react'
import PageTransition from './components/PageTransition'
import AuthContext from "./context/AuthContext"
import ThemeContext from "./context/ThemeContext"
import UserType from "./types/UserType"
import getUserEmailFromToken from './functions/getUserEmailFromToken'
import getUserByEmail from './functions/getUserByEmail'
import checkTokenExpiration from './functions/checkTokenExpiration'
import LogoutComponent from './components/Logout'
import SnackBar from './components/Snackbar'
import AddEditVacationPage from './components/AddEditVacationPage'
import ReportsPage from './components/ReportsPage'
import Footer from './components/Footer'
import UserProfilePage from './components/UserProfilePage'

function App() {
  const [userToken, setUserToken] = useState<string | null>(localStorage.getItem('authToken') || null)
  const [theme, setTheme] = useState(localStorage.getItem("appTheme") || "light")
  const [user, setUser] = useState<UserType | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLogout, setIsLogout] = useState<boolean>(false)
  const [isTokenChecked, setIsTokenChecked] = useState(false)
  const [dropDownOpen, setDropDownOpen] = useState(false)

  const [isAppLoading, setIsAppLoading] = useState(true)

  useEffect(() => {
    if (isTokenChecked && (!userToken || (userToken && user))) {
      setIsAppLoading(false)
    }
  }, [isTokenChecked, userToken, user])

  // Check if the token is valid
  useEffect(() => {
    if (!userToken) {
      setIsTokenChecked(true)
      return
    }
    
    const checkTokenValidity = async () => {
      const isExpired = await checkTokenExpiration(userToken)
      if (isExpired) {
        localStorage.removeItem('authToken')
        setUserToken(null)
      }
      setIsTokenChecked(true)
    }
    
    checkTokenValidity()
    const intervalId = setInterval(checkTokenValidity, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [userToken])

  // User Details
  useEffect(() => {
    if (userToken && isTokenChecked) {
      const userEmail = getUserEmailFromToken(userToken)

      if (userEmail) {
        getUserByEmail(userEmail).then((response) => {
          //console.log("User by email App.jsx: ", { response })
          setUser(response.data[0])
          const role = response.data[0].role
          setIsAdmin(role === 'admin')
        }).catch((error) => {
          console.error("Error fetching user data: ", error)
        })
      }
    }
  }, [userToken, isTokenChecked])

  // Set initial theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("appTheme")
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  // Set new theme
  useEffect(() => {
    //console.log("Current Theme: ", theme)
    localStorage.setItem("appTheme", theme)
    document.body.dataset.theme = theme
  }, [theme])

  const logout = () => {
    setIsLogout(false)
    localStorage.removeItem("authToken")
    setUserToken(null)
    setUser(null)
    setIsAdmin(false)
  }

  const authValue = useMemo(() => ({
    userToken, setUserToken, user, setUser, isAdmin, setIsAdmin, logout, setIsLogout
  }), [userToken, user, isAdmin, setIsLogout])
  
  if (isAppLoading) {
    return <div className="pageLoaderContainer"><div className="pageLoader"></div></div>
  }
  
  return (
    <Router>
      <AuthContext.Provider value={authValue}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <div className={`appRoot`}>
            {userToken && !isLogout && <Navbar setDropDownOpen={setDropDownOpen} dropDownOpen={dropDownOpen} />}
            <Routes>
              <Route element={<PageTransition />}>
                {!userToken ? (
                  <>
                    <Route path="/auth" element={<LoginRegisterPage setUserToken={setUserToken} />} />
                    <Route path="*" element={<Navigate to="/auth" />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/vacation/:id" element={<Homepage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/vacation/edit/:vacationID" element={<AddEditVacationPage />} />
                    <Route path="/vacation/add" element={<AddEditVacationPage />} />
                    <Route path="/logout" element={<LogoutComponent />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                  </>
                )}
              </Route>
            </Routes>
            <SnackBar />
            {userToken && !isLogout && !isAppLoading && <Footer />}
          </div>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </Router>
  )
}

export default App

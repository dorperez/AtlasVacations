import loginUser from "../functions/loginUser"
import registerUser from "../functions/registerUser"
import { useState } from "react"
import authVideo from "../assets/video.mp4"
import isValidEmail from "../functions/utils/isEmailValid"
import '../styles/loginRegisterScreenStyle.scss'
import { useNavigate } from "react-router-dom"

interface LoginRegisterPageProps {
    setUserToken: (user: string) => void
}

const LoginRegisterPage = ({ setUserToken }: LoginRegisterPageProps) => {

    const navigation = useNavigate()

    // Selected Action
    const [selectedAction, setSelectedAction] = useState<number>(0)

    // Email
    const [userEmail, setUserEmail] = useState<string>("")

    // Password
    const [userPasswordRegister, setUserPasswordRegister] = useState<string>("")
    const [userPasswordLogin, setUserPasswordLogin] = useState<string>("")
    const [userPasswordConfirmation, setUserPasswordConfirmation] = useState<string>("")

    // Name
    const [userName, setUserName] = useState<string>("")

    // Last Name
    const [userLastName, setUserLastName] = useState<string>("")

    // IsLoading
    const [isLoading, setIsLoading] = useState(false)

    // Error Messages
    const [registerErrorMessage, setRegisterErrorMessage] = useState<string>("")
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>("")

    // ------------- Validations Style ------------
    // Register
    const [isNameValid, setIsNameValid] = useState(true) // Name
    const [isLastNameValid, setIsLastNameValid] = useState(true) // Last Name
    const [isEmailValidRegister, setIsEmailValidRegister] = useState(true) // Email Register
    const [isPasswordValidRegister, setIsPasswordValidRegister] = useState(true) // Password Register
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true) // Confirm Password
    // Login
    const [isEmailValidLogin, setIsEmailValidLogin] = useState(true) // Email Login
    const [isPasswordValidLogin, setIsPasswordValidLogin] = useState(true) // Password Login
    // ---------------------------------------------


    // Login
    const handleLogin = async (event: any) => {
        event.preventDefault()

        // //console.log(userEmail, userPasswordLogin)
        // //console.log({ isEmailValidLogin, isPasswordValidLogin })

        if (!isValidEmail(userEmail)) {
            setLoginErrorMessage("Please enter valid email")
            setIsEmailValidLogin(false)
            return

        }

        if (userPasswordLogin === "" || userPasswordLogin.length < 4) {
            setLoginErrorMessage("Please enter valid password")
            setIsPasswordValidLogin(false)
            return
        }

        setIsLoading(true)

        const res = await loginUser(userEmail, userPasswordLogin)
        setIsLoading(false)
        //console.log(res)
        if (res.msg !== null) {
            setLoginErrorMessage(res.msg)
        }
        //console.log({ res });

        if (res.data) {
            const token = res.data
            localStorage.setItem("authToken", token)
            setUserToken(token)
            navigation("/")
            //console.log("Token updated ", token);
        }
    }

    // Register
    const handleRegister = async (event: any) => {
        event.preventDefault()

        setIsLoading(true)

        // User Name
        if (userName === "" || userName.length < 2) {
            if(userName.length < 2){
                setRegisterErrorMessage("Name must be over 2 characters long")
            }else{
                setRegisterErrorMessage("Please enter valid name")
            }
            setIsNameValid(false)
            setIsLoading(false)
            return
        }

        // Last Name
        if (userLastName === "" || userLastName.length < 2) {
            if(userLastName.length < 2){
                setRegisterErrorMessage("Name must be over 2 characters long")
            }else{
                setRegisterErrorMessage("Please enter valid name")
            }
            setRegisterErrorMessage("Please enter valid last name")
            setIsLoading(false)
            setIsLastNameValid(false)
            return
        }
        // Email
        if (!isValidEmail(userEmail)) {
            setRegisterErrorMessage("Please enter valid email address")
            setIsLoading(false)
            setIsEmailValidRegister(false)
            return
        }

        // Passwords
        if (userPasswordConfirmation === "" || userPasswordConfirmation.length < 6 || userPasswordRegister === "" || userPasswordRegister.length < 6 || userPasswordConfirmation !== userPasswordRegister) {

            if (userPasswordRegister === "" || userPasswordRegister.length < 6) {
                if (userPasswordRegister.length < 6) {
                    setRegisterErrorMessage("Password must be over 6 characters long")
                } else {
                    setRegisterErrorMessage("Please enter valid Confirmation Password")
                }
                setIsLoading(false)
                setIsPasswordValidRegister(false)
                return
            }

            if (userPasswordConfirmation === "" || userPasswordConfirmation.length < 6) {
                if (userPasswordConfirmation.length < 6) {
                    setRegisterErrorMessage("Password must be over 6 characters long")
                } else {
                    setRegisterErrorMessage("Please enter valid Confirmation Password")
                }
                setIsLoading(false)
                setIsConfirmPasswordValid(false)
                return
            }

            if (userPasswordConfirmation !== userPasswordRegister) {
                setRegisterErrorMessage("Passwords do not match")
                setIsConfirmPasswordValid(false)
                setIsLoading(false)
                setIsPasswordValidRegister(false)
                return
            }
        }

        const res = await registerUser(userName, userLastName, userEmail, userPasswordRegister)
        //console.log(res)
        
        if (res.data) {
            //console.log("User registered successfully ", res.data);
            setIsLoading(false)
            setRegisterErrorMessage(res.msg + ", Redirecting ...")
            //reset the form without causing an error
            setUserName("")
            setUserLastName("")
            setUserEmail("")
            setUserPasswordRegister("")
            setUserPasswordConfirmation("")
            setUserPasswordLogin("")
            setIsNameValid(true)
            setIsLastNameValid(true)
            setIsEmailValidRegister(true)
            setIsPasswordValidRegister(true)
            setIsConfirmPasswordValid(true)
            setIsEmailValidLogin(true)
            setIsPasswordValidLogin(true)

            setTimeout(() => {
                setSelectedAction(0)
                setRegisterErrorMessage("")
            }, 2000);
        } else {
            setRegisterErrorMessage(res.msg)
            setIsLoading(false)
        }
    }

    // Forgot Password
    const handleForgotPassword = () => {
        alert("That's just a demo buddy")
    }

    return <div className="loginRegisterPageContainer">
        <div className="registerLoginContainer">
            {/* Content Container */}
            <div className="contentContainer">

                {/* Login Register Buttons */}
                <div className="registerLoginButtonsContainer">
                    <div
                        className={`actionContainer ${selectedAction === 0 ? "active" : ""}`}
                        onClick={() => {
                            setSelectedAction(0)
                            setRegisterErrorMessage("")
                        }}
                    >
                        <p>Login</p>
                    </div>
                    <div
                        className={`actionContainer ${selectedAction === 1 ? "active" : ""}`}
                        onClick={() => {
                            setSelectedAction(1)
                            setLoginErrorMessage("")
                        }}
                    >
                        <p>Register</p>
                    </div>
                </div>

                <h2>Atlas Vacations</h2>

                {/* Login Container */}
                <div className={`loginContainer ${selectedAction === 0 ? "active" : ""}`}>
                    <h2>Login:</h2>
                    <form>

                        <input
                            className={`${isEmailValidLogin ? "" : "loginEmail error"}`}
                            type="email"
                            placeholder="Enter Your Email"
                            value={userEmail}
                            onChange={(event) => {
                                setUserEmail(event.target.value)
                                setIsEmailValidLogin(true)
                            }}
                            autoComplete="username"
                        />

                        <input
                            className={`${isPasswordValidLogin ? "" : "loginPassword error"}`}
                            type="password"
                            placeholder="Enter Your Password"
                            value={userPasswordLogin}
                            onChange={(event) => {
                                setUserPasswordLogin(event.target.value)
                                setIsPasswordValidLogin(true)
                            }}
                            autoComplete="new-password" />

                        <div className="buttonContainer">
                            {loginErrorMessage !== "" ? <p className="errorP">{loginErrorMessage}</p> : <></>}
                            <button onClick={handleLogin}>{isLoading ? (
                                <div className="spinner"></div> // Spinner loader
                            ) : (
                                "Login"
                            )}</button>
                            <p className="forgotPassword" onClick={() => setSelectedAction(2)}>Forgot Passowrd?</p>
                        </div>
                    </form>
                </div>

                {/* Register Container */}
                <div className={`registerContainer ${selectedAction === 1 ? "active" : ""}`}>
                    <h2>Register:</h2>
                    <form>
                        <input
                            className={`${isNameValid ? "" : "isNameValid error"}`}
                            required
                            type="text"
                            placeholder="Name..."
                            value={userName}
                            onChange={(event) => {
                                setUserName(event.target.value)
                                setIsNameValid(true)
                            }}
                        />
                        <input
                            className={`${isLastNameValid ? "" : "isLastName error"}`}
                            required
                            type="text"
                            placeholder="Last Name..."
                            value={userLastName}
                            onChange={(event) => {
                                setUserLastName(event.target.value)
                                setIsLastNameValid(true)
                            }}
                        />
                        <input
                            className={`${isEmailValidRegister ? "" : "isEmailValidRegister error"}`}
                            required
                            type="email"
                            placeholder="Email Address..."
                            value={userEmail}
                            onChange={(event) => {
                                setUserEmail(event.target.value)
                                setIsEmailValidRegister(true)
                            }}
                            autoComplete="username"
                        />
                        <input
                            className={`${isPasswordValidRegister ? "" : "isPasswordValidRegister error"}`}
                            required
                            type="password"
                            placeholder="Password..."
                            value={userPasswordRegister}
                            onChange={(event) => {
                                setUserPasswordRegister(event.target.value)
                                setIsPasswordValidRegister(true)
                            }}
                            autoComplete="new-password"
                        />
                        <input
                            className={`${isConfirmPasswordValid ? "" : "isConfirmPasswordValid error"}`}
                            required
                            type="password"
                            placeholder="Password Confirmation..."
                            value={userPasswordConfirmation}
                            onChange={(event) => {
                                setUserPasswordConfirmation(event.target.value)
                                setIsPasswordValidRegister(true)
                                setIsConfirmPasswordValid(true)
                            }}
                            autoComplete="new-password"
                        />

                        <div className="buttonContainer">
                            {registerErrorMessage !== "" ? <p className="errorP">{registerErrorMessage}</p> : <></>}
                            <button onClick={handleRegister}>{isLoading ? (
                                <div className="spinner"></div> // Spinner loader
                            ) : (
                                "Register"
                            )}</button>
                        </div>
                    </form>
                </div>

                {/* Forgot Password */}
                <div className={`forgotPasswordContainer ${selectedAction === 2 ? "active" : ""}`}>

                    <div className="forgotPasswordTitlesContainer">
                        <h2>Forgot Your Password?</h2>
                        <p>That's fine, we all have potato brain sometimes...</p>
                    </div>

                    <form>
                        <input
                            className="forgotPasswordEmailInput"
                            required
                            type="email"
                            placeholder="Your Email Address..."
                            value={userEmail}
                            onChange={(event) => setUserEmail(event.target.value)}
                            autoComplete="username"
                        />

                        <div className="buttonContainer">
                            {registerErrorMessage !== "" ? <p className="errorP">{registerErrorMessage}</p> : <></>}
                            <button onClick={handleForgotPassword}>{isLoading ? (
                                <div className="spinner"></div> // Spinner loader
                            ) : (
                                "Send Verification Email"
                            )}</button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Image Container */}
            <div className="imageContainer">
                <video
                    src={authVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>

        </div>
    </div >
}

export default LoginRegisterPage
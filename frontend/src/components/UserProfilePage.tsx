import { useContext, useEffect, useState } from "react"
import AuthContext from "../context/AuthContext"
import "../styles/userProfilePage.scss"
import getUserLikedBacationsByUserID from "../functions/getUserLikedVacationsByUserID"
import getAllVacations from "../functions/getAllVacations"
import VacationType from "../types/VacationType"
import { Link } from "react-router-dom"
import { LuPlaneLanding, LuPlaneTakeoff } from "react-icons/lu"
import dateToString from "../functions/utils/dateToString"
import removeVacationFromLiked from "../functions/removeVacationFromLiked"
import ConfirmPopup from "./ConfirmPopup"

const UserProfilePage = () => {
    const { user, isAdmin, userToken } = useContext(AuthContext)
    const [userLikedVacations, setUserLikedVacations] = useState<VacationType[]>([])
    const [allVacations, setAllVacations] = useState<VacationType[]>([])
    const [chosenVacation, setChosenVacation] = useState<VacationType | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userToken || !user?.userID) return

        const fetchVacationsAndFollowers = async () => {
            if (!userToken || !user?.userID) return


            try {
                const [vacationsRes, followersRes] = await Promise.all([
                    getAllVacations(userToken),
                    getUserLikedBacationsByUserID(userToken, user.userID),
                ])

                setAllVacations(vacationsRes.data)
                setUserLikedVacations(followersRes.data)

                //console.log("Vacations:", vacationsRes.data)
                //console.log("User liked vacations:", followersRes.data)
            } catch (error) {
                console.error("Error fetching vacations or liked vacations:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchVacationsAndFollowers()
    }, [user, userToken])

    const handleRemoveFromLiked = (vacationID: number) => {
        const vacationToDelete = allVacations.find((vacation) => vacation.vacationID === vacationID)
        if (!vacationToDelete) return
        setChosenVacation(vacationToDelete)
        setShowConfirmDialog(true)
    }

    const [fadingOutVacationId, setFadingOutVacationId] = useState<number | null>(null)
    const confirmRemove = async () => {
        setShowConfirmDialog(false)
        if (!userToken || !user?.userID || !chosenVacation) return

        const vacationID = chosenVacation.vacationID

        // Start fade out
        setFadingOutVacationId(vacationID)

        // Wait for animation to complete (e.g., 500ms)
        setTimeout(async () => {
            if (!userToken || !user?.userID || !chosenVacation) return

            try {
                await removeVacationFromLiked(userToken, user.userID, vacationID)
                setUserLikedVacations((prev) =>
                    prev.filter((v) => v.vacationID !== vacationID)
                )
            } catch (err) {
                console.error("Failed to remove vacation:", err)
            }

            setFadingOutVacationId(null)
            setChosenVacation(null)
        }, 500) // Match with your CSS duration
    }

    const cancelRemove = () => {
        setChosenVacation(null)
        setShowConfirmDialog(false)
    }


    return (
        <div className="userProfilePageContainer">
            {loading ? (
                <div className="pageLoaderContainer">
                    <div className="pageLoader"></div>
                </div>
            ) : (
                <div className="cardContainer">
                    <h1 className="profileTitle">{user?.name || "User"}'s Profile</h1>
    
                    <div className="profileInfo">
                        <div className="infoRow">
                            <span className="label">Name:</span>
                            <span className="value">{user?.name || "N/A"}</span>
                        </div>
                        <div className="infoRow">
                            <span className="label">Email:</span>
                            <span className="value">{user?.email || "N/A"}</span>
                        </div>
                        <div className="infoRow">
                            <span className="label">Role:</span>
                            <span className="value">{isAdmin ? "Admin" : "User"}</span>
                        </div>
                    </div>
    
                    {userLikedVacations.length > 0 && (
                        <div className="followedVacationsSection">
                            <h2 className="sectionTitle">Followed Vacations</h2>
                            <ul className="vacationsList">
                                {userLikedVacations.map((likedVacation) => {
                                    const fullVacation = allVacations.find(
                                        (v) => v.vacationID === likedVacation.vacationID
                                    )
    
                                    return fullVacation ? (
                                        <li
                                            className={`vacationItem ${fadingOutVacationId === fullVacation.vacationID ? "fade-out" : ""}`}
                                            key={fullVacation.vacationID}
                                        >
                                            <Link
                                                to={`/vacation/${fullVacation.vacationID}`}
                                                state={{ from: "profile" }}
                                            >
                                                <img
                                                    src={`http://localhost:3000/vacations-images/${fullVacation.imageName}`}
                                                    alt={fullVacation.title}
                                                    className="vacationImage"
                                                />
                                            </Link>
    
                                            <div className="vacationContent">
                                                <Link
                                                    to={`/vacation/${fullVacation.vacationID}`}
                                                    state={{ from: "profile" }}
                                                >
                                                    <h3 className="vacationDestination">{fullVacation.title}</h3>
                                                    <div className="vacationDates">
                                                        <span className="dateWrapper">
                                                            <span className="dateIcon"><LuPlaneTakeoff /></span>
                                                            {dateToString(fullVacation.startDate)}
                                                        </span>
                                                        <span className="dateSeparator">—</span>
                                                        <span className="dateWrapper">
                                                            <span className="dateIcon"><LuPlaneLanding /></span>
                                                            {dateToString(fullVacation.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="vacationPrice">${fullVacation.price}</div>
                                                </Link>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        handleRemoveFromLiked(fullVacation.vacationID)
                                                    }}
                                                    className="removeFromLikedButton"
                                                >
                                                    Remove From Liked
                                                </button>
                                            </div>
                                        </li>
                                    ) : null
                                })}
                            </ul>
                        </div>
                    )}
                    <ConfirmPopup
                        isOpen={showConfirmDialog}
                        message="Are you sure you want to remove this vacation from liked?"
                        subMessage={chosenVacation?.title}
                        onConfirm={confirmRemove}
                        onCancel={cancelRemove}
                    />
                </div>
            )}
        </div>
    )
}

export default UserProfilePage

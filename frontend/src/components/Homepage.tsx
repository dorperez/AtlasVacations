import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import "../styles/homePageScreenStyle.scss"
import getAllVacations from "../functions/getAllVacations"
import VacationType from "../types/VacationType"
import { useNavigate } from "react-router-dom"
import getUserLikedVacationsByUserID from "../functions/getUserLikedVacationsByUserID"
import FollowingType from "../types/FollowingType"
import addVacationToLiked from "../functions/addVacationToLiked"
import removeVacationFromLiked from "../functions/removeVacationFromLiked"
import getAllFollowers from "../functions/getAllFollowers"
import { IoSearch } from "react-icons/io5"
import { BsSortDownAlt } from "react-icons/bs"
import AuthContext from "../context/AuthContext"
import ConfirmPopup from "./ConfirmPopup"
import { showSnackbar } from "../functions/utils/snackbar"
import VacationCard from "./VacationCard"
import removeVacation from "../functions/removeVacation"
import VacationDetailsPage from "./VacationDetailsPage"
import getVacationByID from "../functions/getVacationByID"
import checkTokenExpiration from "../functions/checkTokenExpiration"

const ITEMS_PER_PAGE = 10

const Homepage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    const { userToken, user, isAdmin, setUserToken } = useContext(AuthContext) || {}
    const userID = user?.userID


    // UI State
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [chosenVacation, setChosenVacation] = useState<VacationType | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Data State
    const [allVacations, setAllVacations] = useState<VacationType[]>([])
    const [userLikedVacationsList, setUserLikedVacationsList] = useState<FollowingType[]>([])
    const [allVacationsFollowersList, setAllVacationsFollowersList] = useState<FollowingType[]>([])
    const [selectedVacation, setSelectedVacation] = useState<VacationType | null>(null)
    const [dataFullyLoaded, setDataFullyLoaded] = useState(false)

    // Check if token is expired
    useEffect(() => {
        if (!userToken) {
            navigate("/auth")
        }
    }, [userToken, navigate])

    // handle navigation route based on selected vacation
    useEffect(() => {
        if (selectedVacation && location.pathname === '/') {
            navigate(`/vacation/${selectedVacation.vacationID}`, { state: { from: "homepage" } })
        }
    }, [selectedVacation, navigate, location.pathname])

    // handle search and filter params from URL
    useEffect(() => {

        const query = searchParams.get("query") || ""
        const filter = parseInt(searchParams.get("filter") || "0", 10)
        const page = parseInt(searchParams.get("page") || "1", 10)

        setSearchQuery(query)
        setFilterType(filter)
        setCurrentPage(!isNaN(page) ? page : 1)

    }, [searchParams])

    const fetchFromApi = async () => {

        if (!userToken) return

        const currentTime = new Date().getTime()
        setIsLoading(true)

        // Fetch data from API
        const [vacationsRes, followersRes, likedRes] = await Promise.all([
            getAllVacations(userToken),
            getAllFollowers(userToken),
            userID ? getUserLikedVacationsByUserID(userToken, userID) : Promise.resolve({ data: [] })
        ])

        // console.log("Fetched from API");
        // console.log("allVacationsFollowersList: ", allVacationsFollowersList);
        // console.log("userLikedVacationsList: ", userLikedVacationsList);
        // console.log("usertoken: ", userToken);
        // console.log("userID: ", userID);
        

        setAllVacations(vacationsRes.data || [])
        setAllVacationsFollowersList(followersRes.data || [])
        setUserLikedVacationsList(likedRes.data || [])

        // Save to local storage
        localStorage.setItem("allVacationsTime", currentTime.toString())
        localStorage.setItem("allVacations", JSON.stringify(vacationsRes.data))

        setIsLoading(false)
    }

    const fetchAllVacationsFromLocalStorage = async() => {
        const localVacations = localStorage.getItem("allVacations") || null
        if (localVacations) {
            setAllVacations(JSON.parse(localVacations) || [])
            // set time
            const localVacationsTime = localStorage.getItem("allVacationsTime")
            if (localVacationsTime) {
                const currentTime = new Date().getTime()
                localStorage.setItem("allVacationsTime", currentTime.toString())
            }
        }

        if(!userToken) return
        
        const [followersRes, likedRes] = await Promise.all([
            getAllFollowers(userToken),
            userID ? getUserLikedVacationsByUserID(userToken, userID) : Promise.resolve({ data: [] })
        ])

        setAllVacationsFollowersList(followersRes.data || [])
        setUserLikedVacationsList(likedRes.data || [])

    }

    const fetchData = useCallback(async () => {
        if (!userToken) return

        setIsLoading(true)
        setDataFullyLoaded(false) // Reset the fully loaded state
        try {

            // Check if data is already in local storage
            const localVacations = localStorage.getItem("allVacations")

            // if data exists in local storage and two minutes have not passed
            const currentTime = new Date().getTime()
            const localVacationsTime = localStorage.getItem("allVacationsTime")
            const twoMinutes = 2 * 60 * 1000
            const isLocalVacationsValid = localVacationsTime &&
                (currentTime - parseInt(localVacationsTime)) < twoMinutes

            if (isLocalVacationsValid && localVacations) {
                await fetchAllVacationsFromLocalStorage()
                return
            }

            // Fetch all vacations and followers
            await fetchFromApi()

        } catch (error) {
            console.error("Error loading data:", error)
            showSnackbar("Error loading vacation data")
        } finally {
            setIsLoading(false)
        }
    }, [userToken, userID])

    // Check for path like /vacation/:id
    const fetchVacationById = useCallback(async (vacationID: number) => {
        if (!userToken || !vacationID) return

        setIsLoading(true)
        try {
            const res = await getVacationByID(userToken, Number(vacationID))
            const vacation = res.data[0]
            if (vacation) {
                setSelectedVacation(vacation)
            } else {
                showSnackbar("Vacation not found")
                navigate("/")
            }
        } catch (err) {
            console.error("Error fetching vacation by ID:", err)
            showSnackbar("Error fetching vacation details")
            navigate("/")
        } finally {
            setIsLoading(false)
        }
    }, [userToken, navigate])

    useEffect(() => {
        // Check for path like /vacation/:id
        const pathParts = location.pathname.split("/")
        const vacationID = pathParts[pathParts.length - 1]

        if (pathParts.length > 2 && pathParts[1] === "vacation" && vacationID && !isNaN(Number(vacationID))) {
            fetchVacationById(Number(vacationID))
        } else {
            fetchData()
        }
    }, [location, fetchData, fetchVacationById])

    useEffect(() => {
        // Refresh list when user comes back from AddEditVacationPage
        if (location.state?.from === 'AddEditVacationPage') {
            fetchFromApi()
        }
    }, [location]);

    const searchFilteredVacations = useMemo(() => {
        if (!searchQuery.trim()) return allVacations
        const query = searchQuery.toLowerCase()
        return allVacations.filter(v => v.title.toLowerCase().includes(query))
    }, [allVacations, searchQuery])

    const filteredVacations = useMemo(() => {
        let result = [...searchFilteredVacations]
        const now = new Date()

        switch (filterType) {
            case 1: // Price (Lower To Higher)
                return [...result].sort((a, b) => Number(a.price) - Number(b.price))
            case 2: // Price (Higher To Lower)
                return [...result].sort((a, b) => Number(b.price) - Number(a.price))
            case 3: // Upcoming Vacations
                return result
                    .filter(v => new Date(v.startDate) > now)
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            case 4: // Live Vacations
                return result.filter(v =>
                    new Date(v.startDate) <= now && new Date(v.endDate) >= now)
            case 5: // Liked Vacations
                return result.filter(v =>
                    userLikedVacationsList.some(liked => liked.vacationID === v.vacationID))
            case 6: // Passed Vacations
                return result.filter(v => new Date(v.endDate) < now)
            case 7: // Longest Vacations
                return [...result].sort((a, b) => {
                    const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime()
                    const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime()
                    return bDuration - aDuration
                })
            case 8: // Shortest Vacations
                return [...result].sort((a, b) => {
                    const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime()
                    const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime()
                    return aDuration - bDuration
                })
            case 9: // Most Liked Vacations
                return [...result].sort((a, b) => {
                    const aLikes = allVacationsFollowersList.filter(f => f.vacationID === a.vacationID).length
                    const bLikes = allVacationsFollowersList.filter(f => f.vacationID === b.vacationID).length
                    return bLikes - aLikes
                })
                


             default: //By Name
            return [...result].sort((a, b) => a.title.localeCompare(b.title))
        }
    }, [searchFilteredVacations, filterType, userLikedVacationsList])

    const totalPages = Math.ceil(filteredVacations.length / ITEMS_PER_PAGE)
    const paginatedVacations = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredVacations.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredVacations, currentPage])

    const handleLikeClick = async (vacationID: number) => {
        if (!userToken || !userID) return
        const isLiked = userLikedVacationsList.some(v => v.vacationID === vacationID)

        try {
            if (isLiked) {
                await removeVacationFromLiked(userToken, userID, vacationID)
                setUserLikedVacationsList(prev => prev.filter(v => v.vacationID !== vacationID))
                setAllVacationsFollowersList(prev =>
                    prev.filter(f => !(f.vacationID === vacationID && f.userID === userID))
                )
            } else {
                await addVacationToLiked(userToken, userID, vacationID)
                setUserLikedVacationsList(prev => [...prev, { userID, vacationID }])
                setAllVacationsFollowersList(prev => [...prev, { userID, vacationID }])
            }
        } catch (err) {
            console.error("Like/unlike error:", err)
        }
    }

    const changePage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
        setIsTransitioning(true)
        setTimeout(() => {
            setCurrentPage(newPage)
            setSearchParams(prev => {
                const params = new URLSearchParams(prev)
                params.set("page", newPage.toString())
                return params
            })
            setIsTransitioning(false)
        }, 300)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        setSearchParams({ query: value, filter: String(filterType), page: "1" })
        setCurrentPage(1)
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilter = Number(e.target.value)
        setFilterType(newFilter)
        setSearchParams({ query: searchQuery, filter: String(newFilter), page: "1" })
        setCurrentPage(1)
    }

    const handleClearButton = () => {
        setSearchQuery("")
        setFilterType(0)
        setCurrentPage(1)
        setSearchParams({})
    }

    const handleDeleteVacation = async (vacation: VacationType) => {
        setChosenVacation(vacation)
        setShowConfirmDialog(true)
    }

    const handleEditVacation = (vacation: VacationType) => {
        setChosenVacation(vacation)
        navigate(`/edit/${vacation.vacationID}`)
    }

    const confirmDelete = async () => {
        setShowConfirmDialog(false)
        if (chosenVacation && userToken) {
            const updatedAllVacations = allVacations.filter(
                vacation => vacation.vacationID !== chosenVacation.vacationID
            )
            const updatedFollowersList = allVacationsFollowersList.filter(
                follower => follower.vacationID !== chosenVacation.vacationID
            )
            const updatedLikedList = userLikedVacationsList.filter(
                liked => liked.vacationID !== chosenVacation.vacationID
            )

            removeVacation(userToken, chosenVacation.vacationID).then(() => {
                
                setAllVacations(updatedAllVacations)
                setAllVacationsFollowersList(updatedFollowersList)
                setUserLikedVacationsList(updatedLikedList)

                localStorage.setItem("allVacations", JSON.stringify(updatedAllVacations))
                localStorage.setItem("allFollowers", JSON.stringify(updatedFollowersList))
                localStorage.setItem("likedVacations", JSON.stringify(updatedLikedList))

                showSnackbar("Vacation Deleted Successfully")
                if (selectedVacation && chosenVacation?.vacationID === selectedVacation.vacationID) {
                    handleBackButton()
                }
            }).catch(err => {
                console.error("Error deleting vacation:", err)
                showSnackbar("Error: " + err.message)
            })

            setChosenVacation(null)

        }
    }

    const cancelDelete = () => {
        setChosenVacation(null)
        setShowConfirmDialog(false)
    }

    const handleVacationSelect = (vacation: VacationType) => {
        setSelectedVacation(vacation)
    }

    const handleBackButton = () => {
        const from = location.state?.from

        //console.log("Back button coming from:", from)

        setIsLoading(true)
        setSelectedVacation(null)

        if (from === "profile") {
            navigate("/profile")
        } else {
            navigate("/")
        }
    }


    return (
        <div className="homepageContainer">
            {!selectedVacation ? <div className="contentContainer">
                <div className="topBarContainer">
                    <div className="searchAndFilterBarContainer">
                        {/* Search and filter components would go here */}
                        <div className="searchContainer">
                            <IoSearch className="searchIcon" />
                            <input onChange={handleSearch} value={searchQuery} type="text" placeholder="Search...." />
                        </div>
                        <div className="filterContainer">
                            <BsSortDownAlt className="sortIcon" />
                            <select value={filterType} onChange={handleFilterChange}>
                                <option value={0}>Name</option>
                                <option value={1}>Price (Lower To Higher)</option>
                                <option value={2}>Price (Higher To Lower)</option>
                                <option value={3}>Upcoming Vacations</option>
                                <option value={4}>Live Vacations</option>
                                <option value={5}>Liked Vacations</option>
                                <option value={6}>Passed Vacations</option>
                                <option value={7}>Longest Vacations</option>
                                <option value={8}>Shortest Vacations</option>
                                <option value={9}>Most Liked</option>
                            </select>
                            {searchQuery !== "" || filterType !== 0 ? <button onClick={handleClearButton}>Clear</button> : <></>}
                        </div>
                    </div>

                    <div className="showingItemsContainer">
                        <h5>Total Vacations: {filteredVacations.length}</h5>
                    </div>

                </div>
                <div className={`vacationsContainer ${isTransitioning ? 'fading' : ''}`}>
                    {isLoading ? (
                        <div className="pageLoaderContainer">
                            <div className="pageLoader"></div>
                        </div>
                    ) : filteredVacations.length === 0 ? (
                        <div className="emptyVacationListContainer">
                            No Vacations Found ...
                        </div>
                    ) : (
                        paginatedVacations.map((vacation: VacationType) => {
                            const isLiked = !!userLikedVacationsList.find(v => v.vacationID === vacation.vacationID)
                            return (
                                <VacationCard
                                    key={vacation.vacationID}
                                    vacation={vacation}
                                    isLiked={isLiked}
                                    isAdmin={isAdmin}
                                    orderNowClicked={handleVacationSelect}
                                    onLikeClick={handleLikeClick}
                                    onEditClick={handleEditVacation}
                                    followersCount={allVacationsFollowersList.filter(f => f.vacationID === vacation.vacationID).length}
                                    onDeleteClick={handleDeleteVacation}
                                />
                            )
                        })
                    )}
                </div>

                {paginatedVacations.length > 0 ? <div className="paginationButtonsContainer">
                    <button
                        disabled={currentPage === 1 || isTransitioning}
                        onClick={() => changePage(currentPage - 1)}
                        className={isTransitioning ? 'disabled' : ''}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages || isTransitioning}
                        onClick={() => changePage(currentPage + 1)}
                        className={isTransitioning ? 'disabled' : ''}
                    >
                        Next
                    </button>
                </div> : <></>}
            </div> : <VacationDetailsPage
                vacation={selectedVacation}
                isAdmin={isAdmin}
                isLiked={!!userLikedVacationsList.find(v => v.vacationID === selectedVacation?.vacationID)}
                onLikeClick={handleLikeClick}
                onEditClick={handleEditVacation}
                onDeleteClick={handleDeleteVacation}
                followersCount={allVacationsFollowersList.filter(f => f.vacationID === selectedVacation?.vacationID).length}
                onGoBack={handleBackButton}
            />
            }

            <ConfirmPopup
                isOpen={showConfirmDialog}
                message="Are you sure you want to delete this vacation?"
                subMessage={chosenVacation?.title}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    )
}

export default Homepage
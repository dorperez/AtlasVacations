import "../styles/newEditVacationPageStyle.scss"
import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import VacationType from "../types/VacationType"
import getVacationByID from "../functions/getVacationByID"
import AuthContext from "../context/AuthContext"
import VacationCard from "./VacationCard"
import editVacation from "../functions/editVacation"
import formatDateToInput from "../functions/utils/formatDateToInput"
import addNewVacation from "../functions/addNewVacation"

const AddEditVacationPage = () => {

    const { vacationID } = useParams()
    const { userToken } = useContext(AuthContext)
    const navigate = useNavigate()

    // General
    const isEditMode = !!vacationID && vacationID !== "new"
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [isSubmit, setIsSubmit] = useState(false)
    const [feedBackMessage, setFeedbackMessage] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const currentDate = new Date().toISOString()
    const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const [currentVacation, setCurrentVacation] = useState<VacationType>({
        vacationID: 0,
        title: "",
        description: "",
        startDate: currentDate,
        endDate: oneDayLater,
        price: 0,
        imageName: ""
    })

    // Image
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState(currentVacation.imageName ? `http://localhost:3000/vacations-images/${currentVacation.imageName}` : "http://localhost:3000/vacations-images/placeholder-image.png")

    useEffect(() => {
        if (isEditMode && userToken) {
            setIsPageLoading(true)
            getVacationByID(userToken, Number(vacationID)).then((res) => {
                setCurrentVacation(res.data[0])
                setPreviewUrl(res.data[0].imageName ? `http://localhost:3000/vacations-images/${res.data[0].imageName}` : "http://localhost:3000/vacations-images/placeholder-image.png")
                setImageFile(null)
                setIsPageLoading(false)
                //console.log("Reponse: ", res)
            }).catch((err: any) => {
                //console.log("Error:", err.message)
                setIsPageLoading(false)
            })

        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files, type } = e.target

        setFeedbackMessage("")

        if (type === "file" && files) {
            const file = files[0]
            setCurrentVacation((prev) => ({
                ...prev,
                imageName: file.name
            }))
        } else if (name === "price") {
            const numericValue = Number(value)

            if (value === "" || (numericValue >= 1 && numericValue <= 10000)) {
                setCurrentVacation((prev) => ({
                    ...prev,
                    [name]: numericValue
                }))
            }
            return
        } else if (name === "startDate" && currentVacation.endDate && new Date(value) > new Date(currentVacation.endDate)) {
            //console.log('Input value:', value)
            setFeedbackMessage("Start date cannot be after end date.")
            return
        } else if (name === "endDate" && currentVacation.startDate && new Date(value) < new Date(currentVacation.startDate)) {
            setFeedbackMessage("End date cannot be before start date.")
            return
        } else {
            setCurrentVacation((prev) => ({
                ...prev,
                [name]: value
            }))
            //console.log("Current vacation: ", currentVacation)
        }
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null

        setFeedbackMessage(null)
        setPreviewUrl("")
        setIsUploadingImage(true)

        if (file && userToken) {
            const file = event.target.files ? event.target.files[0] : null

            if (file) {
                setImageFile(file)
                setPreviewUrl(URL.createObjectURL(file)) // Only show preview

                setCurrentVacation((prev) => ({
                    ...prev,
                    imageName: file.name
                }))
            }

            setIsUploadingImage(false)

        } else {
            setIsUploadingImage(false)
        }
    }

    const handleSubmit = async () => {

        //validation
        if (!currentVacation.title) {
            setFeedbackMessage("Please enter a title")
            return
        } else if (!currentVacation.description) {
            setFeedbackMessage("Please enter a description")
            return
        } else if (currentVacation.description.length > 249) {
            setFeedbackMessage("Description must be less than 250 characters")
            return
        }
        if (!currentVacation.startDate) {
            setFeedbackMessage("Please select a start date")
            return
        }
        if (!currentVacation.endDate) {
            setFeedbackMessage("Please select an end date")
            return
        }
        if (!currentVacation.price || currentVacation.price < 1 || currentVacation.price > 10000) {
            setFeedbackMessage("Please enter valid price")
            return
        }
        if (!currentVacation.imageName) {
            setFeedbackMessage("Please upload an image")
            return
        }


        const start = new Date(currentVacation.startDate)
        const end = new Date(currentVacation.endDate)
        if (start >= end) {
            setFeedbackMessage("Start date must be before end date...")
            return
        }

        setIsSubmit(true)
        setFeedbackMessage(null)

        if (!isEditMode) {
            if (userToken && imageFile) {
                await addNewVacation(userToken, currentVacation, imageFile)
                    .then((res) => {
                        setTimeout(() => {
                            setIsSubmit(false)
                            setFeedbackMessage(res.msg)
                        }, 1000)
                    })
                    .catch((err: any) => {
                        //console.log("Error: ", err)
                        setIsSubmit(false)
                        setFeedbackMessage(err.msg)
                    })
            } else {
                setFeedbackMessage("Missing image or token.")
            }
        } else {
            const formData = new FormData()
            formData.append("title", currentVacation.title)
            formData.append("description", currentVacation.description)
            formData.append("startDate", currentVacation.startDate)
            formData.append("endDate", currentVacation.endDate)
            formData.append("price", String(currentVacation.price))

            if (imageFile) {
                formData.append("image", imageFile)
            }

            const vacationData = {
                title: currentVacation.title,
                description: currentVacation.description,
                startDate: currentVacation.startDate,
                endDate: currentVacation.endDate,
                price: currentVacation.price,
                imageFile: imageFile,
            }

            if (userToken && vacationData) {
                const response = await editVacation(userToken, Number(vacationID), vacationData)
                setTimeout(() => {
                    setIsSubmit(false)
                    setFeedbackMessage(response.msg)
                    setTimeout(() => {
                        navigate('/', { state: { from: 'AddEditVacationPage' } })
                    }, 1000)
                }, 1000)
            }
        }
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    if (isPageLoading) {
        return (
            <div className="pageSpinnerContainer">
                <div className="pageSpinner"></div>
            </div>
        )
    }

    return (
        <div className="newVacationAndPreviewContainer">

            <div className="newVacationDetails">
                {isEditMode ? <h1>Edit Vacation Page</h1> : <h1>New Vacation Page</h1>}
                <div className="inputRow">
                    <input
                        className="vacationNameInput"
                        type="text"
                        placeholder="Vacation Name ..."
                        name="title"
                        maxLength={38}
                        minLength={1}
                        value={currentVacation.title}
                        onChange={(event) => { handleChange(event) }}
                    />
                </div>

                <div className="inputRow">
                    <input
                        className="vacationDescriptionInput"
                        type="text"
                        placeholder="Vacation Description ... "
                        name="description"
                        value={currentVacation.description}
                        maxLength={249}
                        onChange={(event) => { handleChange(event) }}
                    />
                </div>

                <div className="inputRow">
                    <input
                        className="vacationStartDateInput"
                        type="datetime-local"
                        placeholder="Vacation Start Date ..."
                        name="startDate"
                        value={formatDateToInput(currentVacation.startDate)}
                        min={formatDateToInput(new Date())}
                        onChange={(event) => { handleChange(event) }}
                        onClick={(event) => {
                            const input = event.target as HTMLInputElement
                            if (typeof input.showPicker === 'function') {
                                input.showPicker()
                            }
                        }}
                    />
                </div>

                <div className="inputRow">
                    <input
                        className="vacationEndDateInput"
                        type="datetime-local"
                        placeholder="Vacation End Date ..."
                        name="endDate"
                        min={currentVacation.startDate ?
                            formatDateToInput(currentVacation.startDate) :
                            new Date().toISOString().slice(0, 16)
                        }
                        value={formatDateToInput(currentVacation.endDate)}
                        onChange={(event) => { handleChange(event) }}
                        onClick={(event) => {
                            const input = event.target as HTMLInputElement
                            if (typeof input.showPicker === 'function') {
                                input.showPicker()
                            }
                        }}
                    />
                </div>

                <div className="inputRow">
                    <input
                        className="vacationPriceInput"
                        type="number"
                        min={1}
                        max={10000}
                        placeholder="Vacation Price ..."
                        name="price"
                        value={currentVacation.price}
                        onChange={(event) => { handleChange(event) }}
                    />
                </div>

                <div className="inputRow">
                    <div className="uploadImageButtonContainer">
                        <button className="uploadImageButton" type="button" onClick={handleUploadClick}>
                            {isUploadingImage ? (
                                <div className="spinner"></div>
                            ) : (
                                <span>{currentVacation.imageName ? "Change Image" : "Upload Image"}</span>
                            )}
                        </button>
                        <img className="vacationImagePreview" src={previewUrl} alt="Vacation Preview" />
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                </div>

                <div className="buttonContainer">
                    {feedBackMessage && <p className="errorP">{feedBackMessage}</p>}
                    <button onClick={handleSubmit}>
                        {isSubmit ? (
                            <div className="spinner"></div>
                        ) : (
                            "Save Vacation"
                        )}
                    </button>
                </div>
            </div>

            <div className="newVacationPreview">
                <VacationCard vacation={currentVacation} previewUrl={previewUrl} />
            </div>
        </div>
    )

}

export default AddEditVacationPage
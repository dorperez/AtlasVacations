import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaArrowLeft } from "react-icons/fa";
import { LuPlaneLanding, LuPlaneTakeoff } from "react-icons/lu";
import { MdEdit, MdDelete } from "react-icons/md";
import VacationType from "../types/VacationType";
import dateToString from "../functions/utils/dateToString";
import calculateTimeDifference from "../functions/utils/calculateTimeDifference";
import "../styles/vacationDetailsPageStyle.scss";
import checkTokenExpiration from "../functions/checkTokenExpiration";
import AuthContext from "../context/AuthContext";

type Props = {
    vacation?: VacationType | null,
    isAdmin?: boolean,
    isLiked?: boolean,
    onLikeClick?: (vacationID: number) => void,
    onEditClick?: (vacation: VacationType) => void,
    onDeleteClick?: (vacation: VacationType) => void,
    followersCount?: number,
    onGoBack?: () => void
};

const VacationDetailsPage: React.FC<Props> = ({
    vacation,
    isAdmin,
    isLiked,
    onLikeClick,
    onEditClick,
    onDeleteClick,
    followersCount,
    onGoBack
}) => {

    const [quantity, setQuantity] = useState<number>(1);
    const {userToken, setUserToken} = useContext(AuthContext)
    const navigate = useNavigate();
    
    if (userToken) {
        checkTokenExpiration(userToken).then((isExpired) => {
            if (isExpired) {
                setUserToken(null)
                navigate("/auth");
            }
            return
        })
    }

    const handleGoBack = () => {
        if (onGoBack) {
          onGoBack();
        }
      };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const tripDuration = vacation
        ? calculateTimeDifference(vacation.startDate, vacation.endDate)
        : "";

    if (!vacation) {
        return (
            <div className="vacationDetailsError">
                <h2>Vacation not found</h2>
                <button onClick={handleGoBack}>Go Back</button>
            </div>
        );
    }

    const imageUrl = `http://localhost:3000/vacations-images/${vacation.imageName}`;
    const totalPrice = vacation.price * quantity;

    return (
        <div className="vacationDetailsContainer">
            <div className="detailsBackNav">
                <button onClick={handleGoBack} className="backButton">
                    <FaArrowLeft /> Go Back
                </button>
            </div>

            <div className="detailsHeaderSection">
                <div className="heroImageContainer">
                    <img src={imageUrl} alt={vacation.title} className="heroImage" />

                    <div className="detailsOverlayInfo">
                        <h1>{vacation.title}</h1>
                    </div>

                    <div className="detailsActionPanel">
                        {!isAdmin && onLikeClick ? (
                            <div
                                onClick={() => onLikeClick(vacation.vacationID)}
                                className={`detailsLikeButton ${isLiked ? "liked" : ""}`}
                            >
                                <FaHeart />
                                <span>{followersCount ?? 0} Likes</span>
                            </div>
                        ) : null}

                        {isAdmin && (
                            <div className="detailsAdminPanel">
                                {onDeleteClick && (
                                    <button
                                        onClick={() => onDeleteClick(vacation)}
                                        className="detailsAdminButton deleteButton"
                                    >
                                        <MdDelete />
                                        <span>Delete</span>
                                    </button>
                                )}
                                {onEditClick && (
                                    <Link to={`/vacation/edit/${vacation.vacationID}`}>
                                        <button className="detailsAdminButton editButton">
                                            <MdEdit />
                                            <span>Edit</span>
                                        </button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="detailsMainContent">
                <div className="detailsInfoSection">
                    <div className="detailsCard">
                        <h2>Trip Details</h2>
                        <div className="detailsItem">
                            <FaCalendarAlt className="detailsIcon" />
                            <div className="detailsItemContent">
                                <h3>Duration</h3>
                                <p>{tripDuration}</p>
                            </div>
                        </div>

                        <div className="detailsDateInfo">
                            <div className="detailsDateItem">
                                <LuPlaneTakeoff className="flightIcon takeoff" />
                                <div>
                                    <span>Departure </span>
                                    <p>{dateToString(vacation.startDate)}</p>
                                </div>
                            </div>

                            <div className="detailsDateItem">
                                <LuPlaneLanding className="flightIcon landing" />
                                <div>
                                    <span>Return</span>
                                    <p>{dateToString(vacation.endDate)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="detailsLocation">
                            <FaMapMarkerAlt className="detailsIcon" />
                            <div className="detailsItemContent">
                                <h3>Location</h3>
                                <p className="detailsLocation">{vacation.title}</p>
                            </div>
                        </div>

                        <div className="detailsItem">
                            <FaMoneyBillWave className="detailsIcon" />
                            <div className="detailsItemContent">
                                <h3>Price per person</h3>
                                <p className="detailsPrice">${vacation.price}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detailsDescription">
                        <h2>About this vacation</h2>
                        <p>{vacation.description}</p>
                    </div>
                </div>

                <div className="detailsBookingSection">
                    <div className="bookingCard">
                        <h2>Book this vacation</h2>
                        <div className="bookingPrice">
                            <span>Price per person</span>
                            <h3>${vacation.price}</h3>
                        </div>

                        <div className="bookingForm">
                            <div className="formGroup">
                                <label htmlFor="quantity">Number of travelers</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                />
                            </div>

                            <div className="totalPrice">
                                <span>Total price</span>
                                <h2>${totalPrice}</h2>
                            </div>

                            <button className="bookingButton">Book Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VacationDetailsPage;
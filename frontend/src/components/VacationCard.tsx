import { FaHeart } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { LuPlaneLanding, LuPlaneTakeoff } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import dateToString from "../functions/utils/dateToString";
import VacationType from "../types/VacationType";
import "../styles/vacationCardStyle.scss";
import calculateTimeDifference from "../functions/utils/calculateTimeDifference";

type Props = {
    vacation: VacationType;
    isLiked?: boolean;
    isAdmin?: boolean;
    orderNowClicked?: (vacation: VacationType) => void;
    onLikeClick?: (vacationID: number) => void;
    onEditClick?: (vacation: VacationType) => void;
    onDeleteClick?: (vacation: VacationType) => void;
    followersCount?: number;
    previewUrl?: string;
};

const VacationCard: React.FC<Props> = ({
    vacation,
    isLiked,
    isAdmin,
    orderNowClicked,
    onLikeClick,
    onEditClick,
    onDeleteClick,
    followersCount,
    previewUrl
}) => {
    
    const tripDuration = calculateTimeDifference(vacation.startDate, vacation.endDate);
    const imageUrl = previewUrl || `http://localhost:3000/vacations-images/${vacation.imageName}`;

    return (
        <div className="vacationCardContainer">
            <div className="titleImageContainer">
                {!isAdmin && onLikeClick ? (
                    <div className="userLikePanelContainer">
                        <div
                            onClick={() => onLikeClick(vacation.vacationID)}
                            className={`likeButtonContainer ${isLiked ? "liked" : ""}`}
                        >
                            <FaHeart className="likeIcon" />
                            <h6>{followersCount ?? 0}</h6>
                            <h6>Likes</h6>
                        </div>
                    </div>
                ) : null}

                {/* Admin Panel */}
                {isAdmin && (onDeleteClick || onEditClick) ? (
                    <div className="adminLikePanelContainer">
                        {onDeleteClick && (
                            <div
                                onClick={() => onDeleteClick(vacation)}
                                className="adminButtonContainer"
                            >
                                <MdDelete className="deleteIcon" />
                                <h6>Delete</h6>
                            </div>
                        )}
                        {onEditClick && (
                            <Link to={`/vacation/edit/${vacation.vacationID}`}>
                                <div className="adminButtonContainer">
                                    <MdEdit className="editIcon" />
                                    <h6>Edit</h6>
                                </div>
                            </Link>
                        )}
                    </div>
                ) : null}

                <img
                    src={imageUrl}
                    alt={vacation.title}
                    className={"vacationImage"}
                />

                <h2>{vacation.title}</h2>
            </div>

            <div className="vacationDatesContainer">
                <h4>{tripDuration}</h4>
                <div>
                    <LuPlaneTakeoff className="takeoffIcon" />
                    <h5>{dateToString(vacation.startDate)}</h5>
                </div>
                <div className="spacer"></div>
                <div>
                    <LuPlaneLanding className="landingIcon" />
                    <h5>{dateToString(vacation.endDate)}</h5>
                </div>
            </div>

            <p>{vacation.description}</p>
            <h3>{vacation.price}$</h3>
            <button onClick={() => orderNowClicked?.(vacation)}>Order Now</button>

        </div>
    );
};

export default VacationCard;
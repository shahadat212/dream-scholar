import React from "react";
import { FaStar } from "react-icons/fa";

const ReviewCard = ({ review }) => {
    return (
        <div className="flex h-full flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
            <div>
                <p className="flex items-center gap-1 text-sm font-bold text-sun-700">
                    <FaStar /> {review.rating || "N/A"}
                </p>
                <p className="mt-3 text-ink/70">&ldquo;{review.comment}&rdquo;</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
                <img
                    src={review.userImage || "https://ui-avatars.com/api/?name=User"}
                    alt={review.userName}
                    className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                    <p className="text-sm font-bold text-ink">{review.userName}</p>
                    <p className="text-xs text-ink/40">{review.date}</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;

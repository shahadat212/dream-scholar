import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaCheckCircle, FaHeart, FaRegHeart } from "react-icons/fa";
import { FiColumns } from "react-icons/fi";
import Spinner from "./Spinner";

const tagStyles = [
    "bg-violet/10 text-violet",
    "bg-coral/10 text-coral",
    "bg-sun/25 text-sun-700",
];

const COVERAGE = {
    "Full fund": { label: "Full tuition covered", className: "text-mint-700" },
    "Partial fund": { label: "Partial tuition covered", className: "text-sun-700" },
    "Self-fund": { label: "No tuition funding", className: "text-ink/60" },
};

const ScholarCard = ({ scholarship, tagIndex = 0, applied = false, saved = false, savePending = false, onToggleSave, compared = false, onToggleCompare, compareDisabled = false }) => {
    const tagClass = tagStyles[tagIndex % tagStyles.length];
    const isClosed = !!scholarship?.applicationDeadline && scholarship.applicationDeadline < new Date().toISOString().split("T")[0];

    return (
        <div className={`flex flex-col rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] transition-transform hover:-translate-y-1 ${compared ? "ring-2 ring-violet" : ""}`}>
            <div className="flex items-center gap-3">
                <img
                    src={scholarship?.universityImage}
                    alt={scholarship?.universityName}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-bold text-ink">{scholarship?.universityName}</h3>
                    <p className="flex items-center gap-1 text-xs text-ink/40">
                        <FaMapMarkerAlt className="shrink-0" />
                        <span className="truncate">{scholarship?.universityCity}, {scholarship?.universityCountry}</span>
                    </p>
                </div>
                {scholarship?.rating ? (
                    <span
                        className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-sun/25 px-2.5 py-1 text-xs font-bold text-sun-700"
                        title={`${scholarship?.reviewCount} review${scholarship?.reviewCount === 1 ? "" : "s"}`}
                    >
                        <FaStar className="text-[10px]" /> {scholarship.rating}
                    </span>
                ) : (
                    <span className="ml-auto shrink-0 rounded-full bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet">
                        New
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${tagClass}`}>
                    {scholarship?.subjectCategory}
                </span>
                {applied && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">
                        <FaCheckCircle className="text-[10px]" /> Applied
                    </span>
                )}
            </div>

            <h4 className="mt-3 flex-1 font-display text-lg font-bold leading-snug text-ink">
                {scholarship?.scholarshipName}
            </h4>

            <div className="mt-4">
                <p className={`text-sm font-bold ${COVERAGE[scholarship?.scholarshipCategory]?.className || "text-ink/60"}`}>
                    {COVERAGE[scholarship?.scholarshipCategory]?.label || scholarship?.scholarshipCategory}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">
                    {[
                        Number(scholarship?.tuitionFees) > 0 ? `Tuition $${Number(scholarship.tuitionFees).toLocaleString("en-US")}/yr` : null,
                        scholarship?.degreeLevels?.length > 0 ? scholarship.degreeLevels.join(", ") : null,
                    ].filter(Boolean).join(" · ")}
                </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-ink/50">
                    Apply for <span className="font-display text-base font-bold text-violet">${((Number(scholarship?.applicationFees) || 0) + (Number(scholarship?.serviceCharge) || 0)).toLocaleString("en-US")}</span>
                </span>
                {isClosed ? (
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-ink/50">
                        Closed
                    </span>
                ) : (
                    <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-bold text-coral">
                        Due {scholarship?.applicationDeadline}
                    </span>
                )}
            </div>

            <div className="mt-5 flex items-center gap-2">
                <Link
                    to={`/scholarships/details/${scholarship?._id}`}
                    className="flex-1 rounded-full bg-ink py-3 text-center text-sm font-bold text-white transition hover:bg-black"
                >
                    View Details
                </Link>
                {onToggleCompare && (
                    <button
                        type="button"
                        onClick={() => onToggleCompare(scholarship?._id)}
                        disabled={compareDisabled && !compared}
                        aria-pressed={compared}
                        aria-label={compared ? "Remove from compare" : "Add to compare"}
                        title={compareDisabled && !compared ? "You can compare up to 3 scholarships" : compared ? "Remove from compare" : "Add to compare"}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-base transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            compared ? "border-violet bg-violet text-white" : "border-black/10 bg-white text-ink/60 hover:bg-black/5"
                        }`}
                    >
                        <FiColumns />
                    </button>
                )}
                {onToggleSave && (
                    <button
                        type="button"
                        onClick={() => onToggleSave(scholarship?._id)}
                        disabled={savePending}
                        aria-pressed={saved}
                        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                        title={saved ? "Remove from wishlist" : "Save to wishlist"}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-base transition-colors disabled:cursor-wait ${
                            saved ? "border-coral/20 bg-coral-50 text-coral" : "border-black/10 bg-white text-ink/60 hover:bg-black/5"
                        }`}
                    >
                        {savePending ? <Spinner /> : saved ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScholarCard;

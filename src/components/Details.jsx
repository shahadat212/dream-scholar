import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ReviewCard from "./ReviewCard";
import ErrorPage from "./ErrorPage";
import Loading from "./Loading";
import { FaUniversity, FaCheckCircle, FaStar, FaHeart, FaRegHeart, FaFileAlt } from "react-icons/fa";
import { FiCheck, FiExternalLink } from "react-icons/fi";
import useAxiosPublic from "../pages/hooks/useAxiosPublic";
import useMyApplications from "../pages/hooks/useMyApplications";
import useAuth from "../pages/hooks/useAuth";
import useWishlist from "../pages/hooks/useWishlist";

const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]";

const formatMoney = (value) => `$${(Number(value) || 0).toLocaleString("en-US")}`;

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return isNaN(date) ? value : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const COVERAGE = {
    "Full fund": "Full tuition covered",
    "Partial fund": "Part of tuition covered",
    "Self-fund": "No tuition funding",
};

const Details = () => {
    const { id } = useParams();
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const { findApplication, isMyApplicationsLoading } = useMyApplications();
    const { canUseWishlist, isSaved, toggleSaved, isToggling } = useWishlist();

    const { data: scholarship, isLoading, isError } = useQuery({
        queryKey: ['scholarship', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/scholarships/${id}`);
            return res.data;
        },
    });

    const { data: scholarshipReviews = [] } = useQuery({
        queryKey: ['reviews', id],
        enabled: !!scholarship,
        queryFn: async () => {
            const res = await axiosPublic.get(`/reviews?universityId=${id}`);
            return res.data;
        },
    });

    if (isLoading) {
        return <Loading label="Loading scholarship..." />;
    }

    if (isError || !scholarship) {
        return <ErrorPage />;
    }

    const myApplication = findApplication(scholarship?._id);
    const isClosed = !!scholarship?.applicationDeadline && scholarship.applicationDeadline < new Date().toISOString().split('T')[0];
    const daysLeft = scholarship?.applicationDeadline
        ? Math.ceil((new Date(`${scholarship.applicationDeadline}T23:59:59`) - new Date()) / 86400000)
        : null;
    const applyCost = (Number(scholarship?.applicationFees) || 0) + (Number(scholarship?.serviceCharge) || 0);
    const keyFacts = [
        { label: "Funding", value: COVERAGE[scholarship?.scholarshipCategory] || scholarship?.scholarshipCategory },
        { label: "Annual tuition", value: Number(scholarship?.tuitionFees) > 0 ? formatMoney(scholarship.tuitionFees) : null },
        { label: "Degree levels", value: scholarship?.degreeLevels?.length ? scholarship.degreeLevels.join(", ") : null },
        { label: "Awards available", value: scholarship?.numberOfAwards || null },
        { label: "Study starts", value: scholarship?.studyStartDate ? formatDate(scholarship.studyStartDate) : null },
        { label: "University rank", value: scholarship?.universityRank ? `#${scholarship.universityRank} worldwide` : null },
        { label: "Posted on", value: scholarship?.scholarshipPostDate ? formatDate(scholarship.scholarshipPostDate) : null },
    ].filter((fact) => fact.value);

    return (
        <div className="pb-20">
            <div className="mx-auto max-w-screen-xl px-6 pt-10">
                <div className="rounded-[32px] bg-violet px-8 py-10 text-white md:px-12">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div>
                            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">Scholarship record</span>
                            <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">
                                {scholarship?.scholarshipName}
                            </h1>
                            <p className="mt-3 flex items-center gap-2 text-white/80">
                                <FaUniversity /> {scholarship?.universityName} — {scholarship?.universityCity}, {scholarship?.universityCountry}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{scholarship?.subjectCategory}</span>
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{scholarship?.scholarshipCategory}</span>
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Rank #{scholarship?.universityRank}</span>
                                {scholarship?.degreeLevels?.length > 0 && (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{scholarship.degreeLevels.join(" · ")}</span>
                                )}
                                {scholarship?.rating ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-sun px-3 py-1 text-xs font-bold text-ink">
                                        <FaStar className="text-[10px]" /> {scholarship.rating} · {scholarship?.reviewCount} review{scholarship?.reviewCount === 1 ? "" : "s"}
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">No reviews yet</span>
                                )}
                                {canUseWishlist && (
                                    <button
                                        type="button"
                                        onClick={() => toggleSaved(scholarship?._id)}
                                        disabled={isToggling}
                                        aria-pressed={isSaved(scholarship?._id)}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors disabled:opacity-60 ${
                                            isSaved(scholarship?._id) ? "bg-white text-coral" : "bg-white/15 text-white hover:bg-white/25"
                                        }`}
                                    >
                                        {isSaved(scholarship?._id) ? <FaHeart className="text-[10px]" /> : <FaRegHeart className="text-[10px]" />}
                                        {isSaved(scholarship?._id) ? "Saved" : "Save"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isMyApplicationsLoading ? (
                            <span className="block h-12 w-40 rounded-full bg-white/15" aria-hidden="true"></span>
                        ) : myApplication ? (
                            <div className="flex flex-col items-stretch gap-2 sm:items-end">
                                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-mint-700">
                                    <FaCheckCircle /> Applied
                                    <span className="font-semibold capitalize text-ink/50">· {myApplication?.applicationStatus}</span>
                                </span>
                                <Link to="/userDashboard/myApplication" className="text-center text-sm font-bold text-white/80 underline-offset-4 hover:text-white hover:underline">
                                    View my application
                                </Link>
                            </div>
                        ) : isClosed ? (
                            <div className="flex flex-col items-stretch gap-2 sm:items-end">
                                <span className="rounded-full bg-white/15 px-8 py-3.5 text-center text-sm font-bold text-white">
                                    Applications closed
                                </span>
                                <p className="text-center text-xs font-semibold text-white/70">
                                    The deadline was {scholarship?.applicationDeadline}.
                                </p>
                            </div>
                        ) : user?.email ? (
                            <Link
                                to={`/applicationForm/${scholarship?._id}`}
                                className="rounded-full bg-coral px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-coral-600"
                            >
                                Apply Now
                            </Link>
                        ) : (
                            <div className="flex flex-col items-stretch gap-2 sm:items-end">
                                <Link
                                    to="/login"
                                    state={{ from: `/applicationForm/${scholarship?._id}` }}
                                    className="rounded-full bg-coral px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-coral-600"
                                >
                                    Log in to Apply
                                </Link>
                                <p className="text-center text-xs font-semibold text-white/70">
                                    New here? <Link to="/register" className="text-white underline underline-offset-4">Create an account</Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className={cardClass}>
                        <h2 className="font-display text-xl font-bold text-ink">About this scholarship</h2>
                        {scholarship?.description ? (
                            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/70">{scholarship.description}</p>
                        ) : (
                            <p className="mt-3 text-sm text-ink/40">The university has not added a description for this scholarship yet.</p>
                        )}
                    </section>

                    {scholarship?.benefits?.length > 0 && (
                        <section className={cardClass}>
                            <h2 className="font-display text-xl font-bold text-ink">What it covers</h2>
                            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {scholarship.benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-3 rounded-2xl bg-mint-50 px-4 py-3 text-sm font-semibold text-ink">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-xs text-white"><FiCheck /></span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {scholarship?.eligibility?.length > 0 && (
                        <section className={cardClass}>
                            <h2 className="font-display text-xl font-bold text-ink">Who can apply</h2>
                            <ul className="mt-3 space-y-2 text-ink/70">
                                {scholarship.eligibility.map((item, index) => (
                                    <li key={`${index}-${item}`} className="flex gap-3">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" aria-hidden="true"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {scholarship?.requiredDocuments?.length > 0 && (
                        <section className={cardClass}>
                            <h2 className="font-display text-xl font-bold text-ink">Documents to prepare</h2>
                            <ul className="mt-3 space-y-2 text-ink/70">
                                {scholarship.requiredDocuments.map((item, index) => (
                                    <li key={`${index}-${item}`} className="flex items-start gap-3">
                                        <FaFileAlt className="mt-1 shrink-0 text-sm text-violet" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className={cardClass}>
                        <h2 className="font-display text-xl font-bold text-ink">How to apply</h2>
                        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                { title: "Fill in the form", text: "Your contact details, degree and SSC/HSC results." },
                                { title: `Pay ${formatMoney(applyCost)}`, text: "The university application fee plus our service fee." },
                                { title: "Track your status", text: "Follow every step from your dashboard and get notified." },
                            ].map((step, index) => (
                                <li key={step.title} className="rounded-2xl bg-cream p-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet font-display text-sm font-bold text-white">{index + 1}</span>
                                    <p className="mt-3 text-sm font-bold text-ink">{step.title}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-ink/60">{step.text}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                    <section className={cardClass}>
                        <h2 className="font-display text-lg font-bold text-ink">Key facts</h2>
                        <dl className="mt-4 space-y-3">
                            {keyFacts.map((fact) => (
                                <div key={fact.label} className="flex justify-between gap-4 border-b border-black/5 pb-3 last:border-0 last:pb-0">
                                    <dt className="text-sm text-ink/50">{fact.label}</dt>
                                    <dd className="text-right text-sm font-semibold text-ink">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className={`mt-4 rounded-2xl px-4 py-3 ${isClosed ? "bg-black/5" : "bg-coral-50"}`}>
                            <p className="text-xs font-semibold text-ink/50">Application deadline</p>
                            <p className={`font-display text-base font-bold ${isClosed ? "text-ink/50" : "text-coral-700"}`}>
                                {formatDate(scholarship?.applicationDeadline)}
                            </p>
                            <p className="text-xs font-semibold text-ink/50">
                                {isClosed ? "Applications are closed" : daysLeft <= 1 ? "Closes today" : `${daysLeft} days left`}
                            </p>
                        </div>
                        {scholarship?.officialWebsite && (
                            <a
                                href={scholarship.officialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet hover:text-violet-700"
                            >
                                Official website <FiExternalLink />
                            </a>
                        )}
                    </section>

                    <section className={cardClass}>
                        <h2 className="font-display text-lg font-bold text-ink">Cost to apply</h2>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink/60">University application fee</dt>
                                <dd className="font-semibold text-ink">{Number(scholarship?.applicationFees) > 0 ? formatMoney(scholarship.applicationFees) : "Free"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink/60">Dream Scholar service fee</dt>
                                <dd className="font-semibold text-ink">{formatMoney(scholarship?.serviceCharge)}</dd>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-black/5 pt-3">
                                <dt className="font-bold text-ink">Total, paid once</dt>
                                <dd className="font-display text-lg font-bold text-violet">{formatMoney(applyCost)}</dd>
                            </div>
                        </dl>
                        <p className="mt-4 text-xs leading-relaxed text-ink/50">
                            The application fee is set by the university for processing your application. The service fee covers checking your
                            details and submitting the application for you. Neither is a tuition payment.
                        </p>
                    </section>
                </div>
            </div>

            {scholarshipReviews.length > 0 && (
                <div className="mx-auto max-w-screen-xl px-6">
                    <h3 className="font-display text-2xl font-extrabold text-ink">Student Reviews</h3>
                    <div className="mt-8">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 4000 }}
                            breakpoints={{
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="pb-12"
                        >
                            {scholarshipReviews.map((review) => (
                                <SwiperSlide key={review?._id}>
                                    <ReviewCard review={review} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Details;

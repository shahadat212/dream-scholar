import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, A11y } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import useAxiosPublic from "../hooks/useAxiosPublic";
import Reveal from "../../components/Reveal";

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Student")}`;

const Testimonials = () => {
    const axiosPublic = useAxiosPublic();

    const { data: reviews = [], isLoading, isError } = useQuery({
        queryKey: ["reviews"],
        queryFn: async () => (await axiosPublic.get("/reviews")).data,
    });

    if (isLoading || isError) return null;

    const featured = reviews
        .filter((review) => Number(review?.rating) >= 4 && review?.comment?.trim().length >= 20)
        .slice(0, 9);

    if (featured.length === 0) return null;

    return (
        <section className="py-16">
            <Reveal className="mx-auto max-w-2xl px-6 text-center">
                <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Student reviews</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">What students say</h2>
                <p className="mt-3 text-ink/60">Real reviews from students who applied through Dream Scholar Hub.</p>
            </Reveal>

            <Reveal delay={0.1} className="mx-auto mt-10 max-w-screen-xl px-6">
                <Swiper
                    modules={[Pagination, Autoplay, A11y]}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
                    pagination={{ clickable: true }}
                    className="!pb-12"
                >
                    {featured.map((review) => (
                        <SwiperSlide key={review?._id} className="!h-auto p-1">
                            <figure className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                                <div className="flex items-center justify-between">
                                    <FaQuoteLeft className="text-2xl text-violet/20" aria-hidden="true" />
                                    <span className="flex items-center gap-0.5" aria-label={`${review?.rating} out of 5`}>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <FaStar key={n} className={`text-sm ${Number(review?.rating) >= n ? "text-sun" : "text-black/10"}`} />
                                        ))}
                                    </span>
                                </div>
                                <blockquote className="mt-4 flex-1 leading-relaxed text-ink/70">{review?.comment}</blockquote>
                                <figcaption className="mt-6 flex items-center gap-3 border-t border-black/5 pt-4">
                                    <img
                                        src={review?.userImage || avatarFor(review?.userName)}
                                        onError={(e) => { e.currentTarget.src = avatarFor(review?.userName); }}
                                        alt=""
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-display text-sm font-bold text-ink">{review?.userName || "Student"}</p>
                                        <Link to={`/scholarships/details/${review?.universityId}`} className="block truncate text-xs text-ink/50 hover:text-violet">
                                            {review?.scholarshipName}
                                        </Link>
                                    </div>
                                </figcaption>
                            </figure>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Reveal>
        </section>
    );
};

export default Testimonials;

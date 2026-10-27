import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import ScholarCard from "../../components/ScholarCard";
import Loading from "../../components/Loading";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useMyApplications from "../hooks/useMyApplications";
import useWishlist from "../hooks/useWishlist";
import Reveal from "../../components/Reveal";

const ScholarshipsSection = () => {
    const axiosPublic = useAxiosPublic();
    const { findApplication } = useMyApplications();
    const { canUseWishlist, isSaved, toggleSaved, pendingId } = useWishlist();

    const { data: topScholarships = [], isLoading, isError } = useQuery({
        queryKey: ['topScholarships'],
        queryFn: async () => {
            const res = await axiosPublic.get('/scholarships/top');
            return res.data;
        },
    });

    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Featured</span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">Most affordable to apply</h2>
                    <p className="mt-2 max-w-lg text-ink/60">Scholarships with the lowest application cost right now.</p>
                </div>
                <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm font-bold text-violet hover:text-violet-700">
                    See all scholarships <FiArrowRight />
                </Link>
            </Reveal>

            {isLoading ? (
                <Loading label="Loading scholarships..." />
            ) : isError ? (
                <p className="mt-12 text-center text-sm font-semibold text-coral">Could not load scholarships. Please try again later.</p>
            ) : topScholarships.length === 0 ? (
                <p className="mt-12 text-center text-sm font-semibold text-ink/40">No scholarships on file.</p>
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {topScholarships.map((scholarship, index) => (
                        <motion.div
                            key={scholarship._id}
                            className="h-full [&>div]:h-full"
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <ScholarCard
                                scholarship={scholarship}
                                tagIndex={index}
                                applied={!!findApplication(scholarship?._id)}
                                saved={isSaved(scholarship?._id)}
                                savePending={pendingId === String(scholarship?._id)}
                                onToggleSave={canUseWishlist ? toggleSaved : undefined}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ScholarshipsSection;

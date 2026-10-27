import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiArrowRight } from "react-icons/fi";
import useScholarships from "../hooks/useScholarships";
import Reveal from "../../components/Reveal";

const today = () => new Date().toISOString().split("T")[0];

const daysUntil = (date) => Math.max(Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000), 0);

const ClosingSoon = () => {
    const { scholarships, isLoading, isError } = useScholarships();

    if (isLoading || isError) return null;

    const closingSoon = scholarships
        .filter((s) => s?.applicationDeadline && s.applicationDeadline >= today())
        .sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline))
        .slice(0, 3);

    if (closingSoon.length === 0) return null;

    return (
        <section className="bg-ink py-16 text-white">
            <div className="mx-auto max-w-screen-xl px-6">
                <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-1.5 text-xs font-bold text-white">
                            <FiClock /> Deadlines approaching
                        </span>
                        <h2 className="mt-3 font-display text-3xl font-extrabold text-white md:text-4xl">Closing soon</h2>
                        <p className="mt-2 max-w-lg text-white/60">Don&apos;t miss these. Applications close in the next few weeks.</p>
                    </div>
                    <Link to="/scholarships?open=true&sort=deadline" className="inline-flex items-center gap-2 text-sm font-bold text-sun hover:text-white">
                        See all open scholarships <FiArrowRight />
                    </Link>
                </Reveal>

                <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {closingSoon.map((scholarship, index) => {
                        const days = daysUntil(scholarship.applicationDeadline);
                        return (
                            <motion.div
                                key={scholarship?._id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Link
                                    to={`/scholarships/details/${scholarship?._id}`}
                                    className="group flex h-full flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/10"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-white/50">{scholarship?.universityName}</p>
                                            <p className="mt-1 font-display text-lg font-bold leading-snug text-white">{scholarship?.scholarshipName}</p>
                                        </div>
                                        <div className="shrink-0 rounded-2xl bg-coral px-3 py-2 text-center">
                                            <p className="font-display text-2xl font-extrabold leading-none text-white">{days}</p>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">{days === 1 ? "day" : "days"}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-6 text-xs">
                                        <span className="font-semibold text-white/60">
                                            {scholarship?.subjectCategory} · {scholarship?.universityCountry}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-bold text-sun transition group-hover:gap-2">
                                            View <FiArrowRight />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ClosingSoon;

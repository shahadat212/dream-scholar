import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { FaGraduationCap, FaGlobeAmericas } from "react-icons/fa";
import useScholarships from "../hooks/useScholarships";
import CountUp from "../../components/CountUp";
import graduationImg from "../../assets/slide3.jpg";
import campusImg from "../../assets/slide1.png";

const ease = [0.22, 1, 0.36, 1];
const today = () => new Date().toISOString().split("T")[0];

const QUICK_SEARCHES = ["Computer Science", "Engineering", "Medicine", "Business Administration"];

const fadeUp = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
});

const Banner = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const { scholarships } = useScholarships();

    const stats = [
        { label: "Scholarships listed", value: scholarships.length },
        { label: "Countries", value: new Set(scholarships.map((s) => s?.universityCountry).filter(Boolean)).size },
        { label: "Universities", value: new Set(scholarships.map((s) => s?.universityName).filter(Boolean)).size },
        { label: "Open right now", value: scholarships.filter((s) => s?.applicationDeadline >= today()).length },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        navigate(trimmed ? `/scholarships?q=${encodeURIComponent(trimmed)}` : "/scholarships");
    };

    return (
        <section className="relative isolate overflow-hidden">
            <motion.div
                aria-hidden="true"
                className="blob-1 absolute -left-24 -top-24 -z-10 h-80 w-80 bg-violet/10"
                animate={{ rotate: [0, 12, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden="true"
                className="blob-2 absolute -right-24 top-24 -z-10 h-96 w-96 bg-sun/20"
                animate={{ rotate: [0, -10, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-14 px-6 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
                <div>
                    <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        <span className="h-2 w-2 rounded-full bg-mint" aria-hidden="true"></span>
                        Scholarships from universities worldwide
                    </motion.span>

                    <motion.h1 {...fadeUp(0.08)} className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.06] text-ink sm:text-5xl md:text-6xl">
                        Find the scholarship that{" "}
                        <span className="relative text-violet sm:whitespace-nowrap">
                            funds your future
                            <motion.svg
                                aria-hidden="true"
                                viewBox="0 0 300 16"
                                className="absolute -bottom-2 left-0 hidden h-3 w-full sm:block"
                                preserveAspectRatio="none"
                            >
                                <motion.path
                                    d="M3 11 C 80 3, 200 3, 297 9"
                                    fill="none"
                                    stroke="#FFC145"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 0.6, ease }}
                                />
                            </motion.svg>
                        </span>
                    </motion.h1>

                    <motion.p {...fadeUp(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
                        Compare funding, check eligibility and apply in minutes. Then follow every step of your application from one dashboard.
                    </motion.p>

                    <motion.form {...fadeUp(0.24)} onSubmit={handleSearch} className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-[0_12px_40px_-16px_rgba(20,20,31,0.35)]" role="search">
                        <FiSearch className="ml-3 shrink-0 text-lg text-ink/30" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Subject, university or country"
                            aria-label="Search scholarships"
                            className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:outline-none"
                        />
                        <button type="submit" className="shrink-0 rounded-full bg-violet px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600 sm:px-7">
                            Search
                        </button>
                    </motion.form>

                    <motion.div {...fadeUp(0.32)} className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-ink/40">Popular:</span>
                        {QUICK_SEARCHES.map((subject) => (
                            <Link
                                key={subject}
                                to={`/scholarships?subject=${encodeURIComponent(subject)}`}
                                className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-violet hover:text-violet"
                            >
                                {subject}
                            </Link>
                        ))}
                    </motion.div>
                </div>

                <div className="relative mx-auto hidden h-[30rem] w-full max-w-md lg:block" aria-hidden="true">
                    <motion.div
                        className="absolute right-0 top-0 h-[24rem] w-[19rem]"
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.2, ease }}
                    >
                        <motion.img
                            src={graduationImg}
                            alt=""
                            className="h-full w-full rounded-[2.5rem] object-cover shadow-[0_30px_60px_-25px_rgba(20,20,31,0.45)]"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    <motion.div
                        className="absolute bottom-0 left-0 h-56 w-44 rotate-[-4deg]"
                        initial={{ opacity: 0, x: -30, y: 30 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.45, ease }}
                    >
                        <motion.img
                            src={campusImg}
                            alt=""
                            className="h-full w-full rounded-[2rem] border-4 border-white object-cover shadow-[0_24px_50px_-20px_rgba(20,20,31,0.4)]"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    <motion.div
                        className="absolute left-6 top-10"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7, ease }}
                    >
                        <motion.span
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-lg shadow-violet/30"
                            animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <FaGraduationCap />
                        </motion.span>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-16 right-4"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.85, ease }}
                    >
                        <motion.span
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-sun text-2xl text-ink shadow-lg shadow-sun/40"
                            animate={{ y: [0, 8, 0], rotate: [0, 8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <FaGlobeAmericas />
                        </motion.span>
                    </motion.div>

                    <motion.span
                        className="blob-2 absolute -right-6 bottom-24 -z-10 h-40 w-40 bg-coral/20"
                        animate={{ rotate: [0, 18, 0] }}
                        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <div className="mx-auto max-w-screen-xl px-6 pb-8">
                <motion.dl
                    {...fadeUp(0.4)}
                    className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-black/5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] md:grid-cols-4"
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white px-6 py-6 text-center">
                            <dd className="font-display text-3xl font-extrabold text-ink md:text-4xl">
                                <CountUp value={stat.value} />
                            </dd>
                            <dt className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/40">{stat.label}</dt>
                        </div>
                    ))}
                </motion.dl>
                <div className="mt-6 text-center">
                    <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm font-bold text-violet hover:text-violet-700">
                        Browse all scholarships <FiArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Banner;

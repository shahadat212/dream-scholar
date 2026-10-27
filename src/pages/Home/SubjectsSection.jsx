import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaSeedling, FaCogs, FaLaptopCode, FaBriefcase, FaStethoscope, FaShapes } from "react-icons/fa";
import useAxiosPublic from "../hooks/useAxiosPublic";
import Reveal from "../../components/Reveal";

const ICONS = {
    Agriculture: { icon: FaSeedling, tone: "bg-mint-50 text-mint-700" },
    Engineering: { icon: FaCogs, tone: "bg-sun-50 text-sun-700" },
    "Computer Science": { icon: FaLaptopCode, tone: "bg-violet/10 text-violet" },
    "Business Administration": { icon: FaBriefcase, tone: "bg-coral-50 text-coral-700" },
    Medicine: { icon: FaStethoscope, tone: "bg-mint-50 text-mint-700" },
    others: { icon: FaShapes, tone: "bg-black/5 text-ink/70" },
};

const SubjectsSection = () => {
    const axiosPublic = useAxiosPublic();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["scholarships", "filters"],
        queryFn: async () => (await axiosPublic.get("/scholarships/filters")).data,
    });

    if (isLoading || isError || !data) return null;

    const subjects = [...(data.subjects || []), ...(data.others ? [data.others] : [])];

    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Explore</span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">Browse by subject</h2>
                    <p className="mt-2 max-w-lg text-ink/60">Start with what you want to study. Every number is a live scholarship you can apply to.</p>
                </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {subjects.map((subject, index) => {
                    const config = ICONS[subject.value] || ICONS.others;
                    const Icon = config.icon;
                    return (
                        <motion.div
                            key={subject.value}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -4 }}
                        >
                            <Link
                                to={`/scholarships?subject=${encodeURIComponent(subject.value)}`}
                                className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] transition-shadow hover:shadow-[0_16px_40px_-15px_rgba(91,76,251,0.35)]"
                            >
                                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${config.tone}`}>
                                    <Icon />
                                </span>
                                <p className="mt-4 text-sm font-bold leading-snug text-ink">{subject.label}</p>
                                <p className="mt-1 text-xs text-ink/50">
                                    {subject.count} scholarship{subject.count === 1 ? "" : "s"}
                                </p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default SubjectsSection;

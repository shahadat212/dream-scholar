import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import useScholarships from "../hooks/useScholarships";
import Reveal from "../../components/Reveal";

const TONES = ["bg-violet text-white", "bg-coral text-white", "bg-sun text-ink", "bg-mint text-white", "bg-ink text-white", "bg-violet-100 text-violet-700"];

const Destinations = () => {
    const { scholarships, isLoading, isError } = useScholarships();

    if (isLoading || isError) return null;

    const counts = scholarships.reduce((map, s) => {
        if (s?.universityCountry) map.set(s.universityCountry, (map.get(s.universityCountry) || 0) + 1);
        return map;
    }, new Map());

    const countries = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6);

    if (countries.length === 0) return null;

    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <Reveal>
                <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Study abroad</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">Top destinations</h2>
                <p className="mt-2 max-w-lg text-ink/60">Countries with the most scholarships on Dream Scholar Hub right now.</p>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
                {countries.map(([country, count], index) => (
                    <motion.div
                        key={country}
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -4 }}
                    >
                        <Link
                            to={`/scholarships?q=${encodeURIComponent(country)}`}
                            className={`flex h-full min-h-[8.5rem] flex-col justify-between rounded-3xl p-5 md:p-6 ${TONES[index % TONES.length]}`}
                        >
                            <FaMapMarkerAlt className="text-lg opacity-80" />
                            <div>
                                <p className="font-display text-lg font-bold leading-tight md:text-xl">{country}</p>
                                <p className="mt-1 text-xs font-semibold opacity-80">
                                    {count} scholarship{count === 1 ? "" : "s"}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Destinations;

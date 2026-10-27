import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";

const CallToAction = () => {
    const { user } = useAuth();

    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[32px] bg-violet px-8 py-14 text-center text-white md:px-16"
            >
                <motion.div
                    aria-hidden="true"
                    className="blob-1 absolute -left-16 -top-16 h-56 w-56 bg-white/10"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    aria-hidden="true"
                    className="blob-2 absolute -bottom-20 -right-10 h-64 w-64 bg-sun/30"
                    animate={{ rotate: [0, -16, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative">
                    <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold text-white md:text-4xl">
                        Your next chapter could start with one application
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-white/80">
                        Create a free account to save scholarships, apply in minutes and get notified the moment a decision is made.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {user?.email ? (
                            <Link to="/dashboard" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-violet transition hover:bg-cream">
                                Go to your dashboard
                            </Link>
                        ) : (
                            <Link to="/register" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-violet transition hover:bg-cream">
                                Create a free account
                            </Link>
                        )}
                        <Link to="/scholarships" className="rounded-full border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white transition hover:border-white">
                            Browse scholarships
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default CallToAction;

import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiEdit3, FiCreditCard, FiTrendingUp } from "react-icons/fi";
import Reveal from "../../components/Reveal";

const steps = [
    { icon: FiSearch, title: "Find", text: "Search and filter scholarships, then save or compare the ones you like." },
    { icon: FiEdit3, title: "Apply", text: "Fill in one short form with your contact details and academic results." },
    { icon: FiCreditCard, title: "Pay once", text: "Pay the university application fee and our service fee in one step." },
    { icon: FiTrendingUp, title: "Track", text: "Follow the review on your timeline and get notified of every decision." },
];

const HowToApply = () => {
    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <Reveal className="mx-auto max-w-2xl text-center">
                <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">How it works</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">From search to decision in four steps</h2>
            </Reveal>

            <ol className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
                <motion.span
                    aria-hidden="true"
                    className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 origin-left bg-violet-100 md:block"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
                {steps.map((step, index) => (
                    <motion.li
                        key={step.title}
                        className="relative flex flex-col items-center text-center"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.55, delay: 0.15 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-violet text-xl text-white shadow-lg shadow-violet/25">
                            <step.icon />
                            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sun font-display text-[11px] font-bold text-ink">
                                {index + 1}
                            </span>
                        </span>
                        <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
                        <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-ink/60">{step.text}</p>
                    </motion.li>
                ))}
            </ol>
        </section>
    );
};

export default HowToApply;

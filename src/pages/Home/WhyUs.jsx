import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiColumns, FiBell, FiShield } from 'react-icons/fi';
import Reveal from '../../components/Reveal';

const features = [
    {
        icon: FiSearch,
        title: 'Search that fits you',
        description: 'Filter by subject and funding, sort by deadline or rating, and only see what is still open.',
        tone: 'bg-violet/10 text-violet',
    },
    {
        icon: FiColumns,
        title: 'Compare side by side',
        description: 'Put up to three scholarships next to each other and see the best value in every row.',
        tone: 'bg-coral-50 text-coral-700',
    },
    {
        icon: FiBell,
        title: 'Never lose track',
        description: 'A timeline for every application and a notification the moment its status changes.',
        tone: 'bg-sun-50 text-sun-700',
    },
    {
        icon: FiShield,
        title: 'Clear, one-time fees',
        description: 'See the university fee and our service fee before you apply. You pay once, nothing hidden.',
        tone: 'bg-mint-50 text-mint-700',
    },
];

const WhyUs = () => {
    return (
        <section className="mx-auto max-w-screen-xl px-6 py-16">
            <Reveal className="mx-auto max-w-2xl text-center">
                <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Why Dream Scholar Hub</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">Everything you need, in one place</h2>
                <p className="mt-3 text-ink/60">From the first search to the final decision, without juggling a dozen tabs and spreadsheets.</p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]"
                    >
                        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${feature.tone}`}>
                            <feature.icon />
                        </span>
                        <h3 className="mt-5 font-display text-lg font-bold text-ink">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/60">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default WhyUs;

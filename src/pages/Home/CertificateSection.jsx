import React from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import certificateImg from "../../assets/certificate.jpg";
import Reveal from "../../components/Reveal";

const CertificateSection = () => {
    return (
        <section className="relative isolate mx-auto max-w-screen-xl px-6 py-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <Reveal className="relative">
                    <div className="blob-2 absolute -left-6 -top-6 -z-10 h-40 w-40 bg-sun/25"></div>
                    <div className="blob-1 absolute -bottom-6 -right-6 -z-10 h-40 w-40 bg-violet/15"></div>
                    <img
                        src={certificateImg}
                        alt="Graduate holding a scholarship certificate"
                        className="w-full rounded-[32px] object-cover shadow-[0_20px_50px_-20px_rgba(20,20,31,0.3)]"
                    />
                </Reveal>

                <Reveal delay={0.1}>
                    <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">The outcome</span>
                    <h2 className="mt-4 font-display text-3xl font-extrabold text-ink md:text-4xl">
                        Achieve your dream with the right funding
                    </h2>
                    <p className="mt-5 max-w-md text-ink/60">
                        Dream Scholar Hub helps you find and apply for scholarships that
                        match your academic goals, so you can spend less time searching
                        and more time preparing for what comes next.
                    </p>
                    <ul className="mt-6 space-y-3">
                        {[
                            "Clear funding: see exactly what each scholarship covers",
                            "Honest costs: every fee is shown before you apply",
                            "Real reviews from students who applied before you",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm text-ink/70">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-[11px] text-white"><FiCheck /></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/scholarships" className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black">
                        Start exploring
                    </Link>
                </Reveal>
            </div>
        </section>
    );
};

export default CertificateSection;

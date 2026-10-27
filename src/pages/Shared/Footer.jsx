import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowUpRight } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const Footer = () => {
    const { user } = useAuth();

    const columns = [
        {
            title: "Scholarships",
            links: [
                { to: "/scholarships", label: "All scholarships" },
                { to: "/scholarships?open=true&sort=deadline", label: "Closing soon" },
                { to: "/scholarships?category=Full%20fund", label: "Fully funded" },
                { to: "/scholarships?sort=rating", label: "Highest rated" },
            ],
        },
        {
            title: "Your account",
            links: user?.email
                ? [
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/compare", label: "Compare scholarships" },
                ]
                : [
                    { to: "/register", label: "Create an account" },
                    { to: "/login", label: "Log in" },
                ],
        },
    ];

    return (
        <footer className="mt-10 bg-ink text-white">
            <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
                <div className="sm:col-span-2 lg:col-span-1">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet text-sm text-white">✦</span>
                        <span className="font-display text-lg font-bold">Dream Scholar</span>
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                        Search, compare and apply for scholarships from universities worldwide, then track every application in one place.
                    </p>
                </div>

                {columns.map((column) => (
                    <div key={column.title}>
                        <p className="text-xs font-bold uppercase tracking-widest text-sun">{column.title}</p>
                        <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                            {column.links.map((link) => (
                                <li key={link.label}>
                                    <Link to={link.to} className="transition hover:text-white">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-sun">Get in touch</p>
                    <a href="mailto:info@dreamscholarhub.com" className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white">
                        <FiMail /> info@dreamscholarhub.com
                    </a>
                    <Link to="/scholarships" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-violet px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-600">
                        Find a scholarship <FiArrowUpRight />
                    </Link>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/50 sm:flex-row md:px-8">
                    <p>© {new Date().getFullYear()} Dream Scholar Hub. All rights reserved.</p>
                    <p>Fees shown are set by each university plus a one-time service fee.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

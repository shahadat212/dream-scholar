import React from "react";

const FormSection = ({ step, title, text, children }) => {
    return (
        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] md:p-8">
            <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/10 font-display text-sm font-bold text-violet">{step}</span>
                <div>
                    <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                    <p className="text-sm text-ink/60">{text}</p>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </section>
    );
};

export default FormSection;

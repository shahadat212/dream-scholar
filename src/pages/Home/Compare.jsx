import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQueries } from "@tanstack/react-query";
import { FiX, FiArrowLeft } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Loading from "../../components/Loading";
import useAxiosPublic from "../hooks/useAxiosPublic";

const today = () => new Date().toISOString().split("T")[0];
const totalFee = (scholarship) => (Number(scholarship?.applicationFees) || 0) + (Number(scholarship?.serviceCharge) || 0);

const Compare = () => {
    const axiosPublic = useAxiosPublic();
    const [searchParams, setSearchParams] = useSearchParams();
    const ids = [...new Set((searchParams.get("ids") || "").split(",").filter((id) => /^[a-f\d]{24}$/i.test(id)))].slice(0, 3);

    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: ["scholarship", id],
            queryFn: async () => (await axiosPublic.get(`/scholarships/${id}`)).data,
        })),
    });

    const isLoading = results.some((result) => result.isLoading);
    const failed = results.filter((result) => result.isError).length;
    const scholarships = results.map((result) => result.data).filter(Boolean);

    const removeId = (id) => {
        const remaining = ids.filter((item) => item !== id);
        setSearchParams(remaining.length ? { ids: remaining.join(",") } : {}, { replace: true });
        try {
            sessionStorage.setItem("compare-scholarships", JSON.stringify(remaining));
        } catch {
            return;
        }
    };

    const bestOf = (getValue, direction) => {
        const values = scholarships.map(getValue).filter((value) => typeof value === "number" && !isNaN(value));
        if (values.length < 2 || new Set(values).size === 1) return null;
        return direction === "min" ? Math.min(...values) : Math.max(...values);
    };

    const bestTotal = bestOf(totalFee, "min");
    const bestRank = bestOf((s) => Number(s?.universityRank) || undefined, "min");
    const bestRating = bestOf((s) => s?.rating ?? undefined, "max");

    const best = <span className="ml-2 rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-bold text-mint-700">Best</span>;

    const rows = [
        { label: "University", render: (s) => <span className="font-semibold">{s?.universityName}</span> },
        { label: "Location", render: (s) => `${s?.universityCity || ""}${s?.universityCity && s?.universityCountry ? ", " : ""}${s?.universityCountry || ""}` },
        { label: "World rank", render: (s) => <>#{s?.universityRank}{Number(s?.universityRank) === bestRank && best}</> },
        { label: "Subject", render: (s) => s?.subjectCategory },
        { label: "Funding", render: (s) => s?.scholarshipCategory },
        { label: "Degree levels", render: (s) => (s?.degreeLevels?.length ? s.degreeLevels.join(", ") : <span className="text-ink/40">Not listed</span>) },
        { label: "What it covers", render: (s) => (s?.benefits?.length ? s.benefits.join(", ") : <span className="text-ink/40">Not listed</span>) },
        { label: "Awards available", render: (s) => s?.numberOfAwards || <span className="text-ink/40">Not listed</span> },
        { label: "Annual tuition", render: (s) => (Number(s?.tuitionFees) > 0 ? `$${Number(s.tuitionFees).toLocaleString("en-US")}` : <span className="text-ink/40">Not listed</span>) },
        { label: "University application fee", render: (s) => (Number(s?.applicationFees) > 0 ? `$${s.applicationFees}` : "Free") },
        { label: "Service fee", render: (s) => `$${s?.serviceCharge}` },
        { label: "Total to apply", render: (s) => <span className="font-display font-bold text-violet">${totalFee(s)}{totalFee(s) === bestTotal && best}</span> },
        {
            label: "Deadline",
            render: (s) => s?.applicationDeadline < today()
                ? <span className="font-semibold text-ink/50">{s?.applicationDeadline} (closed)</span>
                : <span className="font-semibold text-coral-700">{s?.applicationDeadline}</span>,
        },
        { label: "Study starts", render: (s) => s?.studyStartDate || <span className="text-ink/40">Not listed</span> },
        {
            label: "Rating",
            render: (s) => s?.rating
                ? <span className="inline-flex items-center gap-1 font-semibold"><FaStar className="text-sun" /> {s.rating} ({s?.reviewCount}){s.rating === bestRating && best}</span>
                : <span className="text-ink/40">No reviews yet</span>,
        },
        {
            label: "Eligibility",
            render: (s) => s?.eligibility?.length
                ? <ul className="space-y-1 text-left">{s.eligibility.map((item, i) => <li key={`${i}-${item}`} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet"></span>{item}</li>)}</ul>
                : <span className="text-ink/40">Not listed</span>,
        },
    ];

    return (
        <div className="min-h-[85vh] py-14">
            <Helmet>
                <title>Compare Scholarships | Dream Scholar Hub</title>
            </Helmet>
            <div className="mx-auto max-w-screen-xl px-6">
                <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm font-bold text-violet hover:text-violet-700">
                    <FiArrowLeft /> Back to scholarships
                </Link>
                <h1 className="mt-4 font-display text-4xl font-extrabold text-ink">Compare scholarships</h1>
                <p className="mt-2 max-w-xl text-ink/60">See up to three scholarships side by side. The best value in each row is marked.</p>

                {ids.length < 2 ? (
                    <div className="mt-10 rounded-3xl bg-white px-6 py-14 text-center shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                        <p className="font-display text-lg font-bold text-ink">Pick at least two scholarships</p>
                        <p className="mt-1 text-sm text-ink/60">Use the compare button on any scholarship card to add it here.</p>
                        <Link to="/scholarships" className="mt-6 inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                            Browse scholarships
                        </Link>
                    </div>
                ) : isLoading ? (
                    <Loading label="Loading scholarships..." />
                ) : (
                    <>
                        {failed > 0 && (
                            <p className="mt-6 text-sm font-semibold text-coral">
                                {failed} scholarship{failed === 1 ? "" : "s"} could not be loaded and {failed === 1 ? "is" : "are"} not shown.
                            </p>
                        )}
                        <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b border-black/5">
                                        <th scope="col" className="sticky left-0 w-40 bg-white px-5 py-5 text-left text-[11px] font-bold uppercase tracking-wide text-ink/40">
                                            Scholarship
                                        </th>
                                        {scholarships.map((scholarship) => (
                                            <th key={scholarship?._id} scope="col" className="px-5 py-5 text-left align-top">
                                                <div className="flex items-start justify-between gap-3">
                                                    <Link to={`/scholarships/details/${scholarship?._id}`} className="font-display text-base font-bold leading-snug text-ink hover:text-violet">
                                                        {scholarship?.scholarshipName}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeId(scholarship?._id)}
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-black/5 hover:text-ink"
                                                        aria-label={`Remove ${scholarship?.scholarshipName} from compare`}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.label} className="border-b border-black/5 last:border-0">
                                            <th scope="row" className="sticky left-0 bg-white px-5 py-4 text-left align-top text-xs font-semibold text-ink/50">
                                                {row.label}
                                            </th>
                                            {scholarships.map((scholarship) => (
                                                <td key={scholarship?._id} className="px-5 py-4 align-top text-ink">
                                                    {row.render(scholarship)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Compare;

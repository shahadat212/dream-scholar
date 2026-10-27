import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiX, FiSliders, FiChevronLeft, FiChevronRight, FiColumns } from "react-icons/fi";
import ScholarCard from "../../components/ScholarCard";
import Loading from "../../components/Loading";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useMyApplications from "../hooks/useMyApplications";
import useWishlist from "../hooks/useWishlist";

const selectClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm text-ink focus:border-violet focus:outline-none";
const filterLabelClass = "mb-2 block text-[11px] font-bold uppercase tracking-wide text-ink/40";
const FUNDING_TYPES = ["Full fund", "Partial fund", "Self-fund"];
const COMPARE_KEY = "compare-scholarships";
const MAX_COMPARE = 3;
const PAGE_SIZE = 9;

const SORTS = [
    { value: "newest", label: "Newest first" },
    { value: "deadline", label: "Deadline soonest" },
    { value: "fee-asc", label: "Application fee: low to high" },
    { value: "fee-desc", label: "Application fee: high to low" },
    { value: "rank", label: "University rank" },
    { value: "rating", label: "Highest rated" },
];

const readCompare = () => {
    try {
        const stored = JSON.parse(sessionStorage.getItem(COMPARE_KEY) || "[]");
        return Array.isArray(stored) ? stored.slice(0, MAX_COMPARE) : [];
    } catch {
        return [];
    }
};

const AllScholarships = () => {
    const axiosPublic = useAxiosPublic();
    const { findApplication } = useMyApplications();
    const { canUseWishlist, isSaved, toggleSaved } = useWishlist();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(searchParams.get("q") || "");
    const [showFilters, setShowFilters] = useState(false);
    const [compareIds, setCompareIds] = useState(readCompare);

    const filters = {
        q: searchParams.get("q") || "",
        subject: searchParams.get("subject") || "",
        category: searchParams.get("category") || "",
        open: searchParams.get("open") === "true",
        sort: searchParams.get("sort") || "newest",
        page: Math.max(parseInt(searchParams.get("page")) || 1, 1),
    };

    const updateParams = (changes, resetPage = true) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value === false || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
        });
        if (resetPage) next.delete("page");
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        const trimmed = searchText.trim();
        if (trimmed === filters.q) return;
        const timer = setTimeout(() => updateParams({ q: trimmed }), 350);
        return () => clearTimeout(timer);
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
        } catch {
            return;
        }
    }, [compareIds]);

    const { data: filterOptions, isError: isFilterError } = useQuery({
        queryKey: ["scholarships", "filters"],
        queryFn: async () => (await axiosPublic.get("/scholarships/filters")).data,
    });

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["scholarships", "search", filters],
        placeholderData: (previous) => previous,
        queryFn: async () => {
            const res = await axiosPublic.get("/scholarships", {
                params: {
                    page: filters.page,
                    limit: PAGE_SIZE,
                    sort: filters.sort,
                    ...(filters.q && { search: filters.q }),
                    ...(filters.subject && { subject: filters.subject }),
                    ...(filters.category && { category: filters.category }),
                    ...(filters.open && { open: "true" }),
                },
            });
            return res.data;
        },
    });

    const scholarships = data?.items || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 1;
    const activeFilterCount = [filters.subject, filters.category, filters.open].filter(Boolean).length;

    const clearAll = () => {
        setSearchText("");
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    const toggleCompare = (id) => {
        setCompareIds((current) => current.includes(id)
            ? current.filter((item) => item !== id)
            : current.length >= MAX_COMPARE ? current : [...current, id]);
    };

    const goToPage = (page) => {
        updateParams({ page: page > 1 ? page : "" }, false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-[85vh] py-14 pb-28">
            <Helmet>
                <title>Scholarships | Dream Scholar Hub</title>
            </Helmet>
            <div className="mx-auto max-w-screen-xl px-6">
                <h1 className="font-display text-4xl font-extrabold text-ink">All Scholarships</h1>
                <p className="mt-2 max-w-xl text-ink/60">
                    Every scholarship on file, from universities worldwide.
                </p>

                <div className="mt-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
                    <aside
                        id="scholarship-filters"
                        aria-label="Filters"
                        className={`mb-6 lg:sticky lg:top-28 lg:mb-0 lg:block ${showFilters ? "block" : "hidden"}`}
                    >
                        <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                                    <FiSliders className="text-violet" /> Filters
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-violet/10 px-2 py-0.5 text-[11px] font-bold text-violet">{activeFilterCount}</span>
                                    )}
                                </h2>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => updateParams({ subject: "", category: "", open: false })}
                                        className="text-xs font-bold text-violet hover:text-violet-700"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {isFilterError && (
                                <p className="mt-3 text-xs font-semibold text-coral">Could not load the subject list. Refresh to try again.</p>
                            )}

                            <div className="mt-5 space-y-5">

                                <div>
                                    <label htmlFor="filter-subject" className={filterLabelClass}>Subject</label>
                                    <select id="filter-subject" value={filters.subject} onChange={(e) => updateParams({ subject: e.target.value })} className={selectClass}>
                                        <option value="">All subjects</option>
                                        {(filterOptions?.subjects || []).map((subject) => (
                                            <option key={subject.value} value={subject.value}>{subject.label} ({subject.count})</option>
                                        ))}
                                        {filterOptions?.others && (
                                            <option value={filterOptions.others.value}>{filterOptions.others.label} ({filterOptions.others.count})</option>
                                        )}
                                    </select>
                                </div>

                                <fieldset>
                                    <legend className={filterLabelClass}>Funding</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {[{ value: "", label: "Any" }, ...FUNDING_TYPES.map((type) => ({ value: type, label: type }))].map((option) => (
                                            <button
                                                key={option.value || "any"}
                                                type="button"
                                                onClick={() => updateParams({ category: option.value })}
                                                aria-pressed={filters.category === option.value}
                                                className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                                                    filters.category === option.value ? "bg-violet text-white" : "bg-black/5 text-ink/70 hover:bg-black/10"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>


                                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-ink">
                                    Open for applications
                                    <input
                                        type="checkbox"
                                        checked={filters.open}
                                        onChange={(e) => updateParams({ open: e.target.checked })}
                                        className="h-4 w-4 accent-violet"
                                    />
                                </label>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                                <input
                                    type="search"
                                    placeholder="Search by scholarship, university, subject, city or country…"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    aria-label="Search scholarships"
                                    className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    aria-expanded={showFilters}
                                    aria-controls="scholarship-filters"
                                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors lg:hidden ${
                                        showFilters || activeFilterCount ? "bg-ink text-white" : "border border-black/10 bg-white text-ink"
                                    }`}
                                >
                                    <FiSliders /> Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
                                </button>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => updateParams({ sort: e.target.value === "newest" ? "" : e.target.value })}
                                    aria-label="Sort scholarships"
                                    className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink focus:border-violet focus:outline-none sm:w-56 sm:flex-none"
                                >
                                    {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                            <p className="font-semibold text-ink/60" aria-live="polite">
                                {isLoading ? "Searching…" : `${total} scholarship${total === 1 ? "" : "s"} found`}
                                {isFetching && !isLoading && <span className="ml-2 text-ink/40">Updating…</span>}
                            </p>
                            {(activeFilterCount > 0 || filters.q) && (
                                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 font-bold text-violet hover:text-violet-700">
                                    <FiX /> Clear search and filters
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <Loading label="Loading scholarships..." />
                        ) : isError ? (
                            <p className="mt-12 text-center text-sm font-semibold text-coral">Could not load scholarships. Please try again later.</p>
                        ) : scholarships.length === 0 ? (
                            <div className="mt-10 rounded-3xl bg-white px-6 py-14 text-center shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                                <p className="font-display text-lg font-bold text-ink">No scholarships match</p>
                                <p className="mt-1 text-sm text-ink/60">Try a different search or remove some filters.</p>
                                <button type="button" onClick={clearAll} className="mt-6 rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                                    Clear search and filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60 transition-opacity" : ""}`}>
                                    {scholarships.map((scholarship, index) => (
                                        <ScholarCard
                                            key={scholarship?._id}
                                            scholarship={scholarship}
                                            tagIndex={index}
                                            applied={!!findApplication(scholarship?._id)}
                                            saved={isSaved(scholarship?._id)}
                                            onToggleSave={canUseWishlist ? toggleSaved : undefined}
                                            compared={compareIds.includes(scholarship?._id)}
                                            onToggleCompare={toggleCompare}
                                            compareDisabled={compareIds.length >= MAX_COMPARE}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                                        <button
                                            type="button"
                                            onClick={() => goToPage(filters.page - 1)}
                                            disabled={filters.page <= 1}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink disabled:opacity-40"
                                            aria-label="Previous page"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === totalPages || Math.abs(page - filters.page) <= 1)
                                            .map((page, index, pages) => (
                                                <span key={page} className="flex items-center gap-2">
                                                    {index > 0 && page - pages[index - 1] > 1 && <span className="text-ink/30">…</span>}
                                                    <button
                                                        type="button"
                                                        onClick={() => goToPage(page)}
                                                        aria-current={page === filters.page ? "page" : undefined}
                                                        className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold ${
                                                            page === filters.page ? "bg-violet text-white" : "border border-black/10 bg-white text-ink hover:bg-black/5"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            ))}
                                        <button
                                            type="button"
                                            onClick={() => goToPage(filters.page + 1)}
                                            disabled={filters.page >= totalPages}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink disabled:opacity-40"
                                            aria-label="Next page"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {compareIds.length > 0 && (
                <div className="fixed inset-x-0 bottom-4 z-40 px-4">
                    <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-white shadow-[0_20px_60px_-20px_rgba(20,20,31,0.6)]">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <FiColumns className="shrink-0" />
                            {compareIds.length} of {MAX_COMPARE} selected
                        </p>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setCompareIds([])} className="rounded-full px-3 py-2 text-xs font-bold text-white/70 hover:text-white">
                                Clear
                            </button>
                            {compareIds.length >= 2 ? (
                                <Link to={`/compare?ids=${compareIds.join(",")}`} className="rounded-full bg-violet px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-600">
                                    Compare
                                </Link>
                            ) : (
                                <span className="rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-white/70">Pick one more</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllScholarships;

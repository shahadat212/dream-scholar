import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHeart } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/DashboardHeader';
import EmptyState from '../../../components/EmptyState';
import ScholarCard from '../../../components/ScholarCard';
import useWishlist from '../../hooks/useWishlist';
import useMyApplications from '../../hooks/useMyApplications';

const MyWishlist = () => {
    const { wishlist, isWishlistLoading, isWishlistError, isSaved, toggleSaved } = useWishlist();
    const { findApplication } = useMyApplications();

    const available = wishlist.filter((entry) => entry?.scholarship);
    const removed = wishlist.filter((entry) => !entry?.scholarship);

    return (
        <div className="space-y-8">
            <Helmet>
                <title>My Wishlist | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader tag="Saved for later" title="My Wishlist" subtitle="Scholarships you saved while browsing. Apply before their deadlines close.">
                {wishlist.length > 0 && (
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        {wishlist.length} saved
                    </span>
                )}
            </DashboardHeader>

            {isWishlistLoading ? (
                <Loading label="Loading your wishlist..." />
            ) : isWishlistError ? (
                <p className="text-sm font-semibold text-coral">We could not load your wishlist. Please refresh the page.</p>
            ) : wishlist.length === 0 ? (
                <EmptyState icon={FaHeart} title="Your wishlist is empty" text="Tap the heart on any scholarship to save it here.">
                    <Link to="/scholarships" className="inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600">
                        Browse scholarships
                    </Link>
                </EmptyState>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                        {available.map((entry, index) => (
                            <ScholarCard
                                key={entry?._id}
                                scholarship={entry.scholarship}
                                tagIndex={index}
                                applied={!!findApplication(entry?.scholarshipId)}
                                saved={isSaved(entry?.scholarshipId)}
                                onToggleSave={toggleSaved}
                            />
                        ))}
                    </div>

                    {removed.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink/40">No longer available</h2>
                            {removed.map((entry) => (
                                <div key={entry?._id} className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                                    <p className="text-sm text-ink/60">A scholarship you saved has been removed by the university.</p>
                                    <button
                                        type="button"
                                        onClick={() => toggleSaved(entry?.scholarshipId)}
                                        className="shrink-0 rounded-full bg-coral-50 px-4 py-2 text-xs font-bold text-coral-700 hover:bg-coral hover:text-white"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyWishlist;

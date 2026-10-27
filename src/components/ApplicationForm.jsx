import React from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import useAuth from "../pages/hooks/useAuth";
import useAxiosPublic from "../pages/hooks/useAxiosPublic";
import useMyApplications from "../pages/hooks/useMyApplications";
import ErrorPage from "./ErrorPage";
import Loading from "./Loading";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const ApplicationForm = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const location = useLocation();
    const { findApplication, isMyApplicationsLoading } = useMyApplications();
    const draft = location.state?.application?.scholarShipId === id ? location.state.application : null;

    const { data: scholarship, isLoading } = useQuery({
        queryKey: ['scholarship', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/scholarships/${id}`);
            return res.data;
        },
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: draft ? {
            phoneNumber: draft.phoneNumber,
            address: draft.address,
            gender: draft.gender,
            degree: draft.degree,
            sscResult: draft.sscResult,
            hscResult: draft.hscResult,
            studyGap: draft.studyGap,
        } : undefined,
    });

    if (isLoading || isMyApplicationsLoading) {
        return <Loading label="Loading scholarship..." />;
    }

    if (!scholarship) {
        return <ErrorPage />;
    }

    if (findApplication(scholarship?._id) || (!!scholarship?.applicationDeadline && scholarship.applicationDeadline < new Date().toISOString().split('T')[0])) {
        return <Navigate to={`/scholarships/details/${scholarship?._id}`} replace></Navigate>;
    }

    const onSubmit = async (data) => {
        const newPhoto = data.applicantPhoto?.[0];
        if (!newPhoto && !draft?.applicantPhoto) {
            Swal.fire({ icon: "error", title: "Photo required", text: "Please upload a photo.", confirmButtonColor: "#5B4CFB" });
            return;
        }

        try {
            const photoUrl = newPhoto ? URL.createObjectURL(newPhoto) : draft.applicantPhoto;

            const appliedScholar = {
                phoneNumber: data?.phoneNumber,
                applicantPhoto: photoUrl,
                address: data?.address,
                gender: data?.gender,
                degree: data?.degree,
                sscResult: parseFloat(data?.sscResult),
                hscResult: parseFloat(data?.hscResult),
                studyGap: data?.studyGap || "No study gap",
                university: scholarship?.universityName,
                category: scholarship?.scholarshipCategory,
                subject: scholarship?.subjectCategory,
                userName: user?.displayName,
                userEmail: user?.email,
                scholarShipId: scholarship?._id,
                scholarshipName: scholarship?.scholarshipName,
                applicationFees: scholarship?.applicationFees,
                serviceCharge: scholarship?.serviceCharge,
            };

            navigate(`/payment/${scholarship?._id}`, { state: { application: appliedScholar } });
        } catch {
            Swal.fire({ icon: "error", title: "Something went wrong", text: "Please try again.", confirmButtonColor: "#5B4CFB" });
        }
    };

    return (
        <div className="min-h-[70vh] py-16">
            <Helmet>
                <title>Apply | Dream Scholar Hub</title>
            </Helmet>
            <div className="mx-auto max-w-lg px-6">
                <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">Step 1 of 2 · Your details</span>
                <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">{scholarship?.scholarshipName}</h1>
                <p className="mt-2 text-sm text-ink/60">Fill in your details. You will pay the application fee on the next step, and your application is submitted once payment is confirmed.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]">
                    <div>
                        <input {...register("phoneNumber", { required: "Phone number is required" })} type="text"
                            placeholder="Phone Number" className={fieldClass} />
                        {errors.phoneNumber && <span className="mt-1 block text-xs font-semibold text-coral">{errors.phoneNumber.message}</span>}
                    </div>

                    <div>
                        <input {...register("applicantPhoto", { required: draft?.applicantPhoto ? false : "Photo is required" })} type="file" accept="image/*"
                            className="w-full text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-violet file:px-4 file:py-2 file:text-xs file:font-bold file:text-white" />
                        {errors.applicantPhoto && <span className="mt-1 block text-xs font-semibold text-coral">{errors.applicantPhoto.message}</span>}
                        {draft?.applicantPhoto && !errors.applicantPhoto && <span className="mt-1 block text-xs text-ink/40">Your earlier photo is kept unless you choose a new one.</span>}
                    </div>

                    <div>
                        <input {...register("address", { required: "Address is required" })} type="text"
                            placeholder="Address (Village, District, Country)" className={fieldClass} />
                        {errors.address && <span className="mt-1 block text-xs font-semibold text-coral">{errors.address.message}</span>}
                    </div>

                    <div>
                        <select {...register("gender", { required: "Gender selection is required" })} className={fieldClass}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <span className="mt-1 block text-xs font-semibold text-coral">{errors.gender.message}</span>}
                    </div>

                    <div>
                        <select {...register("degree", { required: "Degree selection is required" })} className={fieldClass}>
                            <option value="">Select Degree</option>
                            {(scholarship?.degreeLevels?.length ? scholarship.degreeLevels : ["Diploma", "Bachelor", "Masters"]).map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        {errors.degree && <span className="mt-1 block text-xs font-semibold text-coral">{errors.degree.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input {...register("sscResult", { required: "Required", pattern: { value: /^[0-9.]+$/, message: "Numeric only" } })} type="text"
                                placeholder="SSC Result" className={fieldClass} />
                            {errors.sscResult && <span className="mt-1 block text-xs font-semibold text-coral">{errors.sscResult.message}</span>}
                        </div>
                        <div>
                            <input {...register("hscResult", { required: "Required", pattern: { value: /^[0-9.]+$/, message: "Numeric only" } })} type="text"
                                placeholder="HSC Result" className={fieldClass} />
                            {errors.hscResult && <span className="mt-1 block text-xs font-semibold text-coral">{errors.hscResult.message}</span>}
                        </div>
                    </div>

                    <div>
                        <select {...register("studyGap")} className={fieldClass}>
                            <option value="No study gap">No Study Gap</option>
                            <option value="1 Year">1 Year</option>
                            <option value="2 Years">2 Years</option>
                            <option value="3+ Years">3+ Years</option>
                        </select>
                    </div>

                    <div className="rounded-2xl bg-violet/5 px-4 py-3 text-xs font-semibold text-ink/50">
                        <p>{scholarship?.universityName}</p>
                        <p>{scholarship?.scholarshipCategory} — {scholarship?.subjectCategory}</p>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:opacity-60">
                        {isSubmitting ? "Saving…" : "Continue to Payment"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;

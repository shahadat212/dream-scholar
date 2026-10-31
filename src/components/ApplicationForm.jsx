import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { FiCheck, FiClock, FiFileText, FiMapPin, FiLock } from "react-icons/fi";
import useToast from "../pages/hooks/useToast";
import useAuth from "../pages/hooks/useAuth";
import useAxiosPublic from "../pages/hooks/useAxiosPublic";
import useAxiosSecure from "../pages/hooks/useAxiosSecure";
import useMyApplications from "../pages/hooks/useMyApplications";
import useImageUpload from "../pages/hooks/useImageUpload";
import ErrorPage from "./ErrorPage";
import Loading from "./Loading";
import Spinner from "./Spinner";
import FormSection from "./FormSection";
import ApplicantDetailsFields, { DEFAULT_DEGREES, applicantDefaults, buildApplicantDetails, certificateDefaults, missingCertificateErrors, resolveCertificates } from "./ApplicantDetailsFields";

const errorClass = "mt-1 block text-xs font-semibold text-coral";
const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] md:p-8";

const todayString = () => new Date().toISOString().split("T")[0];
const formatMoney = (value) => `$${(Number(value) || 0).toLocaleString("en-US")}`;
const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return isNaN(date) ? value : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const ApplicationForm = () => {
    const toast = useToast();
    const { id } = useParams();
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();
    const { findApplication, isMyApplicationsLoading } = useMyApplications();
    const { resolveImage } = useImageUpload();
    const draft = location.state?.application?.scholarShipId === id ? location.state.application : null;

    const { data: scholarship, isLoading } = useQuery({
        queryKey: ['scholarship', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/scholarships/${id}`);
            return res.data;
        },
    });

    const validateMutation = useMutation({
        mutationFn: (application) => axiosSecure.post('/applications/validate', application),
    });

    const { register, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            ...applicantDefaults(draft, user?.displayName),
            eligibilityConfirmed: !!draft,
            documentsConfirmed: !!draft,
            declarationAccepted: !!draft,
        },
    });
    const [photo, setPhoto] = useState(/^https?:\/\//i.test(draft?.applicantPhoto || "") ? draft.applicantPhoto : "");
    const [photoError, setPhotoError] = useState("");
    const [certificates, setCertificates] = useState(certificateDefaults(draft));
    const [certificateErrors, setCertificateErrors] = useState({});
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    if (isLoading || isMyApplicationsLoading) {
        return <Loading label="Loading scholarship..." />;
    }

    if (!scholarship) {
        return <ErrorPage />;
    }

    if (findApplication(scholarship?._id) || (!!scholarship?.applicationDeadline && scholarship.applicationDeadline < todayString())) {
        return <Navigate to={`/scholarships/details/${scholarship?._id}`} replace></Navigate>;
    }

    const degreeOptions = scholarship?.degreeLevels?.length ? scholarship.degreeLevels : DEFAULT_DEGREES;
    const totalDue = (Number(scholarship?.applicationFees) || 0) + (Number(scholarship?.serviceCharge) || 0);
    const daysLeft = Math.max(Math.ceil((new Date(`${scholarship?.applicationDeadline}T23:59:59`) - new Date()) / 86400000), 0);

    const handleCertificateChange = (key, value) => {
        setCertificates((current) => ({ ...current, [key]: value }));
        setCertificateErrors((current) => ({ ...current, [key]: "" }));
    };

    const onInvalid = () => {
        if (!photo) setPhotoError("Please upload a clear photo of yourself.");
        setCertificateErrors(missingCertificateErrors(certificates, getValues("degree"), getValues("englishTest")));
        toast.fire({ icon: "error", title: "Some details need attention", text: "Check the highlighted fields and try again." });
    };

    const onSubmit = async (data) => {
        const missing = missingCertificateErrors(certificates, data.degree, data.englishTest);
        if (!photo || Object.keys(missing).length) {
            onInvalid();
            return;
        }

        let photoURL;
        let certificateURLs;
        setIsUploadingFiles(true);
        try {
            [photoURL, certificateURLs] = await Promise.all([
                resolveImage(photo),
                resolveCertificates(certificates, data.degree, data.englishTest, resolveImage),
            ]);
        } catch (error) {
            toast.fire({ icon: "error", title: "Upload failed", text: error.message });
            return;
        } finally {
            setIsUploadingFiles(false);
        }
        setPhoto(photoURL);
        setCertificates((current) => ({ ...current, ...Object.fromEntries(Object.entries(certificateURLs).filter(([, url]) => url)) }));

        const application = {
            scholarShipId: scholarship?._id,
            userEmail: user?.email,
            applicantPhoto: photoURL,
            certificates: certificateURLs,
            ...buildApplicantDetails(data),
            eligibilityConfirmed: data.eligibilityConfirmed,
            documentsConfirmed: data.documentsConfirmed,
            declarationAccepted: data.declarationAccepted,
        };

        try {
            await validateMutation.mutateAsync(application);
            navigate(`/payment/${scholarship?._id}`, { state: { application } });
        } catch (error) {
            toast.fire({
                icon: "error",
                title: "Please check your details",
                text: error?.response?.data?.message || "We could not check your application. Please try again.",
            });
        }
    };

    return (
        <div className="min-h-[70vh] py-12">
            <Helmet>
                <title>Apply | Dream Scholar Hub</title>
            </Helmet>

            <div className="mx-auto max-w-screen-xl px-6">
                <ol className="flex flex-wrap items-center gap-2 text-xs font-bold" aria-label="Application steps">
                    <li className="flex items-center gap-2 rounded-full bg-violet px-4 py-1.5 text-white" aria-current="step">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">1</span> Your details
                    </li>
                    <li className="h-px w-6 bg-black/10" aria-hidden="true"></li>
                    <li className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-ink/50 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">2</span> Payment
                    </li>
                    <li className="h-px w-6 bg-black/10" aria-hidden="true"></li>
                    <li className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-ink/50 shadow-[0_4px_20px_-10px_rgba(20,20,31,0.3)]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">3</span> Submitted
                    </li>
                </ol>

                <h1 className="mt-6 font-display text-3xl font-extrabold text-ink md:text-4xl">Apply for {scholarship?.scholarshipName}</h1>
                <p className="mt-2 max-w-2xl text-ink/60">
                    Fill in every section carefully. The admissions team uses these details to assess you, and after you submit you can only change your phone, address and gender.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                    <aside className="space-y-4 lg:sticky lg:top-28 lg:order-last">
                        <div className={cardClass}>
                            <div className="flex items-center gap-3">
                                <img
                                    src={scholarship?.universityImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(scholarship?.universityName || "U")}`}
                                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(scholarship?.universityName || "U")}`; }}
                                    alt=""
                                    className="h-12 w-12 shrink-0 rounded-2xl border border-black/5 object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate font-display font-bold text-ink">{scholarship?.universityName}</p>
                                    <p className="flex items-center gap-1 truncate text-xs text-ink/50">
                                        <FiMapPin className="shrink-0" /> {[scholarship?.universityCity, scholarship?.universityCountry].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-violet/10 px-3 py-1 text-[11px] font-bold text-violet">{scholarship?.scholarshipCategory}</span>
                                <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-ink/60">{scholarship?.subjectCategory}</span>
                            </div>
                            <dl className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-ink/50">Deadline</dt>
                                    <dd className="text-right font-semibold text-coral-700">
                                        {formatDate(scholarship?.applicationDeadline)}
                                        <span className="block text-[11px] font-semibold text-ink/40">{daysLeft <= 1 ? "Closes today" : `${daysLeft} days left`}</span>
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-ink/50">Open to</dt>
                                    <dd className="text-right font-semibold text-ink">{degreeOptions.join(", ")}</dd>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-black/5 pt-3">
                                    <dt className="font-bold text-ink">Paid on the next step</dt>
                                    <dd className="font-display text-lg font-bold text-violet">{formatMoney(totalDue)}</dd>
                                </div>
                            </dl>
                            <p className="mt-2 text-xs text-ink/40">
                                {Number(scholarship?.applicationFees) > 0 ? `${formatMoney(scholarship.applicationFees)} university fee` : "No university fee"} + {formatMoney(scholarship?.serviceCharge)} service fee
                            </p>
                        </div>

                        <div className="rounded-3xl bg-ink p-6 text-white">
                            <p className="flex items-center gap-2 font-display font-bold"><FiClock /> What happens next</p>
                            <ol className="mt-3 space-y-2 text-sm text-white/70">
                                <li>1. We check your details, then you pay {formatMoney(totalDue)} securely by card.</li>
                                <li>2. Your application is sent with the status <span className="font-semibold text-sun">pending</span>.</li>
                                <li>3. Follow every update from your dashboard and notifications.</li>
                            </ol>
                        </div>
                    </aside>

                    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
                        <ApplicantDetailsFields
                            register={register}
                            errors={errors}
                            watch={watch}
                            getValues={getValues}
                            photo={photo}
                            onPhotoChange={(value) => {
                                setPhoto(value);
                                setPhotoError("");
                            }}
                            photoError={photoError}
                            certificates={certificates}
                            onCertificateChange={handleCertificateChange}
                            certificateErrors={certificateErrors}
                            disabled={isSubmitting}
                            degreeOptions={degreeOptions}
                            email={user?.email}
                        />

                        <FormSection step="5" title="Eligibility & declaration" text="Check the requirements below before you continue.">
                            <div className="rounded-2xl bg-cream p-5 sm:col-span-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Eligibility requirements</p>
                                {scholarship?.eligibility?.length ? (
                                    <ul className="mt-2 space-y-1.5">
                                        {scholarship.eligibility.map((item, index) => (
                                            <li key={`${index}-${item}`} className="flex items-start gap-2 text-sm text-ink/70">
                                                <FiCheck className="mt-0.5 shrink-0 text-mint-700" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-ink/50">The university has not listed specific requirements.</p>
                                )}
                                <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink/40">Documents to keep ready</p>
                                {scholarship?.requiredDocuments?.length ? (
                                    <ul className="mt-2 space-y-1.5">
                                        {scholarship.requiredDocuments.map((item, index) => (
                                            <li key={`${index}-${item}`} className="flex items-start gap-2 text-sm text-ink/70">
                                                <FiFileText className="mt-0.5 shrink-0 text-violet" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-ink/50">No documents listed yet.</p>
                                )}
                            </div>

                            {[
                                { name: "eligibilityConfirmed", text: "I meet all of the eligibility requirements listed above.", message: "Confirm that you meet the requirements" },
                                { name: "documentsConfirmed", text: "I have the documents above ready and will provide them if the university asks.", message: "Confirm that your documents are ready" },
                                { name: "declarationAccepted", text: "I declare that the information I have given is true and complete. I understand that false information can lead to my application being rejected.", message: "You must accept the declaration" },
                            ].map((item) => (
                                <div key={item.name} className="sm:col-span-2">
                                    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/80">
                                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-violet" {...register(item.name, { validate: (v) => v === true || item.message })} />
                                        {item.text}
                                    </label>
                                    {errors[item.name] && <span className={`${errorClass} pl-7`}>{errors[item.name].message}</span>}
                                </div>
                            ))}
                        </FormSection>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link to={`/scholarships/details/${scholarship?._id}`} className="text-center text-sm font-bold text-ink/60 hover:text-ink">
                                Back to scholarship
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-full bg-violet px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? <Spinner /> : <FiLock />}
                                {isUploadingFiles ? "Uploading documents…" : isSubmitting ? "Checking your details…" : `Continue to payment · ${formatMoney(totalDue)}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationForm;

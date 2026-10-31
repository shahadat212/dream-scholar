import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useToast from '../pages/hooks/useToast';
import useAxiosPublic from '../pages/hooks/useAxiosPublic';
import useAxiosSecure from '../pages/hooks/useAxiosSecure';
import useImageUpload from '../pages/hooks/useImageUpload';
import ErrorPage from './ErrorPage';
import Loading from './Loading';
import Spinner from './Spinner';
import DashboardHeader from './DashboardHeader';
import StatusBadge from './StatusBadge';
import ApplicantDetailsFields, { DEFAULT_DEGREES, applicantDefaults, buildApplicantDetails, certificateDefaults, missingCertificateErrors, resolveCertificates } from './ApplicantDetailsFields';

const cardClass = "rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)]";

const EditApplicationForm = () => {
    const toast = useToast();
    const { id } = useParams();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { resolveImage } = useImageUpload();
    const [photo, setPhoto] = useState('');
    const [photoError, setPhotoError] = useState('');
    const [certificates, setCertificates] = useState(certificateDefaults(null));
    const [certificateErrors, setCertificateErrors] = useState({});
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    const { data: application, isLoading, isError } = useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/${id}`);
            return res.data;
        },
    });

    const { data: scholarship } = useQuery({
        queryKey: ['scholarship', application?.scholarShipId],
        enabled: !!application?.scholarShipId,
        queryFn: async () => (await axiosPublic.get(`/scholarships/${application.scholarShipId}`)).data,
    });

    const { register, handleSubmit, reset, watch, getValues, formState: { errors, isSubmitting } } = useForm({
        defaultValues: applicantDefaults(null),
    });

    useEffect(() => {
        if (application) {
            reset(applicantDefaults(application));
            setPhoto(/^https?:\/\//i.test(application?.applicantPhoto || '') ? application.applicantPhoto : '');
            setCertificates(certificateDefaults(application));
        }
    }, [application, reset]);

    const updateMutation = useMutation({
        mutationFn: (updates) => axiosSecure.patch(`/applications/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application', id] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });

    if (isLoading) {
        return <Loading label="Loading application..." />;
    }

    if (isError || !application) {
        return <ErrorPage />;
    }

    const isPending = application?.applicationStatus === 'pending';
    const isRejected = application?.applicationStatus === 'rejected';
    const canEdit = isPending || isRejected;
    const isOlderApplication = !application?.dateOfBirth || !application?.addressLine || !application?.certificates;
    const degreeOptions = scholarship?.degreeLevels?.length ? scholarship.degreeLevels : DEFAULT_DEGREES;

    const handleCertificateChange = (key, value) => {
        setCertificates((current) => ({ ...current, [key]: value }));
        setCertificateErrors((current) => ({ ...current, [key]: '' }));
    };

    const onInvalid = () => {
        if (!photo) setPhotoError('Please upload a clear photo of yourself.');
        setCertificateErrors(missingCertificateErrors(certificates, getValues('degree'), getValues('englishTest')));
        toast.fire({ icon: 'error', title: 'Some details need attention', text: 'Check the highlighted fields and try again.' });
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
            toast.fire({ icon: 'error', title: 'Upload failed', text: error.message });
            return;
        } finally {
            setIsUploadingFiles(false);
        }
        setPhoto(photoURL);
        setCertificates((current) => ({ ...current, ...Object.fromEntries(Object.entries(certificateURLs).filter(([, url]) => url)) }));

        try {
            await updateMutation.mutateAsync({
                ...buildApplicantDetails(data),
                applicantPhoto: photoURL,
                certificates: certificateURLs,
                ...(isRejected ? { resubmit: true } : {}),
            });
            toast.fire(isRejected
                ? { title: 'Application resubmitted', text: 'Its status is pending again and the committee has been notified.', icon: 'success' }
                : { title: 'Saved', text: 'Your application was updated.', icon: 'success' });
            navigate('/userDashboard/myApplication');
        } catch (error) {
            toast.fire({ title: 'Update failed', text: error?.response?.data?.message || 'Please try again.', icon: 'error' });
        }
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Edit Application | Dream Scholar Hub</title>
            </Helmet>

            <DashboardHeader
                tag={isRejected ? 'Rejected application' : 'Pending application'}
                title={isRejected ? 'Fix & Resubmit' : 'Edit Application'}
                subtitle={isRejected
                    ? 'Correct your details using the committee feedback, then resubmit. You will not be charged again.'
                    : 'You can correct any of your details while the application is still pending. Once the review starts, it is locked.'}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                <aside className={`${cardClass} lg:sticky lg:top-24 lg:order-last`}>
                    <StatusBadge status={application?.applicationStatus} />
                    <p className="mt-4 font-display text-lg font-bold text-ink">{application?.scholarshipName}</p>
                    <p className="text-sm text-ink/60">{application?.university}</p>
                    <dl className="mt-5 space-y-3 border-t border-black/5 pt-5 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Subject</dt>
                            <dd className="text-right font-semibold text-ink">{application?.subject}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Funding</dt>
                            <dd className="text-right font-semibold text-ink">{application?.category}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink/50">Applied on</dt>
                            <dd className="text-right font-semibold text-ink">{application?.currentDate}</dd>
                        </div>
                    </dl>
                    <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-xs text-ink/60">
                        The scholarship, fees and your signed declaration cannot be changed. To apply somewhere else, cancel this application from My Applications.
                    </p>
                </aside>

                {canEdit ? (
                    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
                        {isRejected && (
                            <div className="rounded-3xl bg-coral-50 px-5 py-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-coral-700">Feedback from the committee</p>
                                <p className="mt-1 whitespace-pre-line text-sm font-semibold text-coral-700">
                                    {application?.feedback || 'No written feedback was given. Review your details before resubmitting.'}
                                </p>
                            </div>
                        )}

                        {isOlderApplication && (
                            <p className="rounded-3xl bg-sun-50 px-5 py-4 text-sm font-semibold text-sun-700">
                                This application was made before the form was updated. Please fill in the new fields to save your changes.
                            </p>
                        )}

                        <ApplicantDetailsFields
                            register={register}
                            errors={errors}
                            watch={watch}
                            getValues={getValues}
                            photo={photo}
                            onPhotoChange={(value) => {
                                setPhoto(value);
                                setPhotoError('');
                            }}
                            photoError={photoError}
                            certificates={certificates}
                            onCertificateChange={handleCertificateChange}
                            certificateErrors={certificateErrors}
                            disabled={isSubmitting}
                            degreeOptions={degreeOptions}
                            email={application?.userEmail}
                        />

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link
                                to="/userDashboard/myApplication"
                                className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-center text-sm font-bold text-ink hover:bg-black/5"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-full bg-violet px-8 py-3.5 text-sm font-bold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting && <Spinner />}
                                {isUploadingFiles ? 'Uploading documents…' : isSubmitting ? (isRejected ? 'Resubmitting…' : 'Saving…') : isRejected ? 'Resubmit application' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={cardClass}>
                        <p className="font-display text-lg font-bold text-ink">This application can no longer be edited</p>
                        <p className="mt-1 text-sm text-ink/60">The review has already started. You can follow its progress from My Applications.</p>
                        <Link
                            to="/userDashboard/myApplication"
                            className="mt-5 inline-block rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-600"
                        >
                            Back to My Applications
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditApplicationForm;

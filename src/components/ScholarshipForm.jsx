import React from 'react';
import { useForm } from 'react-hook-form';

const KNOWN_SUBJECTS = ['Agriculture', 'Engineering', 'Computer Science', 'Business Administration', 'Medicine'];
const DEGREE_LEVELS = ['Diploma', 'Bachelor', 'Masters', 'PhD'];
const BENEFITS = ['Tuition', 'Monthly stipend', 'Accommodation', 'Travel', 'Health insurance', 'Books & supplies'];
const OTHER_SUBJECT = '__other__';

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-bold text-ink";
const hintClass = "mt-1 block text-xs text-ink/40";
const errorClass = "mt-1 block text-xs font-semibold text-coral";
const optionalTag = <span className="font-normal text-ink/40">(optional)</span>;

const today = () => new Date().toISOString().split('T')[0];
const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test((value || '').trim());
const lines = (value) => (value || '').split('\n').map((item) => item.trim()).filter(Boolean);
const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const money = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) && value !== '' ? amount : 0;
};

const toFormValues = (scholarship) => {
    const subject = scholarship?.subjectCategory || '';
    const isKnown = !subject || KNOWN_SUBJECTS.includes(subject);
    return {
        universityName: scholarship?.universityName || '',
        universityCountry: scholarship?.universityCountry || '',
        universityCity: scholarship?.universityCity || '',
        universityRank: scholarship?.universityRank ?? '',
        universityImage: isHttpUrl(scholarship?.universityImage) ? scholarship.universityImage : '',
        officialWebsite: scholarship?.officialWebsite || '',
        scholarshipName: scholarship?.scholarshipName || '',
        subjectChoice: isKnown ? subject : OTHER_SUBJECT,
        customSubject: isKnown ? '' : subject,
        scholarshipCategory: scholarship?.scholarshipCategory || '',
        degreeLevels: scholarship?.degreeLevels || [],
        benefits: scholarship?.benefits || [],
        numberOfAwards: scholarship?.numberOfAwards ?? '',
        description: scholarship?.description || '',
        eligibility: (scholarship?.eligibility || []).join('\n'),
        requiredDocuments: (scholarship?.requiredDocuments || []).join('\n'),
        tuitionFees: scholarship?.tuitionFees ?? '',
        applicationFees: scholarship?.applicationFees ?? '',
        serviceCharge: scholarship?.serviceCharge ?? '',
        applicationDeadline: scholarship?.applicationDeadline || '',
        studyStartDate: scholarship?.studyStartDate || '',
    };
};

const toPayload = (values) => ({
    universityName: values.universityName.trim(),
    universityCountry: values.universityCountry.trim(),
    universityCity: values.universityCity.trim(),
    universityRank: Number(values.universityRank),
    universityImage: values.universityImage.trim(),
    officialWebsite: values.officialWebsite.trim(),
    scholarshipName: values.scholarshipName.trim(),
    subjectCategory: values.subjectChoice === OTHER_SUBJECT ? values.customSubject.trim() : values.subjectChoice,
    scholarshipCategory: values.scholarshipCategory,
    degreeLevels: asArray(values.degreeLevels),
    benefits: asArray(values.benefits),
    numberOfAwards: values.numberOfAwards === '' ? null : Number(values.numberOfAwards),
    description: values.description.trim(),
    eligibility: lines(values.eligibility),
    requiredDocuments: lines(values.requiredDocuments),
    tuitionFees: money(values.tuitionFees),
    applicationFees: money(values.applicationFees),
    serviceCharge: money(values.serviceCharge),
    applicationDeadline: values.applicationDeadline,
    studyStartDate: values.studyStartDate || '',
});

const PillGroup = ({ name, options, register, rules }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <label key={option} className="cursor-pointer">
                    <input type="checkbox" value={option} className="peer sr-only" {...register(name, rules)} />
                    <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-ink/70 transition-colors hover:bg-black/5 peer-checked:border-violet peer-checked:bg-violet peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet peer-focus-visible:ring-offset-2">
                        {option}
                    </span>
                </label>
            ))}
        </div>
    );
};

const Section = ({ variant, step, title, text, children }) => {
    return (
        <section className={variant === 'page' ? 'rounded-3xl bg-white p-6 shadow-[0_8px_30px_-15px_rgba(20,20,31,0.2)] md:p-8' : 'border-t border-black/5 pt-6 first:border-0 first:pt-0'}>
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

const ScholarshipForm = ({ initialValues, mode = 'create', variant = 'page', submitLabel, submittingLabel, onSubmit, onCancel, postedBy }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: toFormValues(initialValues) });

    const subjectChoice = watch('subjectChoice');
    const logoUrl = watch('universityImage');
    const universityName = watch('universityName');
    const applicationFee = money(watch('applicationFees'));
    const serviceFee = money(watch('serviceCharge'));
    const isCreate = mode === 'create';

    const submit = async (values) => {
        const saved = await onSubmit(toPayload(values));
        if (saved && isCreate) reset(toFormValues(null));
    };

    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(universityName || 'University')}`;

    return (
        <form onSubmit={handleSubmit(submit)} className={variant === 'page' ? 'max-w-4xl space-y-6' : 'space-y-6'} noValidate>
            <Section variant={variant} step="1" title="University" text="Who offers the scholarship and where.">
                <div className="sm:col-span-2">
                    <label htmlFor="sf-universityName" className={labelClass}>University name</label>
                    <input id="sf-universityName" type="text" {...register('universityName', { validate: (v) => !!v.trim() || 'University name is required' })} className={fieldClass} />
                    {errors.universityName && <span className={errorClass}>{errors.universityName.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-universityCountry" className={labelClass}>Country</label>
                    <input id="sf-universityCountry" type="text" {...register('universityCountry', { validate: (v) => !!v.trim() || 'Country is required' })} className={fieldClass} />
                    {errors.universityCountry && <span className={errorClass}>{errors.universityCountry.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-universityCity" className={labelClass}>City</label>
                    <input id="sf-universityCity" type="text" {...register('universityCity', { validate: (v) => !!v.trim() || 'City is required' })} className={fieldClass} />
                    {errors.universityCity && <span className={errorClass}>{errors.universityCity.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-universityRank" className={labelClass}>World rank</label>
                    <input
                        id="sf-universityRank"
                        type="number"
                        min="1"
                        step="1"
                        {...register('universityRank', {
                            required: 'World rank is required',
                            validate: (v) => (Number.isInteger(Number(v)) && Number(v) >= 1) || 'Use a whole number of 1 or more',
                        })}
                        className={fieldClass}
                    />
                    {errors.universityRank && <span className={errorClass}>{errors.universityRank.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-officialWebsite" className={labelClass}>Official website {optionalTag}</label>
                    <input
                        id="sf-officialWebsite"
                        type="url"
                        placeholder="https://"
                        {...register('officialWebsite', { validate: (v) => !v.trim() || isHttpUrl(v) || 'Enter a link starting with http:// or https://' })}
                        className={fieldClass}
                    />
                    {errors.officialWebsite && <span className={errorClass}>{errors.officialWebsite.message}</span>}
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="sf-universityImage" className={labelClass}>Logo URL {optionalTag}</label>
                    <div className="flex items-center gap-3">
                        <img
                            src={isHttpUrl(logoUrl) ? logoUrl : fallbackLogo}
                            onError={(e) => { e.currentTarget.src = fallbackLogo; }}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full border border-black/5 bg-white object-cover"
                        />
                        <input
                            id="sf-universityImage"
                            type="url"
                            placeholder="https://… (leave empty to use the university's initials)"
                            {...register('universityImage', { validate: (v) => !v.trim() || isHttpUrl(v) || 'Enter a link starting with http:// or https://' })}
                            className={fieldClass}
                        />
                    </div>
                    {errors.universityImage && <span className={errorClass}>{errors.universityImage.message}</span>}
                </div>
            </Section>

            <Section variant={variant} step="2" title="Scholarship" text="What students are applying for and who can apply.">
                <div className="sm:col-span-2">
                    <label htmlFor="sf-scholarshipName" className={labelClass}>Scholarship name</label>
                    <input id="sf-scholarshipName" type="text" {...register('scholarshipName', { validate: (v) => !!v.trim() || 'Scholarship name is required' })} className={fieldClass} />
                    {errors.scholarshipName && <span className={errorClass}>{errors.scholarshipName.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-subjectChoice" className={labelClass}>Subject</label>
                    <select id="sf-subjectChoice" {...register('subjectChoice', { required: 'Pick a subject' })} className={fieldClass}>
                        <option value="" disabled>Select subject</option>
                        {KNOWN_SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                        <option value={OTHER_SUBJECT}>Others</option>
                    </select>
                    {errors.subjectChoice && <span className={errorClass}>{errors.subjectChoice.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-scholarshipCategory" className={labelClass}>Funding type</label>
                    <select id="sf-scholarshipCategory" {...register('scholarshipCategory', { required: 'Pick a funding type' })} className={fieldClass}>
                        <option value="" disabled>Select type</option>
                        <option value="Full fund">Full fund (all tuition covered)</option>
                        <option value="Partial fund">Partial fund (part of tuition covered)</option>
                        <option value="Self-fund">Self-fund (no tuition covered)</option>
                    </select>
                    {errors.scholarshipCategory && <span className={errorClass}>{errors.scholarshipCategory.message}</span>}
                </div>
                {subjectChoice === OTHER_SUBJECT && (
                    <div className="sm:col-span-2">
                        <label htmlFor="sf-customSubject" className={labelClass}>Subject name</label>
                        <input
                            id="sf-customSubject"
                            type="text"
                            placeholder="e.g. Fine Arts, Public Health"
                            {...register('customSubject', {
                                validate: (v) => getValues('subjectChoice') !== OTHER_SUBJECT || v.trim().length >= 2 || 'Type the subject name',
                            })}
                            className={fieldClass}
                        />
                        {errors.customSubject && <span className={errorClass}>{errors.customSubject.message}</span>}
                        <span className={hintClass}>Students find it under &ldquo;Others&rdquo; in the subject filter.</span>
                    </div>
                )}

                <fieldset className="sm:col-span-2">
                    <legend className={labelClass}>Degree levels</legend>
                    <PillGroup
                        name="degreeLevels"
                        options={DEGREE_LEVELS}
                        register={register}
                        rules={{ validate: (v) => asArray(v).length > 0 || 'Pick at least one degree level' }}
                    />
                    {errors.degreeLevels && <span className={errorClass}>{errors.degreeLevels.message}</span>}
                </fieldset>

                <fieldset className="sm:col-span-2">
                    <legend className={labelClass}>What it covers {optionalTag}</legend>
                    <PillGroup name="benefits" options={BENEFITS} register={register} />
                </fieldset>

                <div>
                    <label htmlFor="sf-numberOfAwards" className={labelClass}>Number of awards {optionalTag}</label>
                    <input
                        id="sf-numberOfAwards"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 10"
                        {...register('numberOfAwards', { validate: (v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 1) || 'Use a whole number of 1 or more' })}
                        className={fieldClass}
                    />
                    {errors.numberOfAwards && <span className={errorClass}>{errors.numberOfAwards.message}</span>}
                    <span className={hintClass}>How many students will receive this scholarship.</span>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="sf-description" className={labelClass}>Description</label>
                    <textarea
                        id="sf-description"
                        rows="4"
                        placeholder="What the scholarship is for, who funds it, and anything students should know."
                        {...register('description', { validate: (v) => v.trim().length >= 20 || 'Write at least 20 characters' })}
                        className={fieldClass}
                    ></textarea>
                    {errors.description && <span className={errorClass}>{errors.description.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-eligibility" className={labelClass}>Eligibility {optionalTag}</label>
                    <textarea
                        id="sf-eligibility"
                        rows="4"
                        placeholder={"One requirement per line\nHSC GPA 4.5 or above"}
                        {...register('eligibility')}
                        className={fieldClass}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="sf-requiredDocuments" className={labelClass}>Required documents {optionalTag}</label>
                    <textarea
                        id="sf-requiredDocuments"
                        rows="4"
                        placeholder={"One document per line\nAcademic transcripts"}
                        {...register('requiredDocuments')}
                        className={fieldClass}
                    ></textarea>
                </div>
            </Section>

            <Section variant={variant} step="3" title="Costs" text="Tuition for the programme, and what a student pays when they apply.">
                <div className="sm:col-span-2">
                    <label htmlFor="sf-tuitionFees" className={labelClass}>Annual tuition (USD) {optionalTag}</label>
                    <input
                        id="sf-tuitionFees"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('tuitionFees', { validate: (v) => v === '' || Number(v) >= 0 || 'Cannot be negative' })}
                        className={fieldClass}
                    />
                    {errors.tuitionFees && <span className={errorClass}>{errors.tuitionFees.message}</span>}
                    <span className={hintClass}>The programme&apos;s yearly tuition. The funding type above says how much of it the scholarship covers.</span>
                </div>
                <div>
                    <label htmlFor="sf-applicationFees" className={labelClass}>University application fee (USD)</label>
                    <input
                        id="sf-applicationFees"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('applicationFees', { required: 'Enter 0 if the university charges nothing', validate: (v) => Number(v) >= 0 || 'Cannot be negative' })}
                        className={fieldClass}
                    />
                    {errors.applicationFees && <span className={errorClass}>{errors.applicationFees.message}</span>}
                    <span className={hintClass}>Charged by the university to process the application. Use 0 if it is free.</span>
                </div>
                <div>
                    <label htmlFor="sf-serviceCharge" className={labelClass}>Service fee (USD)</label>
                    <input
                        id="sf-serviceCharge"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('serviceCharge', { required: 'Enter 0 for no service fee', validate: (v) => Number(v) >= 0 || 'Cannot be negative' })}
                        className={fieldClass}
                    />
                    {errors.serviceCharge && <span className={errorClass}>{errors.serviceCharge.message}</span>}
                    <span className={hintClass}>Dream Scholar Hub&apos;s fee for checking and submitting the application.</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-violet/10 px-5 py-4 sm:col-span-2">
                    <div>
                        <p className="text-sm font-bold text-ink">Student pays when applying</p>
                        <p className="text-xs text-ink/60">${applicationFee.toLocaleString('en-US')} application fee + ${serviceFee.toLocaleString('en-US')} service fee</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-violet">${(applicationFee + serviceFee).toLocaleString('en-US')}</p>
                </div>
            </Section>

            <Section variant={variant} step="4" title="Dates" text="When applications close and when study begins.">
                <div>
                    <label htmlFor="sf-applicationDeadline" className={labelClass}>Application deadline</label>
                    <input
                        id="sf-applicationDeadline"
                        type="date"
                        min={isCreate ? today() : undefined}
                        {...register('applicationDeadline', {
                            required: 'Deadline is required',
                            validate: (v) => !isCreate || v >= today() || 'The deadline cannot be in the past',
                        })}
                        className={fieldClass}
                    />
                    {errors.applicationDeadline && <span className={errorClass}>{errors.applicationDeadline.message}</span>}
                </div>
                <div>
                    <label htmlFor="sf-studyStartDate" className={labelClass}>Study starts {optionalTag}</label>
                    <input
                        id="sf-studyStartDate"
                        type="date"
                        {...register('studyStartDate', {
                            validate: (v) => !v || !getValues('applicationDeadline') || v > getValues('applicationDeadline') || 'Must be after the deadline',
                        })}
                        className={fieldClass}
                    />
                    {errors.studyStartDate && <span className={errorClass}>{errors.studyStartDate.message}</span>}
                </div>
                {postedBy && (
                    <p className="text-xs text-ink/50 sm:col-span-2">
                        {isCreate ? `Will be posted by ${postedBy} today.` : `Posted by ${postedBy}${initialValues?.scholarshipPostDate ? ` on ${initialValues.scholarshipPostDate}` : ''}.`}
                    </p>
                )}
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel ? (
                    <button type="button" onClick={onCancel} className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-ink hover:bg-black/5">
                        Cancel
                    </button>
                ) : (
                    <button type="button" onClick={() => reset(toFormValues(null))} className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-ink hover:bg-black/5">
                        Clear form
                    </button>
                )}
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-violet px-8 py-3.5 text-sm font-bold text-white hover:bg-violet-600 disabled:opacity-60">
                    {isSubmitting ? submittingLabel : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default ScholarshipForm;

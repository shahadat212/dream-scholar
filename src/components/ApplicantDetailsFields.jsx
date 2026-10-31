import React from "react";
import ImageUploadField from "./ImageUploadField";
import FormSection from "./FormSection";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-bold text-ink";
const errorClass = "mt-1 block text-xs font-semibold text-coral";
const hintClass = "mt-1 block text-xs text-ink/40";

export const DEFAULT_DEGREES = ["Diploma", "Bachelor", "Masters", "PhD"];
export const ENGLISH_TESTS = {
    IELTS: { min: 0, max: 9, step: "0.5", hint: "Overall band, 0 to 9" },
    "TOEFL iBT": { min: 0, max: 120, step: "1", hint: "Total score, 0 to 120" },
    Duolingo: { min: 10, max: 160, step: "5", hint: "Overall score, 10 to 160" },
    None: null,
};
const STATEMENT_MIN = 150;
const STATEMENT_MAX = 3000;

const yearsAgo = (years) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split("T")[0];
};
const inRange = (min, max, label) => (value) => {
    const number = Number(value);
    return (value !== "" && value !== null && Number.isFinite(number) && number >= min && number <= max) || `${label} must be between ${min} and ${max}`;
};

export const applicantDefaults = (source, fallbackName = "") => ({
    userName: source?.userName || fallbackName || "",
    dateOfBirth: source?.dateOfBirth || "",
    gender: source?.gender || "",
    nationality: source?.nationality || "",
    phoneNumber: source?.phoneNumber || "",
    addressLine: source?.addressLine || "",
    city: source?.city || "",
    postalCode: source?.postalCode || "",
    country: source?.country || "",
    degree: source?.degree || "",
    currentInstitution: source?.currentInstitution || "",
    sscResult: source?.sscResult ?? "",
    sscYear: source?.sscYear ?? "",
    hscResult: source?.hscResult ?? "",
    hscYear: source?.hscYear ?? "",
    bachelorCgpa: source?.bachelorCgpa ?? "",
    studyGap: source?.studyGap || "No study gap",
    englishTest: source?.englishTest || "None",
    englishScore: source?.englishScore ?? "",
    statementOfPurpose: source?.statementOfPurpose || "",
});

export const CERTIFICATE_LABELS = {
    ssc: "SSC / O-Level certificate",
    hsc: "HSC / A-Level certificate",
    bachelor: "Bachelor's certificate or transcript",
    english: "English test score report",
};

export const certificateDefaults = (source) => {
    const isLink = (value) => (/^https?:\/\//i.test(value || "") ? value : "");
    return {
        ssc: isLink(source?.certificates?.ssc),
        hsc: isLink(source?.certificates?.hsc),
        bachelor: isLink(source?.certificates?.bachelor),
        english: isLink(source?.certificates?.english),
    };
};

export const requiredCertificateKeys = (degree, englishTest) => [
    "ssc",
    "hsc",
    ...(degree === "Masters" || degree === "PhD" ? ["bachelor"] : []),
    ...(englishTest && englishTest !== "None" ? ["english"] : []),
];

export const missingCertificateErrors = (certificates, degree, englishTest) => requiredCertificateKeys(degree, englishTest)
    .filter((key) => !certificates?.[key])
    .reduce((errors, key) => ({ ...errors, [key]: `Upload your ${CERTIFICATE_LABELS[key]}` }), {});

export const resolveCertificates = async (certificates, degree, englishTest, resolveImage) => {
    const keys = requiredCertificateKeys(degree, englishTest);
    const urls = await Promise.all(keys.map((key) => resolveImage(certificates?.[key])));
    return keys.reduce((result, key, index) => ({ ...result, [key]: urls[index] }), { ssc: null, hsc: null, bachelor: null, english: null });
};

export const buildApplicantDetails = (data) => {
    const needsBachelor = data.degree === "Masters" || data.degree === "PhD";
    return {
        userName: data.userName.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality.trim(),
        phoneNumber: data.phoneNumber.trim(),
        addressLine: data.addressLine.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country.trim(),
        degree: data.degree,
        currentInstitution: data.currentInstitution.trim(),
        sscResult: Number(data.sscResult),
        sscYear: Number(data.sscYear),
        hscResult: Number(data.hscResult),
        hscYear: Number(data.hscYear),
        bachelorCgpa: needsBachelor ? Number(data.bachelorCgpa) : null,
        studyGap: data.studyGap,
        englishTest: data.englishTest,
        englishScore: ENGLISH_TESTS[data.englishTest] ? Number(data.englishScore) : null,
        statementOfPurpose: data.statementOfPurpose.trim(),
    };
};

const Field = ({ id, label, optional, error, hint, className = "", children }) => {
    return (
        <div className={className}>
            <label htmlFor={id} className={labelClass}>
                {label} {optional && <span className="font-normal text-ink/40">(optional)</span>}
            </label>
            {children}
            {error ? <span className={errorClass}>{error.message}</span> : hint ? <span className={hintClass}>{hint}</span> : null}
        </div>
    );
};

const ApplicantDetailsFields = ({ register, errors, watch, getValues, photo, onPhotoChange, photoError, disabled, degreeOptions, email, certificates, onCertificateChange, certificateErrors }) => {
    const degree = watch("degree");
    const englishTest = watch("englishTest");
    const statementLength = (watch("statementOfPurpose") || "").trim().length;
    const needsBachelor = degree === "Masters" || degree === "PhD";
    const englishRange = ENGLISH_TESTS[englishTest];
    const currentYear = new Date().getFullYear();

    return (
        <>
            <FormSection step="1" title="Personal details" text="As they appear on your passport or national ID.">
                <div className="sm:col-span-2">
                    <ImageUploadField
                        label="Your photo"
                        required
                        value={photo}
                        onChange={onPhotoChange}
                        shape="rounded"
                        hint="A recent passport-style photo of your face on a plain background."
                        error={photoError}
                        disabled={disabled}
                    />
                </div>
                <Field id="app-userName" label="Full name" error={errors.userName} className="sm:col-span-2">
                    <input
                        id="app-userName"
                        type="text"
                        autoComplete="name"
                        className={fieldClass}
                        {...register("userName", { validate: (v) => (v.trim().length >= 2 && v.trim().length <= 80) || "Enter your full name (2 to 80 characters)" })}
                    />
                </Field>
                <Field id="app-dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
                    <input
                        id="app-dateOfBirth"
                        type="date"
                        min={yearsAgo(70)}
                        max={yearsAgo(14)}
                        className={fieldClass}
                        {...register("dateOfBirth", {
                            required: "Date of birth is required",
                            validate: (v) => (v >= yearsAgo(70) && v <= yearsAgo(14)) || "You must be between 14 and 70 years old",
                        })}
                    />
                </Field>
                <Field id="app-gender" label="Gender" error={errors.gender}>
                    <select id="app-gender" className={fieldClass} {...register("gender", { required: "Choose a gender" })}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </Field>
                <Field id="app-nationality" label="Nationality" error={errors.nationality} className="sm:col-span-2">
                    <input
                        id="app-nationality"
                        type="text"
                        placeholder="e.g. Bangladeshi"
                        className={fieldClass}
                        {...register("nationality", { validate: (v) => v.trim().length >= 2 || "Nationality is required" })}
                    />
                </Field>
            </FormSection>

            <FormSection step="2" title="Contact & address" text="Where the university can reach you about this application.">
                <Field id="app-email" label="Email" hint="From your account. Decisions also appear in your dashboard.">
                    <input id="app-email" type="email" value={email || ""} readOnly className={`${fieldClass} text-ink/50`} />
                </Field>
                <Field id="app-phoneNumber" label="Phone number" error={errors.phoneNumber} hint="Include the country code, e.g. +880 1712 345678">
                    <input
                        id="app-phoneNumber"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+880 1712 345678"
                        className={fieldClass}
                        {...register("phoneNumber", {
                            required: "Phone number is required",
                            pattern: { value: /^\+?[0-9][0-9\s-]{6,19}$/, message: "Enter a valid phone number with country code" },
                        })}
                    />
                </Field>
                <Field id="app-addressLine" label="Street address" error={errors.addressLine} className="sm:col-span-2">
                    <input
                        id="app-addressLine"
                        type="text"
                        autoComplete="street-address"
                        placeholder="House, road, area"
                        className={fieldClass}
                        {...register("addressLine", { validate: (v) => v.trim().length >= 5 || "Enter your street address" })}
                    />
                </Field>
                <Field id="app-city" label="City / district" error={errors.city}>
                    <input id="app-city" type="text" autoComplete="address-level2" className={fieldClass} {...register("city", { validate: (v) => v.trim().length >= 2 || "City is required" })} />
                </Field>
                <Field id="app-postalCode" label="Postal code" optional error={errors.postalCode}>
                    <input
                        id="app-postalCode"
                        type="text"
                        autoComplete="postal-code"
                        className={fieldClass}
                        {...register("postalCode", { validate: (v) => !v.trim() || (v.trim().length >= 2 && v.trim().length <= 12) || "Enter a valid postal code" })}
                    />
                </Field>
                <Field id="app-country" label="Country of residence" error={errors.country} className="sm:col-span-2">
                    <input id="app-country" type="text" autoComplete="country-name" className={fieldClass} {...register("country", { validate: (v) => v.trim().length >= 2 || "Country is required" })} />
                </Field>
            </FormSection>

            <FormSection step="3" title="Academic background" text="Your results so far. Enter each GPA exactly as on your certificate.">
                <Field id="app-degree" label="Degree you are applying for" error={errors.degree}>
                    <select id="app-degree" className={fieldClass} {...register("degree", { required: "Choose a degree" })}>
                        <option value="">Select degree</option>
                        {degreeOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                </Field>
                <Field id="app-currentInstitution" label="Current or last institution" error={errors.currentInstitution}>
                    <input
                        id="app-currentInstitution"
                        type="text"
                        placeholder="College or university name"
                        className={fieldClass}
                        {...register("currentInstitution", { validate: (v) => v.trim().length >= 2 || "Institution is required" })}
                    />
                </Field>
                <Field id="app-sscResult" label="SSC / O-Level GPA" error={errors.sscResult} hint="Out of 5.00">
                    <input id="app-sscResult" type="number" step="0.01" min="1" max="5" inputMode="decimal" className={fieldClass} {...register("sscResult", { validate: inRange(1, 5, "SSC GPA") })} />
                </Field>
                <Field id="app-sscYear" label="SSC passing year" error={errors.sscYear}>
                    <input
                        id="app-sscYear"
                        type="number"
                        min="1970"
                        max={currentYear}
                        inputMode="numeric"
                        className={fieldClass}
                        {...register("sscYear", { validate: (v) => (Number.isInteger(Number(v)) && inRange(1970, currentYear, "SSC passing year")(v) === true) || `Enter a year between 1970 and ${currentYear}` })}
                    />
                </Field>
                <div className="sm:col-span-2">
                    <ImageUploadField
                        label="SSC / O-Level certificate"
                        required
                        value={certificates?.ssc || ""}
                        onChange={(value) => onCertificateChange("ssc", value)}
                        shape="rounded"
                        hint="A clear photo or scan of your certificate or mark sheet."
                        error={certificateErrors?.ssc}
                        disabled={disabled}
                    />
                </div>
                <Field id="app-hscResult" label="HSC / A-Level GPA" error={errors.hscResult} hint="Out of 5.00">
                    <input id="app-hscResult" type="number" step="0.01" min="1" max="5" inputMode="decimal" className={fieldClass} {...register("hscResult", { validate: inRange(1, 5, "HSC GPA") })} />
                </Field>
                <Field id="app-hscYear" label="HSC passing year" error={errors.hscYear}>
                    <input
                        id="app-hscYear"
                        type="number"
                        min="1970"
                        max={currentYear}
                        inputMode="numeric"
                        className={fieldClass}
                        {...register("hscYear", {
                            validate: (v) => {
                                if (!Number.isInteger(Number(v)) || inRange(1970, currentYear, "HSC passing year")(v) !== true) return `Enter a year between 1970 and ${currentYear}`;
                                return Number(v) > Number(getValues("sscYear")) || "Must be after your SSC passing year";
                            },
                        })}
                    />
                </Field>
                <div className="sm:col-span-2">
                    <ImageUploadField
                        label="HSC / A-Level certificate"
                        required
                        value={certificates?.hsc || ""}
                        onChange={(value) => onCertificateChange("hsc", value)}
                        shape="rounded"
                        hint="A clear photo or scan of your certificate or mark sheet."
                        error={certificateErrors?.hsc}
                        disabled={disabled}
                    />
                </div>
                {needsBachelor && (
                    <>
                        <Field id="app-bachelorCgpa" label="Bachelor's CGPA" error={errors.bachelorCgpa} hint="Out of 4.00. Required for Masters and PhD.">
                            <input
                                id="app-bachelorCgpa"
                                type="number"
                                step="0.01"
                                min="0"
                                max="4"
                                inputMode="decimal"
                                className={fieldClass}
                                {...register("bachelorCgpa", { validate: (v) => !needsBachelor || inRange(0, 4, "Bachelor's CGPA")(v) })}
                            />
                        </Field>
                    <div className="sm:col-span-2">
                        <ImageUploadField
                            label="Bachelor's certificate or transcript"
                            required
                            value={certificates?.bachelor || ""}
                            onChange={(value) => onCertificateChange("bachelor", value)}
                            shape="rounded"
                            hint="Your degree certificate or latest official transcript."
                            error={certificateErrors?.bachelor}
                            disabled={disabled}
                        />
                    </div>
                    </>
                )}
                <Field id="app-studyGap" label="Study gap" error={errors.studyGap} hint="Time since your last full-time study">
                    <select id="app-studyGap" className={fieldClass} {...register("studyGap")}>
                        <option value="No study gap">No study gap</option>
                        <option value="1 Year">1 year</option>
                        <option value="2 Years">2 years</option>
                        <option value="3+ Years">3 years or more</option>
                    </select>
                </Field>
                <Field id="app-englishTest" label="English proficiency test" error={errors.englishTest}>
                    <select id="app-englishTest" className={fieldClass} {...register("englishTest")}>
                        {Object.keys(ENGLISH_TESTS).map((test) => (
                            <option key={test} value={test}>{test === "None" ? "None / not taken yet" : test}</option>
                        ))}
                    </select>
                </Field>
                {englishRange && (
                    <>
                        <Field id="app-englishScore" label={`${englishTest} score`} error={errors.englishScore} hint={englishRange.hint}>
                            <input
                                id="app-englishScore"
                                type="number"
                                step={englishRange.step}
                                min={englishRange.min}
                                max={englishRange.max}
                                inputMode="decimal"
                                className={fieldClass}
                                {...register("englishScore", { validate: (v) => !englishRange || inRange(englishRange.min, englishRange.max, `${englishTest} score`)(v) })}
                            />
                        </Field>
                    <div className="sm:col-span-2">
                        <ImageUploadField
                            label={`${englishTest} score report`}
                            required
                            value={certificates?.english || ""}
                            onChange={(value) => onCertificateChange("english", value)}
                            shape="rounded"
                            hint="Your official test report form or score certificate."
                            error={certificateErrors?.english}
                            disabled={disabled}
                        />
                    </div>
                    </>
                )}
            </FormSection>

            <FormSection step="4" title="Personal statement" text="Tell the committee why you are applying and how this scholarship will help your goals.">
                <Field id="app-statement" label="Statement of purpose" error={errors.statementOfPurpose} className="sm:col-span-2">
                    <textarea
                        id="app-statement"
                        rows="7"
                        placeholder="Your study goals, relevant achievements, and why you are a good fit for this scholarship."
                        className={fieldClass}
                        {...register("statementOfPurpose", {
                            validate: (v) => {
                                const length = v.trim().length;
                                return (length >= STATEMENT_MIN && length <= STATEMENT_MAX) || `Write between ${STATEMENT_MIN} and ${STATEMENT_MAX} characters`;
                            },
                        })}
                    ></textarea>
                    <span className={`mt-1 block text-right text-xs font-semibold ${statementLength < STATEMENT_MIN || statementLength > STATEMENT_MAX ? "text-ink/40" : "text-mint-700"}`}>
                        {statementLength} / {STATEMENT_MAX} characters{statementLength < STATEMENT_MIN ? ` · at least ${STATEMENT_MIN}` : ""}
                    </span>
                </Field>
            </FormSection>
        </>
    );
};

export default ApplicantDetailsFields;

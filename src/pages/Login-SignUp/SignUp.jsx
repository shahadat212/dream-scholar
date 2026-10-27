import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from "react-icons/fc";
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useImageUpload from '../hooks/useImageUpload';
import ImageUploadField from '../../components/ImageUploadField';
import Spinner from '../../components/Spinner';

const AUTH_ERROR_MESSAGES = {
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password is too weak.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
};

const getAuthErrorMessage = (error) => AUTH_ERROR_MESSAGES[error?.code] || "Something went wrong. Please try again.";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const SignUp = () => {
    const toast = useToast();
    const { createNewUser, updateUserProfile, setUser, handleGoogle, registerUserRecord } = useAuth();
    const [error, setError] = useState('');
    const [pending, setPending] = useState('');
    const isSubmitting = !!pending;
    const navigate = useNavigate();

    const [photo, setPhoto] = useState('');
    const [photoError, setPhotoError] = useState('');
    const { avatarPresets, resolveImage } = useImageUpload();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async ({ name, email, password }) => {
        setError('');
        if (!photo) {
            setPhotoError('Upload a photo or pick an avatar.');
            return;
        }

        let photoURL;
        setPending(photo instanceof File ? 'uploading' : 'creating');
        try {
            photoURL = await resolveImage(photo);
        } catch (err) {
            setPhotoError(err.message);
            setPending('');
            return;
        }

        setPending('creating');
        try {
            const result = await createNewUser(email, password);
            const newUser = result.user;
            setUser(newUser);

            await updateUserProfile({ displayName: name, photoURL });

            registerUserRecord({ name, email, photoURL, role: 'user' });

            reset();
            setPhoto('');

            toast.fire({
                title: "Account created",
                text: "Welcome to Dream Scholar Hub.",
                icon: "success",
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setPending('');
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setPending('google');
        try {
            const result = await handleGoogle();
            setUser(result.user);
            registerUserRecord({
                name: result.user?.displayName,
                email: result.user?.email,
                photoURL: result.user?.photoURL,
                role: 'user',
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setPending('');
        }
    };

    return (
        <div className="relative isolate flex min-h-[calc(100vh-108px)] items-center justify-center overflow-hidden px-4 py-16">
            <Helmet>
                <title>Register | Dream Scholar Hub</title>
            </Helmet>
            <div className="blob-2 absolute -right-10 top-10 -z-10 h-56 w-56 bg-coral/10"></div>
            <div className="blob-1 absolute -left-10 bottom-10 -z-10 h-64 w-64 bg-violet/10"></div>

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_60px_-20px_rgba(20,20,31,0.25)]">
                <h1 className="font-display text-3xl font-extrabold text-ink">Create your account</h1>
                <p className="mt-2 text-sm text-ink/60">Join students finding their dream scholarships.</p>

                <form
                    onSubmit={handleSubmit(onSubmit, () => {
                        if (!photo) setPhotoError('Upload a photo or pick an avatar.');
                    })}
                    className="mt-7 space-y-4"
                    autoComplete="off"
                    noValidate
                >
                    <div>
                        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-bold text-ink">Full name</label>
                        <input
                            id="signup-name"
                            type="text"
                            autoComplete="off"
                            className={fieldClass}
                            {...register('name', {
                                validate: (value) => value.trim().length >= 2 || 'Enter your full name',
                            })}
                        />
                        {errors.name && <span className="mt-1 block text-xs font-semibold text-coral">{errors.name.message}</span>}
                    </div>
                    <ImageUploadField
                        label="Profile photo"
                        required
                        value={photo}
                        onChange={(url) => {
                            setPhoto(url);
                            setPhotoError('');
                        }}
                        presets={avatarPresets}
                        hint="Upload a photo, or pick an avatar below. You can change it later."
                        error={photoError}
                        disabled={isSubmitting}
                    />
                    <div>
                        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-bold text-ink">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            autoComplete="off"
                            className={fieldClass}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                            })}
                        />
                        {errors.email && <span className="mt-1 block text-xs font-semibold text-coral">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-bold text-ink">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            autoComplete="new-password"
                            className={fieldClass}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Use at least 6 characters' },
                                validate: (value) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/.test(value)
                                    || 'Add an uppercase letter, a lowercase letter and a special character',
                            })}
                        />
                        {errors.password
                            ? <span className="mt-1 block text-xs font-semibold text-coral">{errors.password.message}</span>
                            : <span className="mt-1 block text-xs text-ink/40">At least 6 characters, with upper and lower case letters and a symbol.</span>}
                    </div>

                    {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

                    <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {pending === 'uploading' || pending === 'creating' ? <Spinner /> : null}
                        {pending === 'uploading' ? 'Uploading photo…' : pending === 'creating' ? 'Creating account…' : 'Register'}
                    </button>

                    <p className="text-center text-sm text-ink/60">
                        Already have an account? <Link to='/login' className="font-bold text-violet">Login</Link>
                    </p>
                </form>

                <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink/30">
                    <div className="h-px flex-1 bg-black/10"></div>
                    Or
                    <div className="h-px flex-1 bg-black/10"></div>
                </div>

                <button onClick={handleGoogleSignUp} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-black/10 py-3 text-sm font-bold text-ink transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60">
                    {pending === 'google' ? <Spinner /> : <FcGoogle className='text-lg' />}
                    {pending === 'google' ? 'Waiting for Google…' : 'Sign up with Google'}
                </button>
            </div>
        </div>
    );
};

export default SignUp;

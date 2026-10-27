import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from "react-icons/fc";
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

const AUTH_ERROR_MESSAGES = {
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password is too weak.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
};

const getAuthErrorMessage = (error) => AUTH_ERROR_MESSAGES[error?.code] || "Something went wrong. Please try again.";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const SignUp = () => {
    const { createNewUser, updateUserProfile, setUser, handleGoogle, registerUserRecord } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async ({ name, photo, email, password }) => {
        setError('');

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
        if (!passwordRegex.test(password)) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, and one special character.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createNewUser(email, password);
            const newUser = result.user;
            setUser(newUser);

            const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
            await updateUserProfile({ displayName: name, photoURL: photo || fallbackPhoto });

            registerUserRecord({ name, email, photoURL: photo || fallbackPhoto, role: 'user' });

            reset();

            await Swal.fire({
                title: "Account created 🎉",
                text: "Welcome to Dream Scholar Hub.",
                icon: "success",
                confirmButtonColor: "#5B4CFB",
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setIsSubmitting(true);
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
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative isolate flex min-h-[calc(100vh-108px)] items-center justify-center overflow-hidden px-4 py-16">
            <Helmet>
                <title>Register | Dream Scholar Hub</title>
            </Helmet>
            <div className="blob-2 absolute -right-10 top-10 -z-10 h-56 w-56 bg-coral/10"></div>
            <div className="blob-1 absolute -left-10 bottom-10 -z-10 h-64 w-64 bg-violet/10"></div>

            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_20px_60px_-20px_rgba(20,20,31,0.25)]">
                <h1 className="font-display text-3xl font-extrabold text-ink">Create your account</h1>
                <p className="mt-2 text-sm text-ink/60">Join students finding their dream scholarships.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" autoComplete="off" noValidate>
                    <div>
                        <input type="text" placeholder="Your name" autoComplete="off" className={fieldClass} {...register('name', { required: 'Name is required' })} />
                        {errors.name && <span className="mt-1 block text-xs font-semibold text-coral">{errors.name.message}</span>}
                    </div>
                    <div>
                        <input type="text" placeholder="Photo URL (optional)" autoComplete="off" className={fieldClass} {...register('photo')} />
                    </div>
                    <div>
                        <input type="email" placeholder="Email" autoComplete="off" className={fieldClass} {...register('email', { required: 'Email is required' })} />
                        {errors.email && <span className="mt-1 block text-xs font-semibold text-coral">{errors.email.message}</span>}
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            className={fieldClass}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password should be at least 6 characters' },
                            })}
                        />
                        {errors.password && <span className="mt-1 block text-xs font-semibold text-coral">{errors.password.message}</span>}
                    </div>

                    {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

                    <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:opacity-60">
                        {isSubmitting ? 'Creating account…' : 'Register'}
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

                <button onClick={handleGoogleSignUp} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-black/10 py-3 text-sm font-bold text-ink transition hover:border-black/30">
                    <FcGoogle className='text-lg' /> Sign up with Google
                </button>
            </div>
        </div>
    );
};

export default SignUp;

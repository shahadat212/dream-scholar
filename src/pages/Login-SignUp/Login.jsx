import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from "react-icons/fc";
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';
import Spinner from '../../components/Spinner';

const AUTH_ERROR_MESSAGES = {
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
};

const getAuthErrorMessage = (error) => AUTH_ERROR_MESSAGES[error?.code] || "Something went wrong. Please try again.";

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const Login = () => {
    const { userLogin, setUser, handleGoogle, registerUserRecord, isNewAccount, discardNewAccount } = useAuth();
    const [error, setError] = useState('');
    const [pending, setPending] = useState('');
    const isSubmitting = !!pending;
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from || '/';

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async ({ email, password }) => {
        setError('');
        setPending('email');
        try {
            const result = await userLogin(email, password);
            setUser(result.user);
            reset();
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setPending('');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setPending('google');
        try {
            const result = await handleGoogle();
            if (isNewAccount(result)) {
                const email = result.user?.email;
                await discardNewAccount();
                setPending('');
                const choice = await Swal.fire({
                    icon: 'warning',
                    title: 'You are a new user',
                    text: `There is no Dream Scholar Hub account for ${email || 'this Google account'} yet. Please register first, then log in.`,
                    showCancelButton: true,
                    confirmButtonText: 'Register now',
                    cancelButtonText: 'Not now',
                    confirmButtonColor: '#5B4CFB',
                    cancelButtonColor: '#14141F',
                });
                if (choice.isConfirmed) navigate('/register');
                return;
            }
            setUser(result.user);
            registerUserRecord({
                name: result.user?.displayName,
                email: result.user?.email,
                photoURL: result.user?.photoURL,
                role: 'user',
            });
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setPending('');
        }
    };


    return (
        <div className="relative isolate flex min-h-[calc(100vh-108px)] items-center justify-center overflow-hidden px-4 py-16">
            <Helmet>
                <title>Login | Dream Scholar Hub</title>
            </Helmet>
            <div className="blob-1 absolute -left-10 top-10 -z-10 h-56 w-56 bg-violet/10"></div>
            <div className="blob-2 absolute -right-10 bottom-10 -z-10 h-64 w-64 bg-sun/20"></div>

            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_20px_60px_-20px_rgba(20,20,31,0.25)]">
                <h1 className="font-display text-3xl font-extrabold text-ink">Welcome back</h1>
                <p className="mt-2 text-sm text-ink/60">Sign in to continue your scholarship search.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" autoComplete="off" noValidate>
                    <div>
                        <input type="email" placeholder="Email" autoComplete="off" className={fieldClass} {...register('email', { required: 'Email is required' })} />
                        {errors.email && <span className="mt-1 block text-xs font-semibold text-coral">{errors.email.message}</span>}
                    </div>
                    <div>
                        <input type="password" placeholder="Password" autoComplete="new-password" className={fieldClass} {...register('password', { required: 'Password is required' })} />
                        {errors.password && <span className="mt-1 block text-xs font-semibold text-coral">{errors.password.message}</span>}
                    </div>

                    {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

                    <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {pending === 'email' && <Spinner />}
                        {pending === 'email' ? 'Signing in…' : 'Login'}
                    </button>

                    <p className="text-center text-sm text-ink/60">
                        Don&apos;t have an account? <Link to='/register' className="font-bold text-violet">Register</Link>
                    </p>
                </form>

                <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink/30">
                    <div className="h-px flex-1 bg-black/10"></div>
                    Or
                    <div className="h-px flex-1 bg-black/10"></div>
                </div>

                <button onClick={handleGoogleLogin} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-black/10 py-3 text-sm font-bold text-ink transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60">
                    {pending === 'google' ? <Spinner /> : <FcGoogle className='text-lg' />}
                    {pending === 'google' ? 'Waiting for Google…' : 'Continue with Google'}
                </button>
            </div>
        </div>
    );
};

export default Login;

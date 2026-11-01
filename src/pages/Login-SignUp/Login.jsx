import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from "react-icons/fc";
import { FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';
import Spinner from '../../components/Spinner';
import graduationImg from '../../assets/slide3.jpg';

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

const fieldClass = "w-full rounded-2xl border border-black/10 bg-cream py-3 pl-11 pr-4 text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none";

const HIGHLIGHTS = ['Pick up your applications where you left off', 'See every status change on your timeline', 'Keep your saved and compared scholarships'];

const Login = () => {
    const { userLogin, setUser, handleGoogle, registerUserRecord, isNewAccount, discardNewAccount } = useAuth();
    const [error, setError] = useState('');
    const [pending, setPending] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

            <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(20,20,31,0.25)] lg:grid-cols-2">
                <div className="hidden flex-col justify-between gap-8 bg-violet p-10 text-white lg:flex">
                    <div>
                        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">Dream Scholar Hub</span>
                        <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-white">Good to see you again</h2>
                        <ul className="mt-6 space-y-3">
                            {HIGHLIGHTS.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20"><FaCheck className="text-[10px]" /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <img src={graduationImg} alt="Graduates throwing their caps" className="h-48 w-full rounded-2xl object-cover" />
                </div>

                <div className="p-8 sm:p-10">
                    <h1 className="font-display text-3xl font-extrabold text-ink">Welcome back</h1>
                    <p className="mt-2 text-sm text-ink/60">Sign in to continue your scholarship search.</p>

                    <button onClick={handleGoogleLogin} disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border-2 border-black/10 py-3 text-sm font-bold text-ink transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60">
                        {pending === 'google' ? <Spinner /> : <FcGoogle className='text-lg' />}
                        {pending === 'google' ? 'Waiting for Google…' : 'Continue with Google'}
                    </button>

                    <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink/30">
                        <div className="h-px flex-1 bg-black/10"></div>
                        Or with email
                        <div className="h-px flex-1 bg-black/10"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off" noValidate>
                        <div>
                            <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-ink">Email</label>
                            <div className="relative">
                                <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink/30" />
                                <input id="login-email" type="email" placeholder="you@example.com" autoComplete="off" className={fieldClass} {...register('email', { required: 'Email is required' })} />
                            </div>
                            {errors.email && <span className="mt-1 block text-xs font-semibold text-coral">{errors.email.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="login-password" className="mb-1.5 block text-sm font-bold text-ink">Password</label>
                            <div className="relative">
                                <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink/30" />
                                <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Your password" autoComplete="new-password" className={`${fieldClass} pr-12`} {...register('password', { required: 'Password is required' })} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-black/5 hover:text-ink"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
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
                </div>
            </div>
        </div>
    );
};

export default Login;

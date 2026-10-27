import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiUploadCloud, FiX, FiCheck } from 'react-icons/fi';
import useImageUpload from '../pages/hooks/useImageUpload';

const ImageUploadField = ({ label, value, onChange, presets = [], fallback, shape = 'circle', hint, error, required = false, disabled = false }) => {
    const inputId = useId();
    const inputRef = useRef(null);
    const { validateImage, maxSizeMb } = useImageUpload();
    const [fileError, setFileError] = useState('');
    const isFile = value instanceof File;

    const filePreview = useMemo(() => (isFile ? URL.createObjectURL(value) : ''), [isFile, value]);

    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            validateImage(file);
            setFileError('');
            onChange(file);
        } catch (err) {
            setFileError(err.message);
        }
    };

    const previewShape = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
    const preview = filePreview || value || fallback;
    const message = fileError || error;

    return (
        <div>
            {label && (
                <label htmlFor={inputId} className="mb-1.5 block text-sm font-bold text-ink">
                    {label} {!required && <span className="font-normal text-ink/40">(optional)</span>}
                </label>
            )}

            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-black/15 bg-cream p-3">
                <div className={`relative h-16 w-16 shrink-0 overflow-hidden border border-black/5 bg-white ${previewShape}`}>
                    {preview ? (
                        <img src={preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-xl text-ink/20"><FiUploadCloud /></span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled}
                            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-black disabled:opacity-60"
                        >
                            <FiUploadCloud /> {value ? 'Change image' : 'Choose image'}
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFileError('');
                                    onChange('');
                                }}
                                disabled={disabled}
                                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-ink/70 transition hover:bg-black/5"
                            >
                                <FiX /> Remove
                            </button>
                        )}
                    </div>
                    <p className="mt-1.5 text-xs text-ink/40">
                        {isFile ? `${value.name} · uploads when you submit` : hint || `JPG, PNG or WEBP, up to ${maxSizeMb} MB.`}
                    </p>
                </div>

                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFile}
                    className="sr-only"
                />
            </div>

            {presets.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-ink/50">Or pick an avatar</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {presets.map((preset, index) => {
                            const isSelected = value === preset;
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => onChange(preset)}
                                    disabled={disabled}
                                    aria-pressed={isSelected}
                                    aria-label={`Use avatar ${index + 1}`}
                                    className={`relative h-10 w-10 overflow-hidden rounded-full border-2 bg-white transition ${
                                        isSelected ? 'border-violet ring-2 ring-violet/30' : 'border-transparent hover:border-black/10'
                                    }`}
                                >
                                    <img src={preset} alt="" className="h-full w-full object-cover" />
                                    {isSelected && (
                                        <span className="absolute inset-0 flex items-center justify-center bg-violet/40 text-white"><FiCheck /></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {message && <span className="mt-1 block text-xs font-semibold text-coral">{message}</span>}
        </div>
    );
};

export default ImageUploadField;

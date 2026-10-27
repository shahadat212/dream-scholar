import { useState } from 'react';
import axios from 'axios';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_PRESETS = [
    ['Aneka', 'eeecff'], ['Leo', 'ffede9'], ['Maya', 'fff6e0'], ['Zayn', 'eafbf1'],
    ['Nora', 'ffede9'], ['Arif', 'eeecff'], ['Sara', 'eafbf1'], ['Kian', 'fff6e0'],
].map(([seed, background]) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${background}`);

const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const validateImage = (file) => {
        if (!file) throw new Error('Choose an image first.');
        if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WEBP or GIF image.');
        if (file.size > MAX_SIZE_MB * 1024 * 1024) throw new Error(`The image must be ${MAX_SIZE_MB} MB or smaller.`);
    };

    const uploadImage = async (file) => {
        validateImage(file);

        const key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
        if (!key) throw new Error('Image uploads are not configured.');

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const res = await axios.post(`https://api.imgbb.com/1/upload?key=${key}`, formData);
            const url = res.data?.data?.display_url || res.data?.data?.url;
            if (!res.data?.success || !url) throw new Error('Upload failed. Please try again.');
            return url;
        } catch (error) {
            throw new Error(error?.response?.data?.error?.message || error?.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const resolveImage = async (value) => {
        if (value instanceof File) return uploadImage(value);
        return value || '';
    };

    return { validateImage, uploadImage, resolveImage, isUploading, maxSizeMb: MAX_SIZE_MB, avatarPresets: AVATAR_PRESETS };
};

export default useImageUpload;

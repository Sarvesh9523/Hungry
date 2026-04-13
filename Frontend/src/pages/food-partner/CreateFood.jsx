import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import backgroundPoster from '../../assets/background_poster.png';

const CreateFood = () => {
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ videoFile, setVideoFile ] = useState(null);
    const [ videoURL, setVideoURL ] = useState('');
    const [ fileError, setFileError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ videoFile ]);

    const onFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[0];
        if (!file) { return; }
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDragOver = (e) => { e.preventDefault(); };
    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) return alert("You must be logged in to create food.");

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append("video", videoFile);

        try {
            const response = await api.post('/api/food', formData);

            const foodPartnerId = response.data.foodPartner._id;
            navigate(`/food-partner/${foodPartnerId}`);
        } catch (error) {
            console.error("Error creating food:", error);
            alert("Failed to create food. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || loading, [ name, videoFile, loading ]);

    return (
        <div 
          className="min-h-screen w-full relative bg-fixed bg-cover bg-center flex items-center justify-center p-4 py-12"
          style={{ backgroundImage: `url(${backgroundPoster})` }}
        >
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-teal-900/30 to-black z-0 mix-blend-color" />

            <div className="relative z-10 w-full max-w-2xl bg-glass border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10">
                <header className="mb-8 text-center">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-4 inline-block">
                        BUSINESS PORTAL
                    </span>
                    <h1 className="text-3xl font-extrabold text-white drop-shadow-md mb-2">Publish New Meal</h1>
                    <p className="text-white/60 text-sm">Upload a short reel and showcase your dish to everyone.</p>
                </header>

                <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold tracking-wider text-emerald-300">MEAL VIDEO / REEL</label>
                        <input id="foodVideo" ref={fileInputRef} className="hidden" type="file" accept="video/*" onChange={onFileChange} />

                        <div
                            className={`w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all
                            ${videoFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 hover:border-emerald-400 hover:bg-white/5 bg-black/30'}
                            `}
                            onClick={openFileDialog}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            {!videoURL ? (
                                <>
                                    <span className="text-4xl mb-4 drop-shadow-md pb-2 text-emerald-400">📹</span>
                                    <p className="text-white font-medium mb-1">Click to upload reel</p>
                                    <p className="text-white/50 text-xs">MP4, WebM • Max 50MB</p>
                                </>
                            ) : (
                                <video className="w-full h-full object-contain rounded-lg shadow-xl" src={videoURL} controls playsInline />
                            )}
                        </div>
                        {fileError && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded text-center">{fileError}</p>}
                        
                        {videoFile && !videoURL && ( /* Fallback if preview fails but file exists */
                            <div className="bg-white/10 p-3 rounded-lg text-sm text-emerald-300 flex justify-between items-center">
                                <span>{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                <button type="button" className="text-red-400 hover:underline" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}>Remove</button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold tracking-wider text-emerald-300">MEAL TITLE</label>
                        <input
                            type="text"
                            placeholder="e.g. Spicy Double Cheeseburger"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold tracking-wider text-emerald-300">DESCRIPTION & INGREDIENTS</label>
                        <textarea
                            rows={4}
                            placeholder="Write an appetizing description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isDisabled}
                        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all active:scale-95 border border-white/10 text-lg"
                    >
                        {loading ? 'Publishing Reel...' : 'Publish Meal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFood;
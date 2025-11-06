import { useState, useRef } from "react";

export default function ImageDisplay({source, size = "medium", alt = "img"}) {
    const panelRef = useRef(null);
    const [preview, setPreview] = useState(false);

    const sizeClasses = {
      small: "w-16 h-16",
      medium: "w-26 h-26",
      large: "w-36 h-36",
    };
    const bckgSize = sizeClasses[size] || sizeClasses.medium;

    return (
        <>
            <div onClick={() => setPreview(true)} className={`${bckgSize} border border-gray-200 rounded-md overflow-hidden cursor-pointer`}>
                <img src={source} alt={alt} className="w-full h-full rounded-md object-cover transition-opacity duration-300 hover:opacity-30" />
            </div>

            {preview && (
                <div onClick={() => setPreview(false)} className="fixed inset-0 z-999 flex items-center justify-center bg-black/60">
                    <div ref={panelRef} className="w-full max-w-3xl min-h-128 bg-base-100 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div ref={panelRef} className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden relative" onClick={(e) => e.stopPropagation()} >
                            <img src={source} alt={alt} className="w-full h-auto object-contain" />
                            <svg onClick={() => setPreview(false)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-7 cursor-pointer absolute top-5 right-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
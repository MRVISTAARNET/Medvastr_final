"use client";

import React from "react";

interface ProductImageZoomProps {
    src: string;
    alt?: string;
    className?: string;
    onError?: () => void;
}

export default function ProductImageZoom({ src, alt, className, onError }: ProductImageZoomProps) {
    return (
        <div
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'zoom-in',
                width: '100%',
                height: '100%',
            }}
        >
            <img
                src={src}
                alt={alt || "Product Image"}
                onError={onError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
            />
        </div>
    );
}

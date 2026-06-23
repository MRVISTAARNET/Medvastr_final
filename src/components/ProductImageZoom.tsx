"use client";

import React, { useState, useRef } from "react";

interface ProductImageZoomProps {
    src: string;
    alt?: string;
    className?: string;
    onError?: () => void;
}

export default function ProductImageZoom({ src, alt, className, onError }: ProductImageZoomProps) {
    const [zoom, setZoom] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();

        // Calculate cursor position relative to the element
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setPosition({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className={className}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'zoom-in',
                width: '100%',
                height: '100%',
                isolation: 'isolate'
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
                    transition: 'opacity 0.3s ease',
                    opacity: zoom ? 0 : 1
                }}
            />

            {zoom && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `${position.x}% ${position.y}%`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "220%",
                    }}
                />
            )}
        </div>
    );
}

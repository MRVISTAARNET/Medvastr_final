"use client";

import React, { useState, useRef } from "react";

interface ProductImageZoomProps {
    src: string;
    alt?: string;
    className?: string;
}

export default function ProductImageZoom({ src, alt, className }: ProductImageZoomProps) {
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
            className={`relative overflow-hidden cursor-zoom-in ${className || ""}`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            style={{ isolation: 'isolate' }}
        >
            <img
                src={src}
                alt={alt || "Product Image"}
                className={`w-full h-full object-cover transition-opacity duration-300 ${zoom ? "opacity-0" : "opacity-100"}`}
            />

            {zoom && (
                <div
                    className="absolute inset-0 z-10 w-full h-full pointer-events-none transition-transform duration-100"
                    style={{
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

"use client";

import React from "react";

/**
 * Crisp SVG brand marks and fallback avatar with `vectorEffect="non-scaling-stroke"`
 * so line widths remain uniform across Retina/4K zoom levels.
 */

export function ShieldCodeBrandLogo({
  className = "w-6 h-6",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="sc-logo-grad"
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M16 3L27 7.2V15.5C27 22.1 22.2 27.3 16 29C9.8 27.3 5 22.1 5 15.5V7.2L16 3Z"
        fill="url(#sc-logo-grad)"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M11.5 16.2L14.5 19.2L20.8 12.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function VectorUserAvatar({
  className = "w-full h-full",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="sc-avatar-bg"
          x1="0"
          y1="0"
          x2="128"
          y2="128"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#0891b2" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="20" fill="url(#sc-avatar-bg)" />
      <circle
        cx="64"
        cy="48"
        r="19"
        stroke="#0d9488"
        strokeWidth="3"
        fill="#14b8a6"
        fillOpacity="0.12"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M28 106C31.5 84.5 45.5 74 64 74C82.5 74 96.5 84.5 100 106"
        stroke="#0891b2"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="64"
        cy="64"
        r="54"
        stroke="#14b8a6"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

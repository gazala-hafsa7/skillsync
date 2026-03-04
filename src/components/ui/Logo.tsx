import React from 'react';

interface LogoProps {
  size?: number;
}

export const SkillSyncLogo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ssGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7088" />
          <stop offset="100%" stopColor="#e03c52" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="url(#ssGrad)"
        strokeWidth="6"
      />
      <path
        d="M 58,22 C 58,22 35,28 35,45 C 35,58 58,55 58,68 C 58,82 35,85 35,85"
        fill="none"
        stroke="url(#ssGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SkillSyncLogo;
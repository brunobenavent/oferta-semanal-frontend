const LEAF_COLOR = '#76bc21';

export default function HeartIcon({ size = 20, filled = false, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 70 70"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M35.61,18.85c-.91-1.47-2.04-2.74-3.43-3.74-10.58-7.6-25.13,1.81-22.47,14.61,2.79,13.65,24.22,12.98,22.92,27.9,8.57-3.08,16.08-9.39,21.35-16.45,19.53-26.11-9.5-36.74-18.37-22.32Z"
        fill={filled ? LEAF_COLOR : 'none'}
        stroke={LEAF_COLOR}
        strokeWidth={3}
      />
    </svg>
  );
}

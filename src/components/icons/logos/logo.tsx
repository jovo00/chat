export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="40.028"
      height="40.028"
      viewBox="0 0 40.028 40.028"
    >
      <defs>
        <linearGradient
          id="linear-gradient"
          x1="0.125"
          y1="0.753"
          x2="1.655"
          y2="0.169"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#b70077" />
          <stop offset="1" stopColor="#ffbae8" />
        </linearGradient>
      </defs>
      <path
        id="Pfad_6"
        data-name="Pfad 6"
        d="M17.883,29.018a4,4,0,0,0-2.876-2.876L2.729,22.976a1,1,0,0,1,0-1.925l12.278-3.168a4,4,0,0,0,2.876-2.874L21.049,2.731a1,1,0,0,1,1.927,0l3.164,12.278a4,4,0,0,0,2.876,2.876l12.278,3.164a1,1,0,0,1,0,1.929L29.016,26.142a4,4,0,0,0-2.876,2.876L22.974,41.3a1,1,0,0,1-1.927,0Z"
        transform="translate(-2.001 -2)"
        fill="url(#linear-gradient)"
      />
    </svg>
  );
}

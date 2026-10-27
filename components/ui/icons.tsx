import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Stroke icons drawn in currentColor, so they inherit the surrounding text color.
function Icon({ className = "size-4", children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13 8H3m4-4L3 8l4 4" />
  </Icon>
);

export const TrendUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m2 11.5 4.5-4.5 3 3L14 5.5M10 5.5h4v4" />
  </Icon>
);

export const TrendDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m2 4.5 4.5 4.5 3-3 4.5 4.5M10 10.5h4v-4" />
  </Icon>
);

import * as React from "react";

export default function ChevronIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            aria-hidden
            {...props}
        >
            <path d="M3.5 9L7.5 5L3.5 1"/>
        </svg>
    )
}
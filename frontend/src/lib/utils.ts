import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-lg",
        "text-display",
        "text-heading",
        "text-subheading",
        "text-label",
        "text-body",
        "text-body-sm",
        "text-caption",
        "text-code",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

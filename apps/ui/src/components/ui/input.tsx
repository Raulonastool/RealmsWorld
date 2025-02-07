import * as React from "react";

import { cn } from "@realms-world/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const inputBaseStyles = cn(
  "flex h-10 w-full rounded-md  bg-black/40 px-3 py-2 text-sm placeholder:text-white focus:outline-none focus:ring-2 focus:ring-slate-400",
  "focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900",
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input className={cn(inputBaseStyles, className)} ref={ref} {...props} />
    );
  },
);
Input.displayName = "Input";

export { Input, inputBaseStyles };

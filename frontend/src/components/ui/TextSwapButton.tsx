interface TextSwapButtonProps {
  topText: string;
  bottomText: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function TextSwapButton({ topText, bottomText, onClick, disabled, className }: TextSwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer group relative bg-white hover:bg-zinc-200 text-black font-semibold text-sm px-5 py-3 rounded-full transition-all duration-200 ease-in-out shadow hover:shadow-lg w-36 h-12 disabled:opacity-40 disabled:pointer-events-none ${className ?? ""}`}
    >
      <div className="relative flex items-center justify-center gap-2">
        <span className="relative inline-block overflow-hidden">
          <span className="block transition-transform duration-300 group-hover:-translate-y-full">
            {topText}
          </span>
          <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
            {bottomText}
          </span>
        </span>
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" viewBox="0 0 24 24">
          <circle fill="currentColor" r={11} cy={12} cx={12} />
          <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="white" d="M7.5 16.5L16.5 7.5M16.5 7.5H10.5M16.5 7.5V13.5" />
        </svg>
      </div>
    </button>
  );
}

export { TextSwapButton };

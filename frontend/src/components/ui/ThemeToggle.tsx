import { useTheme } from "../../stores/themeStore";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <label className="relative inline-block w-[4em] h-[2.2em] rounded-[30px] cursor-pointer select-none">
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggle}
        className="opacity-0 w-0 h-0 absolute"
      />

      {/* Slider background */}
      <span
        className={`absolute inset-0 rounded-[30px] overflow-hidden transition-colors duration-400 ${
          isDark ? "bg-sky-500" : "bg-[#2a2a2a]"
        }`}
      >
        {/* Knob — moon / sun */}
        <span
          className="absolute left-[0.5em] bottom-[0.5em] h-[1.2em] w-[1.2em] rounded-full transition-all duration-400 z-10"
          style={{
            transitionTimingFunction: "cubic-bezier(0.81, -0.04, 0.38, 1.5)",
            transform: isDark ? "translateX(1.8em)" : "translateX(0)",
            boxShadow: isDark
              ? "inset 15px -4px 0px 15px #ffcf48"
              : "inset 8px -4px 0px 0px #fff",
          }}
        />

        {/* Stars — visible in dark mode, fade out in light */}
        <span
          className={`absolute w-[5px] h-[5px] bg-white rounded-full transition-opacity duration-400 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          style={{ left: "2.5em", top: "0.5em" }}
        />
        <span
          className={`absolute w-[5px] h-[5px] bg-white rounded-full transition-opacity duration-400 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          style={{ left: "2.2em", top: "1.2em" }}
        />
        <span
          className={`absolute w-[5px] h-[5px] bg-white rounded-full transition-opacity duration-400 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          style={{ left: "3em", top: "0.9em" }}
        />

        {/* Cloud — fades in on light mode */}
        <svg
          viewBox="0 0 16 16"
          className={`absolute transition-opacity duration-400 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: "3.5em", bottom: "-1.4em", left: "-1.1em" }}
        >
          <path
            transform="matrix(.77976 0 0 .78395-299.99-418.63)"
            fill="#fff"
            d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
          />
        </svg>
      </span>
    </label>
  );
}

export { ThemeToggle };

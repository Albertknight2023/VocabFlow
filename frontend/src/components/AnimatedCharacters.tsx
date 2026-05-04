import React, { useEffect, useRef, useState } from "react";
import "../styles/animated-login.css";

type Props = {
  focusedField: "none" | "email" | "password";
  isPasswordVisible: boolean;
  isLoginError: boolean;
  isTyping: boolean;
};

const Character: React.FC<{
  color: string;
  id: string;
  follow: { x: number; y: number };
  tilt: number;
  peek: boolean;
  blink: boolean;
  coverEyes: boolean;
  className?: string;
}> = ({ color, id, follow, tilt, peek, blink, coverEyes, className }) => {
  // use CSS variables for movement/tilt/background to keep most styles in CSS
  const style: any = {
    ["--pupil-x"]: `${follow.x}px`,
    ["--pupil-y"]: `${follow.y}px`,
    ["--tilt"]: `${tilt}deg`,
    ["--char-bg"]: color,
  };

  const cls = [
    "char",
    className || "",
    blink ? "blink" : "",
    coverEyes ? "cover" : "",
  ].join(" ");

  return (
    <div className={cls} id={id} style={style}>
      <div className="eye left">
        <div className="pupil"></div>
      </div>
      <div className="eye right">
        <div className="pupil"></div>
      </div>
      <div className={"mouth " + (peek ? "peek" : "")}></div>
    </div>
  );
};

const AnimatedCharacters: React.FC<Props> = ({
  focusedField,
  isPasswordVisible,
  isLoginError,
  isTyping,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [follow, setFollow] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [blinks, setBlinks] = useState([false, false, false, false]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // clamp to avoid pupils or skew overlapping adjacent characters
      const clamp = (v: number, m = 6) => Math.max(-m, Math.min(m, v));
      const fx = clamp(x * 4.2, 3.2);
      const fy = clamp(y * 3.2, 2.8);
      setFollow({ x: fx, y: fy });
      setTilt(x * 4.5);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // blinking timers
  useEffect(() => {
    // faster, a bit more natural blinking with per-character offset
    const timers: number[] = [];
    for (let i = 0; i < 4; i++) {
      const loop = () => {
        // base shorter -> more frequent blinks; add small per-char offset
        const delay = 800 + Math.random() * 1800 + i * 220;
        const t = window.setTimeout(() => {
          setBlinks((prev) => {
            const copy = [...prev];
            copy[i] = true;
            return copy;
          });
          // blink close duration (short)
          const closeT = window.setTimeout(
            () => {
              setBlinks((prev) => {
                const copy = [...prev];
                copy[i] = false;
                return copy;
              });
              loop();
            },
            80 + Math.random() * 120,
          );
          timers.push(closeT as unknown as number);
        }, delay);
        timers.push(t);
      };
      loop();
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const focusTilt =
    focusedField === "email" ? -4 : focusedField === "password" ? 4 : 0;
  const lookLeft = focusedField === "password";

  return (
    <div className="animated-characters" ref={containerRef}>
      <Character
        id="c-purple"
        color="#7C4DFF"
        follow={follow}
        tilt={tilt + focusTilt}
        peek={isPasswordVisible}
        blink={blinks[0]}
        coverEyes={false}
        className={
          "char-purple " +
          (isLoginError ? "error" : "sunglasses") +
          (lookLeft ? " look-left" : "")
        }
      />
      <Character
        id="c-black"
        color="#111111"
        follow={{ x: follow.x * 0.7, y: follow.y * 0.7 }}
        tilt={tilt * 0.6 + focusTilt}
        peek={false}
        blink={blinks[1]}
        coverEyes={false}
        className={
          "char-black with-blush " +
          (isTyping ? "typing" : "") +
          (lookLeft ? " look-left" : "")
        }
      />
      <Character
        id="c-orange"
        color="#FF7A2D"
        follow={{ x: follow.x * 0.8, y: follow.y * 0.7 }}
        tilt={tilt * 1.05}
        peek={false}
        blink={blinks[2]}
        coverEyes={false}
        className={"char-orange" + (lookLeft ? " look-left" : "")}
      />
      <Character
        id="c-yellow"
        color="#F0C419"
        follow={{ x: follow.x * 0.55, y: follow.y * 0.75 }}
        tilt={tilt * 0.5}
        peek={false}
        blink={blinks[3]}
        coverEyes={false}
        className={"char-yellow" + (lookLeft ? " look-left" : "")}
      />
    </div>
  );
};

export default AnimatedCharacters;

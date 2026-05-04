import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import AnimatedCharacters from "../components/AnimatedCharacters";

function LoginView() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] = useState<
    "none" | "email" | "password"
  >("none");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIsLoginError(false);

    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败");
      setIsLoginError(true);
      setTimeout(() => setIsLoginError(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setIsTyping(true);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      // @ts-ignore
      typingTimer.current = window.setTimeout(() => setIsTyping(false), 700);
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex items-center justify-center">
          <div className="bg-transparent p-6 rounded-2xl">
            <AnimatedCharacters
              focusedField={focusedField}
              isPasswordVisible={isPasswordVisible}
              isLoginError={isLoginError}
              isTyping={isTyping}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold">欢迎回来</h1>
              <p className="text-gray-500">使用你的账号登录系统</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={onInputChange(setUsername)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("none")}
                  placeholder="用户名或邮箱"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">密码</label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={onInputChange(setPassword)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("none")}
                    placeholder="密码"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? "隐藏密码" : "显示密码"}
                    title={isPasswordVisible ? "隐藏密码" : "显示密码"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "登录中..." : "登录"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                没有账号？{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  注册
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginView;

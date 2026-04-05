import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice.js";
import { BookOpen, Loader2, Mail, Lock, User, GraduationCap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isLoggingIn, authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    dispatch(login(formData));
  };

  useEffect(() => {
    if (authUser) {
      const role = authUser.role.toLowerCase();
      navigate(`/${role}`);
    }
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:block space-y-12">
          <div className="badge-primary animate-in fade-in slide-in-from-left-4 duration-700">
            <Sparkles size={14} />
            Next-Gen Academic Platform
          </div>

          <div className="space-y-6">
            <h1 className="heading-lg !text-6xl !leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              Manage Your <br />
              <span className="text-blue-600">Research Destiny</span>
            </h1>
            <p className="text-body-lg animate-in fade-in slide-in-from-left-10 duration-700 delay-200">
              The ultimate destination for Final Year Projects. Streamline supervision, collaboration, and submission in one premium workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-12 duration-700 delay-300">
            <div className="space-y-2">
              <div className="heading-lg">500+</div>
              <div className="text-tiny">Active Projects</div>
            </div>
            <div className="space-y-2">
              <div className="heading-lg">98%</div>
              <div className="text-tiny">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-700">
          <div className="premium-card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

            <div className="mb-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 shadow-xl shadow-blue-600/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="heading-lg">Welcome Back</h2>
              <p className="text-body font-bold mt-2">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-tiny ml-1">Portal Access</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Student", "Teacher", "Admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-3 rounded-xl text-tiny font-bold transition-all ${
                        formData.role === r
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-tiny ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full h-14 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-[1.2rem] pl-12 pr-4 text-body-bold outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 dark:text-white ${
                      errors.email ? "border-rose-500/50" : ""
                    }`}
                    placeholder="name@university.edu"
                  />
                </div>
                {errors.email && <p className="text-tiny !text-rose-500 ml-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-tiny">Security Pin</label>
                  <Link to="/forgot-password" size="sm" className="text-tiny text-blue-600 hover:underline">
                    Recovery?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full h-14 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-[1.2rem] pl-12 pr-4 text-body-bold outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 dark:text-white ${
                      errors.password ? "border-rose-500/50" : ""
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-tiny !text-rose-500 ml-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-[1.2rem] heading-sm !text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group/btn uppercase tracking-widest"
              >
                {isLoggingIn ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Authorize Access
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-body font-bold">Institutional Access Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

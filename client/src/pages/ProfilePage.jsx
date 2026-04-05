import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import { 
  Mail, 
  Shield, 
  UserRound, 
  Building2, 
  GraduationCap, 
  Save, 
  Edit3, 
  X, 
  Briefcase,
  Camera,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    experties: "",
    bio: "",
    portfolioUrl: "",
  });

  const completeness = useMemo(() => {
    if (!authUser) return 0;
    const fields = [
      authUser.name,
      authUser.email,
      authUser.department,
      authUser.bio,
      authUser.portfolioUrl,
      authUser.role === "Teacher" ? (authUser.experties?.length > 0) : true,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        email: authUser.email || "",
        department: authUser.department || "",
        experties: Array.isArray(authUser.experties) ? authUser.experties.join(", ") : authUser.experties || "",
        bio: authUser.bio || "",
        portfolioUrl: authUser.portfolioUrl || "",
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      // toast already handled in slice
    }
  };

  const initials = authUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "PS";

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Profile Header */}
      <section className="relative overflow-hidden premium-card !p-0 border-none">
        <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-16 left-10 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-2xl relative z-10 overflow-hidden">
                {initials}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <Camera size={18} />
              </button>
            </div>
            <div className="mb-4">
              <h1 className="heading-lg !text-white drop-shadow-md mb-1">{authUser?.name}</h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-tiny font-bold text-white uppercase tracking-widest">
                <Shield size={12} />
                {authUser?.role}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-20 pb-8 px-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-body font-bold">{authUser?.email}</p>
            <p className="text-tiny text-blue-600 uppercase tracking-tighter flex items-center gap-1 font-bold">
              <CheckCircle2 size={12} /> Account Verified
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              isEditing 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200" 
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: General Info */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="premium-card space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600">
                <UserRound size={24} />
              </div>
              <h3 className="heading-md">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-tiny ml-1">Full Name</label>
                <div className="relative group">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-tiny ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-tiny ml-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              {authUser?.role === "Teacher" && (
                <div className="space-y-2">
                  <label className="text-tiny ml-1">Expertise</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      type="text"
                      name="experties"
                      value={formData.experties}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70"
                      placeholder="e.g. AI, Machine Learning"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <label className="text-tiny ml-1">Professional Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70 resize-none"
                  placeholder="Tell us about your academic interests and career goals..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-tiny ml-1">Portfolio / LinkedIn URL</label>
                <div className="relative group">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-body-bold disabled:opacity-70"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-body-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-widest"
                >
                  {isUpdatingProfile ? "Updating..." : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right: Security/Additional Info */}
        <div className="lg:col-span-4 space-y-8">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] relative overflow-hidden">
               {/* Progress Circle UI */}
               <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" />
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * completeness) / 100} className="text-blue-600 transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <span className="absolute heading-lg !text-slate-800 dark:!text-white">{completeness}%</span>
               </div>
               <p className="text-tiny mb-4">Profile Completeness</p>
               <p className="text-body text-center font-bold">
                  {completeness < 100 ? "Complete your profile to unlock all placement tools!" : "Your profile is fully optimized for recruiters."}
               </p>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <GraduationCap size={24} />
                </div>
                <h4 className="heading-md !text-white">ProjectSphere Pro</h4>
                <p className="text-body !text-slate-400 font-bold leading-relaxed">
                  Your portfolio-ready project management hub. Modern, efficient, and professional.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

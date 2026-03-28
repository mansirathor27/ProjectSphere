import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";
import { FileText, Send, Loader2, AlertCircle, CheckCircle2, Users, Search, X, UserPlus, UserMinus } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/student/search-students?query=${query}`);
      // Filter out already selected members
      const filtered = res.data.data.students.filter(
        s => !selectedMembers.find(m => m._id === s._id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (student) => {
    setSelectedMembers([...selectedMembers, student]);
    setSearchResults(searchResults.filter(s => s._id !== student._id));
    setSearchQuery("");
  };

  const removeMember = (id) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        groupMembers: selectedMembers.map(m => m._id)
      };
      await dispatch(submitProjectProposal(payload)).unwrap();
      setSubmitSuccess(true);
      setFormData({ title: "", description: "" });
      setSelectedMembers([]);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      // Error handled by toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/40 dark:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Project Initiation
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Submit Project Proposal
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Please fill out all sections of your project proposal. Make sure to be detailed and 
                clear about your project goals, objectives, and expected outcomes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                <FileText className="inline h-3 w-3 mr-1" />
                New Proposal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Card */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">Proposal submitted successfully! Your supervisor will review it soon.</p>
              </div>
            )}

            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="Enter your project title (e.g., AI-Powered Student Performance Predictor)"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose a clear, descriptive title that reflects your project's main focus.
              </p>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 resize-y"
                placeholder="Provide a detailed description of your project including:
• Problem statement and motivation
• Proposed solution and methodology
• Expected outcomes and deliverables
• Timeline and milestones"
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Be specific about your project goals, methodology, and expected outcomes.
              </p>
            </div>

            {/* Group Members Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Collaboration <span className="text-slate-400 font-medium">(Optional)</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 font-medium italic">Add group members if you want to collaborate on this project.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                   <Users size={20} />
                </div>
              </div>

              {/* Search Box */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search students by name or email..."
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                
                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => addMember(s)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-none border-slate-50 dark:border-slate-800"
                        >
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{s.department}</p>
                          </div>
                          <UserPlus size={18} className="text-blue-600" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500 font-medium italic">No students found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Members Chips */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedMembers.map((m) => (
                    <div key={m._id} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400">{m.name}</span>
                        <span className="text-[9px] font-bold text-blue-500/70 uppercase">{m.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(m._id)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-blue-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Tips Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Proposal Tips</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-2">
              1
            </div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Be Specific</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Clearly define your project scope, objectives, and expected outcomes.</p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-2">
              2
            </div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Show Impact</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Explain how your project solves real-world problems or advances knowledge.</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-2">
              3
            </div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Be Realistic</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Set achievable goals with a clear timeline and methodology.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubmitProposal;
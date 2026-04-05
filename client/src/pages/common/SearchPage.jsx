import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Search, User, Folder, Loader2, ArrowRight, Filter, Sparkles, AlertCircle, Inbox, BadgeCheck, GraduationCap, Clock } from "lucide-react";
import { useSelector } from "react-redux";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState({ users: [], projects: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // all, projects, users
    const { authUser } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) return;
            setLoading(true);
            try {
                const res = await axiosInstance.get(`/search?q=${query}`);
                setResults(res.data.data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const filteredProjects = results.projects;
    const filteredUsers = results.users;

    const totalResults = filteredProjects.length + filteredUsers.length;

    return (
        <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
            {/* Header Section */}
            <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest">
                            <Search size={12} />
                            Global Discovery
                        </div>
                        <h1 className="heading-lg">
                            Results for <span className="text-blue-600 underline decoration-blue-500/30 underline-offset-8">"{query}"</span>
                        </h1>
                        <p className="max-w-xl text-body">
                            Found {totalResults} matches across the platform. Use filters to narrow down your search.
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-10 flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-fit">
                    {[
                        { id: "all", label: "Everything", icon: Sparkles },
                        { id: "projects", label: `Projects (${filteredProjects.length})`, icon: Folder },
                        { id: "users", label: `People (${filteredUsers.length})`, icon: User }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Querying ProjectSphere...</p>
                </div>
            ) : totalResults > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Projects Results */}
                    {(activeTab === "all" || activeTab === "projects") && (
                        <div className={`${activeTab === 'all' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white mb-6">
                                <Folder className="text-blue-600" />
                                Project Repository
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredProjects.map((project) => (
                                    <div key={project._id} className="premium-card group hover:-translate-y-1 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                                                <Folder size={20} />
                                            </div>
                                            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                Active
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{project.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                    <User size={14} className="text-slate-400" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate w-24">
                                                    {project.student?.name}
                                                </span>
                                            </div>
                                            <Link 
                                                to={`/${authUser?.role.toLowerCase()}/projects`} 
                                                className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Users Results */}
                    {(activeTab === "all" || activeTab === "users") && (
                        <div className={`${activeTab === 'all' ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6`}>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white mb-6">
                                <User className="text-blue-600" />
                                Community Members
                            </h3>
                            <div className="space-y-4">
                                {filteredUsers.map((user) => (
                                    <div key={user._id} className="premium-card p-4 flex items-center gap-4 hover:bg-blue-600/[0.02] transition-colors group">
                                         <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center font-bold text-white shadow-lg ${
                                            user.role === 'Admin' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' :
                                            user.role === 'Teacher' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                                            'bg-gradient-to-br from-emerald-500 to-teal-600'
                                         }`}>
                                            {user.name.charAt(0)}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{user.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user.role}</span>
                                                <span className="text-[10px] text-slate-400 font-bold truncate">{user.department}</span>
                                            </div>
                                         </div>
                                         <Link 
                                            to={`/${authUser?.role.toLowerCase()}/profile`}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                         >
                                            <ArrowRight size={18} />
                                         </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-8">
                        <Inbox size={48} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No matches found</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-sm leading-relaxed">
                        We couldn't find anything matching "{query}". Try checking your spelling or using different keywords.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { 
  Send, 
  User, 
  Users,
  Clock, 
  MessageSquare, 
  Loader, 
  ArrowLeft, 
  MoreVertical, 
  Edit,
  Check,
  CheckCheck
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { connectSocket, getSocket } from "../../lib/socket";
import { toast } from "react-toastify";

const ChatPage = () => {
  const { projectId } = useParams();
  const { authUser } = useSelector((state) => state.auth);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(null); // Now tracks who is typing
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/chat/${projectId}`);
        setMessages(res.data.data.messages);
        
        const projRes = await axiosInstance.get(`/project/${projectId}`);
        const projectData = projRes.data.data.project;
        setProject(projectData);
        setGroupNameInput(projectData.groupName || "");
        
        // For individual display (e.g. if it's 1-on-1)
        let chatReceiver = null;
        if (authUser.role === "Student") {
          chatReceiver = projectData.supervisor;
        } else {
          chatReceiver = projectData.students?.[0];
        }
        setReceiver(chatReceiver);

      } catch (error) {
        console.error("Failed to fetch chat data:", error);
        toast.error("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    if (projectId && authUser) {
      fetchChatData();
      connectSocket(authUser._id);
      const socket = getSocket();

      socket.emit("register", authUser._id);
      
      socket.on("online_users", (users) => {
        if (receiver && users.includes(receiver._id || receiver)) {
          setIsOnline(true);
        }
      });

      socket.on("user_status", ({ userId, status }) => {
        if (receiver && userId === (receiver._id || receiver)) {
          setIsOnline(status === "online");
        }
      });

      socket.on("user_typing", ({ senderId, projectId: pId }) => {
        if (pId === projectId && senderId !== authUser._id) {
          setPartnerTyping(senderId);
        }
      });

      socket.on("user_stop_typing", ({ senderId, projectId: pId }) => {
        if (pId === projectId) {
          setPartnerTyping(null);
        }
      });
      
      socket.on("receive_message", (message) => {
        if (message.project === projectId) {
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some(m => m._id === message._id)) return prev;
            return [...prev, message];
          });
          
          if (message.sender._id !== authUser._id) {
            socket.emit("mark_read", { 
              messageIds: [message._id], 
              projectId,
              readerId: authUser._id
            });
          }
        }
      });

      socket.on("message_sent", (message) => {
        if (message.project === projectId) {
          setMessages((prev) => {
             if (prev.some(m => m._id === message._id)) return prev;
             return [...prev, message];
          });
        }
      });

      socket.on("messages_read", ({ messageIds, readerId }) => {
        if (readerId !== authUser._id) {
          setMessages((prev) => prev.map(m => 
            messageIds.includes(m._id) ? { ...m, status: "read" } : m
          ));
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("message_sent");
        socket.off("user_status");
        socket.off("online_users");
        socket.off("user_typing");
        socket.off("user_stop_typing");
        socket.off("messages_read");
      };
    }
  }, [projectId, authUser?._id, receiver?._id]);

  useEffect(() => {
    if (messages.length > 0 && authUser) {
      const socket = getSocket();
      const unreadMessageIds = messages
        .filter(m => {
          const senderId = m.sender._id || m.sender;
          return senderId !== authUser._id && m.status !== "read";
        })
        .map(m => m._id);

      if (unreadMessageIds.length > 0) {
        socket.emit("mark_read", { 
          messageIds: unreadMessageIds, 
          projectId,
          readerId: authUser._id
        });
      }
    }
  }, [messages.length, authUser?._id, projectId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    socket.emit("typing", { senderId: authUser._id, projectId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { senderId: authUser._id, projectId });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socket = getSocket();
    socket.emit("send_message", {
      sender: authUser._id,
      project: projectId,
      text: newMessage,
    });
    
    socket.emit("stop_typing", { senderId: authUser._id, projectId });
    setNewMessage("");
  };

  const handleUpdateGroupName = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/project/${projectId}/group-name`, { groupName: groupNameInput });
      setProject(res.data.data.project);
      setIsEditingName(false);
      toast.success("Group name updated");
    } catch (error) {
      toast.error("Failed to update group name");
    }
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  const isGroup = project?.students?.length > 1;
  const displayName = isGroup ? (project.groupName || "Unnamed Group") : (receiver?.name || "Collaborator");
  const initials = isGroup ? "GP" : (receiver?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "CP");

  return (
    <div className="mx-auto max-w-[1400px] h-[calc(100vh-140px)] flex flex-col relative">
      {/* Header */}
      <div className="glass-effect rounded-t-[2.5rem] border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-5 flex items-center justify-between z-10 shadow-lg shadow-slate-200/20">
        <div className="flex items-center gap-4">
          <Link to={authUser.role === "Student" ? "/student" : "/teacher"} className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl ${isGroup ? 'bg-indigo-600' : 'bg-blue-600'} text-white flex items-center justify-center font-bold heading-md shadow-lg ring-4 ring-white dark:ring-slate-900`}>
              {isGroup ? <Users size={28} /> : initials}
            </div>
            {!isGroup && isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-md" />
            )}
          </div>
          <div className="min-w-0">
            {isEditingName ? (
              <form onSubmit={handleUpdateGroupName} className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1 heading-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                />
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="heading-md truncate">
                  {displayName}
                </h3>
                {isGroup && authUser.role === "Student" && (
                   <button onClick={() => setIsEditingName(true)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                     <Edit size={14} />
                   </button>
                )}
              </div>
            )}
            <p className="text-tiny flex items-center gap-2 mt-0.5">
              {partnerTyping ? (
                <span className="text-blue-600 animate-pulse">someone is typing...</span>
              ) : (
                isGroup ? `${project?.students?.length} Participants` : (isOnline ? <span className="text-emerald-500">Online Now</span> : "Offline")
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
             <MoreVertical size={20} />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scroll bg-slate-50/30 dark:bg-slate-900/10">
        {authUser.role === "Student" && (!project || !project.supervisor) ? (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-orange-500/10 flex items-center justify-center text-orange-600 mb-6 animate-pulse">
              <Clock size={48} strokeWidth={1.5} />
            </div>
            <h4 className="heading-ld mb-3">Chat Temporarily Unavailable</h4>
            <p className="text-body text-slate-500 dark:text-slate-400">
              Your centralized communication channel is currently locked. It will automatically unlock once a supervisor has been officially assigned and has accepted your supervision request.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-6 animate-float">
              <MessageSquare size={40} />
            </div>
            <h4 className="heading-md mb-2">Secure Broadcast Active</h4>
            <p className="text-body text-slate-500">
              Communication in this project is encrypted. All team members and your supervisor can discuss milestones here.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === authUser._id;
            const senderName = msg.sender?.name || "Unknown";
            const showName = isGroup && !isMe;
            
            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start animate-in fade-in slide-in-from-left-4 duration-300"}`}>
                {showName && (
                  <span className="text-tiny mb-1.5 ml-4">
                    {senderName}
                  </span>
                )}
                <div className={`group relative max-w-[80%] md:max-w-[60%] p-4 rounded-[1.8rem] transition-all duration-200 shadow-sm ${
                  isMe 
                  ? "bg-blue-600 text-white rounded-tr-none shadow-blue-600/10" 
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                }`}>
                  <p className="text-body !leading-relaxed">{msg.text}</p>
                </div>
                <div className={`mt-2 flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                   <span className="text-tiny font-bold opacity-60">
                     {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {isMe && (
                     <div className="flex items-center">
                       {msg.status === "sent" && <Check size={14} className="text-slate-300" />}
                       {msg.status === "delivered" && <CheckCheck size={14} className="text-slate-300" />}
                       {msg.status === "read" && <CheckCheck size={14} className="text-blue-500" />}
                     </div>
                   )}
                </div>
              </div>
            );
          })
        )}
        {partnerTyping && (
           <div className="flex flex-col items-start slide-in-bottom">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-tl-none border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                 <div className="flex gap-1.5 item-center h-4">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                 </div>
              </div>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 z-10 glass-effect border-t border-slate-200/50 dark:border-slate-800/50 rounded-b-[2.5rem]">
        {authUser.role === "Student" && (!project || !project.supervisor) ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-[2rem] p-4 text-center border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-body font-medium flex items-center justify-center gap-2">
            <Clock size={18} />
            Awaiting supervisor acceptance to unlock messages
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="bg-white dark:bg-slate-800 rounded-[2rem] p-3 flex gap-4 items-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xl focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder={isGroup ? "Message group members..." : "Type your message..."}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-body-bold placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-[1.2rem] bg-blue-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-600/30"
            >
              <Send size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

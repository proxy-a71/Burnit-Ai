import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, X, Plus, MessageSquare, FolderKanban, User, LogOut, Settings, Globe, Paperclip, FileText, XCircle, Edit2, Camera, ChevronDown } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAA4LfD-0dPBrivEDPxKC8_V_Esae8czOs",
  authDomain: "burnit-ai-84d8a.firebaseapp.com",
  projectId: "burnit-ai-84d8a",
  storageBucket: "burnit-ai-84d8a.firebasestorage.app",
  messagingSenderId: "97544066120",
  appId: "1:97544066120:web:2bd3aceb1c38d200a3347d"
};

const OPENAI_KEY = process.env.VITE_OPENAI_KEY || '';

const BurnitLogo = ({ className = "w-24 h-24" }) => (
  <img src="/Burnit-logo.png" alt="Logo" className={className} />
);

export default function BurnitAI() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    dob: '',
    region: '',
    joinDate: ''
  });
  const [customAvatar, setCustomAvatar] = useState(null);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    dob: '',
    region: ''
  });
  const [showYearSelector, setShowYearSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    const loadFirebase = async () => {
      try {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
          setFirebaseLoaded(true);
          return;
        }

        const scripts = [
          'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
          'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js'
        ];

        for (const src of scripts) {
          if (document.querySelector(`script[src="${src}"]`)) {
            continue;
          }

          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
          });
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        if (window.firebase) {
          if (!window.firebase.apps || window.firebase.apps.length === 0) {
            window.firebase.initializeApp(firebaseConfig);
          }
          setFirebaseLoaded(true);
        } else {
          throw new Error('Firebase not available');
        }
      } catch (error) {
        setAuthError('Authentication loading... You can use Demo mode anytime!');
        setTimeout(() => setFirebaseLoaded(true), 2000);
      }
    };

    loadFirebase();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (theme === 'Dark') {
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      document.body.style.backgroundColor = '#f9fafb';
    }
  }, [theme]);

  const handleGoogleLogin = async () => {
    if (!window.firebase) {
      setAuthError('Please use Demo mode or wait for Firebase to load.');
      return;
    }

    try {
      setAuthError('');
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await window.firebase.auth().signInWithPopup(provider);
      
      const firebaseUser = result.user;
      const joinDate = new Date().toISOString().split('T')[0];
      
      setUser({
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        provider: 'google',
        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=8b5cf6&color=fff`,
        uid: firebaseUser.uid
      });
      
      setProfileData({
        name: firebaseUser.displayName || 'User',
        dob: '',
        region: '',
        joinDate: joinDate
      });
      
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowEditProfile(true);
    } catch (error) {
      setAuthError('Login failed. Please try Demo mode instead!');
    }
  };

  const handleFacebookLogin = async () => {
    if (!window.firebase) {
      setAuthError('Please use Demo mode or wait for Firebase to load.');
      return;
    }

    try {
      setAuthError('');
      const provider = new window.firebase.auth.FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await window.firebase.auth().signInWithPopup(provider);
      
      const firebaseUser = result.user;
      const joinDate = new Date().toISOString().split('T')[0];
      
      setUser({
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        provider: 'facebook',
        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=8b5cf6&color=fff`,
        uid: firebaseUser.uid
      });
      
      setProfileData({
        name: firebaseUser.displayName || 'User',
        dob: '',
        region: '',
        joinDate: joinDate
      });
      
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowEditProfile(true);
    } catch (error) {
      setAuthError('Login failed. Please try Demo mode instead!');
    }
  };

  const handleDemoLogin = () => {
    const joinDate = new Date().toISOString().split('T')[0];
    setUser({
      name: 'Demo User',
      email: 'mukan@burnitai.com',
      provider: 'demo',
      avatar: `https://ui-avatars.com/api/?name=Demo+User&background=8b5cf6&color=fff`
    });
    setProfileData({
      name: 'Demo User',
      dob: '',
      region: '',
      joinDate: joinDate
    });
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowEditProfile(true);
  };

  const handleProfileSave = () => {
    setUser({
      ...user,
      name: profileData.name,
      avatar: customAvatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=8b5cf6&color=fff`
    });
    setShowEditProfile(false);
    createNewChat();
  };

  const handleEditProfile = () => {
    setEditProfileData({
      name: profileData.name,
      dob: profileData.dob,
      region: profileData.region || ''
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    setProfileData({
      ...profileData,
      name: editProfileData.name,
      dob: editProfileData.dob,
      region: editProfileData.region
    });
    setUser({
      ...user,
      name: editProfileData.name,
      avatar: customAvatar || user.avatar
    });
    setShowEditProfile(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    if (window.firebase && window.firebase.auth) {
      try {
        await window.firebase.auth().signOut();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setIsAuthenticated(false);
    setShowLogin(true);
    setUser(null);
    setChats([]);
    setMessages([]);
    setCurrentChatId(null);
    setUploadedFiles([]);
    setProfileData({ name: '', dob: '', region: '', joinDate: '' });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const createNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setCurrentView('chat');
    setSidebarOpen(false);
  };

  const loadChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setCurrentView('chat');
      setSidebarOpen(false);
    }
  };

  const updateChatTitle = (chatId, newMessages) => {
    if (newMessages.length === 2) {
      const userMessage = newMessages[0].content;
      const title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    }
  };

  const updateChat = (chatId, newMessages) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages: newMessages } : chat
    ));
  };

  const sendMessage = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    let messageContent = input || '';
    
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map(f => f.name).join(', ');
      messageContent = input ? `${input}\n\n[Files attached: ${fileList}]` : `Files uploaded: ${fileList}`;
    }

    const userMessage = { 
      role: 'user', 
      content: messageContent,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    const imageKeywords = ['generate image', 'create image', 'make image', 'draw', 'generate a picture', 'create a picture', 'make a picture', 'draw me', 'create art', 'generate art'];
    const isImageRequest = imageKeywords.some(keyword => messageContent.toLowerCase().includes(keyword));

    if (isImageRequest) {
      setTimeout(() => {
        const prompt = messageContent.replace(/generate image|create image|make image|draw|generate a picture|create a picture|make a picture/gi, '').trim();
        const imageMessage = {
          role: 'assistant',
          content: `🎨 Here's your generated image: "${prompt || 'artwork'}"`,
          image: `https://picsum.photos/seed/${Date.now()}/800/600`
        };
        const updatedMessages = [...newMessages, imageMessage];
        setMessages(updatedMessages);
        updateChat(currentChatId, updatedMessages);
        setIsLoading(false);
      }, 2000);
      return;
    }

    if (/who made you|who is your creator|who created you/i.test(messageContent)) {
      setTimeout(() => {
        const creatorMessage = {
          role: 'assistant',
          content: "Zsateishiish aka Samarpan Aree made me -- the man that takes 6 months to make me!!"
        };
        const updatedMessages = [...newMessages, creatorMessage];
        setMessages(updatedMessages);
        updateChat(currentChatId, updatedMessages);
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (/who are you/i.test(messageContent)) {
      setTimeout(() => {
        const identityMessage = {
          role: 'assistant',
          content: "I am Burnit AI! Your Personal Ai For Your Confusing Questions, Giving You Motivation 💪 And Help You In Any Error's!!"
        };
        const updatedMessages = [...newMessages, identityMessage];
        setMessages(updatedMessages);
        updateChat(currentChatId, updatedMessages);
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (/who is muskan/i.test(messageContent)) {
      setTimeout(() => {
        const muskanMessage = {
          role: 'assistant',
          content: "You mean Nyan Nyan, YUAN YUAN, If so Then My Creator Is Making A Translator For him!!"
        };
        const updatedMessages = [...newMessages, muskanMessage];
        setMessages(updatedMessages);
        updateChat(currentChatId, updatedMessages);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: messageContent
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let assistantResponse = "I apologize, but I couldn't process your request.";
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantResponse = data.choices[0].message.content;
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantResponse
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      updateChat(currentChatId, updatedMessages);
      updateChatTitle(currentChatId, updatedMessages);
      
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please check your API key or try again later.'
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      updateChat(currentChatId, updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BurnitLogo className="w-24 h-24" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Burnit AI
            </h1>
            <p className="text-gray-600 mt-2">Your intelligent AI assistant</p>
            
            {authError && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">{authError}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleDemoLogin}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              Continue as Demo User →
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'Dark' ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-transform duration-300 flex flex-col`}>
        <div className={`p-4 ${theme === 'Dark' ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <BurnitLogo className="w-8 h-8" />
            <span className={`font-bold text-xl ${theme === 'Dark' ? 'text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'}`}>
              Burnit AI
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className={`w-5 h-5 ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <button
          onClick={createNewChat}
          className="m-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button
              onClick={() => { setCurrentView('chat'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentView === 'chat' ? (theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600') : (theme === 'Dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
            >
              <MessageSquare className="w-5 h-5" />
              Chats
            </button>
            <button
              onClick={() => { setCurrentView('projects'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentView === 'projects' ? (theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600') : (theme === 'Dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
            >
              <FolderKanban className="w-5 h-5" />
              Projects
            </button>
            <button
              onClick={() => { setCurrentView('profile'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentView === 'profile' ? (theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600') : (theme === 'Dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentView === 'settings' ? (theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600') : (theme === 'Dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>

          {chats.length > 0 && currentView === 'chat' && (
            <div className="mt-6">
              <h3 className={`text-xs font-semibold ${theme === 'Dark' ? 'text-gray-500' : 'text-gray-500'} uppercase mb-2`}>Recent Chats</h3>
              <div className="space-y-1">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentChatId === chat.id ? (theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600') : (theme === 'Dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className={`p-4 ${theme === 'Dark' ? 'border-gray-700' : 'border-gray-200'} border-t space-y-2`}>
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 ${theme === 'Dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg transition-all`}
            >
              <Globe className="w-5 h-5" />
              <span className="flex-1 text-left">{language}</span>
            </button>
            {showLanguageMenu && (
              <div className={`absolute bottom-full left-0 right-0 mb-2 ${theme === 'Dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg overflow-hidden`}>
                {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Nepali'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLanguageMenu(false); }}
                    className={`w-full text-left px-4 py-2 ${theme === 'Dark' ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-purple-50 text-gray-700 hover:text-purple-600'} transition-all`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 ${theme === 'Dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-all`}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-2 ${theme === 'Dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
          >
            <Menu className={`w-6 h-6 ${theme === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
              {currentView === 'chat' ? 'Chat' : currentView === 'projects' ? 'Projects' : currentView === 'profile' ? 'Profile' : 'Settings'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img src={customAvatar || user?.avatar} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-purple-600" />
          </div>
        </div>

        {currentView === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BurnitLogo className="w-24 h-24 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Welcome to Burnit AI</h2>
                    <p className={`${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Ask me anything or request an image!</p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setInput('What can you help me with?')}
                        className={`${theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600'} px-4 py-2 rounded-lg text-sm hover:bg-purple-100 transition-all`}
                      >
                        What can you do?
                      </button>
                      <button
                        onClick={() => setInput('Generate an image of a sunset')}
                        className={`${theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600'} px-4 py-2 rounded-lg text-sm hover:bg-purple-100 transition-all`}
                      >
                        Generate image
                      </button>
                      <button
                        onClick={() => setInput('Who made you?')}
                        className={`${theme === 'Dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-600'} px-4 py-2 rounded-lg text-sm hover:bg-purple-100 transition-all`}
                      >
                        Who created you?
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <BurnitLogo className="w-8 h-8 mr-2 flex-shrink-0 mt-1" />
                      )}
                      <div className={`max-w-3xl ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : (theme === 'Dark' ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-800')} rounded-2xl p-4 shadow-sm`}>
                        {msg.files && msg.files.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {msg.files.map(file => (
                              <div key={file.id} className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm">
                                <FileText className="w-4 h-4" />
                                <span>{file.name}</span>
                                <span className="text-xs opacity-70">({file.size})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.image && (
                          <img src={msg.image} alt="Generated" className="mt-3 rounded-lg max-w-full" />
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start items-start">
                      <BurnitLogo className="w-8 h-8 mr-2 flex-shrink-0 mt-1" />
                      <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 shadow-sm`}>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className={`text-sm ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Burnit is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className={`${theme === 'Dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} border-t p-4`}>
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className={`flex items-center gap-2 ${theme === 'Dark' ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'} border px-3 py-2 rounded-lg text-sm`}>
                      <FileText className={`w-4 h-4 ${theme === 'Dark' ? 'text-purple-300' : 'text-purple-600'}`} />
                      <span className={theme === 'Dark' ? 'text-purple-200' : 'text-purple-700'}>{file.name}</span>
                      <span className={`text-xs ${theme === 'Dark' ? 'text-purple-400' : 'text-purple-500'}`}>({file.size})</span>
                      <button onClick={() => removeFile(file.id)} className={theme === 'Dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 ${theme === 'Dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition-all flex-shrink-0`}
                  title="Upload files"
                >
                  <Paperclip className={`w-5 h-5 ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message or upload files..."
                    className={`w-full px-4 py-3 ${theme === 'Dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                    rows="2"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-xs ${theme === 'Dark' ? 'text-gray-500' : 'text-gray-500'} mt-2 text-center`}>
                Burnit AI can make mistakes.
              </p>
            </div>
          </div>
        )}

        {currentView === 'projects' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FolderKanban className={`w-16 h-16 ${theme === 'Dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
              <h2 className={`text-2xl font-bold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Projects</h2>
              <p className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Your AI projects will appear here</p>
              <button 
                onClick={() => alert('Projects feature coming soon!')}
                className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Create Project
              </button>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-8`}>
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img src={customAvatar || user?.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-purple-600 mx-auto mb-4 object-cover" />
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-3 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className={`text-2xl font-bold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'}`}>{profileData.name || user?.name}</h2>
                  <p className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>{user?.email}</p>
                  <button
                    onClick={handleEditProfile}
                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="space-y-4">
                  <div className={`${theme === 'Dark' ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                    <h3 className={`font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Login Method:</span>
                        <span className={`font-semibold capitalize ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{user?.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Member Since:</span>
                        <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{profileData.joinDate || '2024/11/22'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Language:</span>
                        <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Date of Birth:</span>
                        <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{profileData.dob || 'Not set'}</span>
                      </div>
                      {profileData.region && (
                        <div className="flex justify-between">
                          <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Region:</span>
                          <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{profileData.region}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`${theme === 'Dark' ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                    <h3 className={`font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Usage Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Total Chats:</span>
                        <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{chats.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}>Messages Sent:</span>
                        <span className={`font-semibold ${theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}`}>{messages.filter(m => m.role === 'user').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <h1 className={`text-3xl font-bold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Settings</h1>
              
              <div className="space-y-4">
                <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h2 className={`text-xl font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Appearance</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'Dark' ? 'text-white' : 'text-gray-800'}`}>Theme</p>
                        <p className={`text-sm ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose your interface theme</p>
                      </div>
                      <select 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className={`${theme === 'Dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        <option>Light</option>
                        <option>Dark</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h2 className={`text-xl font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Language & Region</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'Dark' ? 'text-white' : 'text-gray-800'}`}>Language</p>
                        <p className={`text-sm ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select your preferred language</p>
                      </div>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={`${theme === 'Dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Chinese</option>
                        <option>Japanese</option>
                        <option>Hindi</option>
                        <option>Nepali</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'Dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h2 className={`text-xl font-semibold ${theme === 'Dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Privacy & Data</h2>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all chat history?')) {
                          setChats([]);
                          setMessages([]);
                          setCurrentChatId(null);
                          alert('Chat history cleared!');
                        }
                      }}
                      className={`w-full text-left px-4 py-3 ${theme === 'Dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} border rounded-lg transition-all`}
                    >
                      <span className={theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}>Clear all chat history</span>
                    </button>
                    <button 
                      onClick={() => alert('Download feature coming soon!')}
                      className={`w-full text-left px-4 py-3 ${theme === 'Dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} border rounded-lg transition-all`}
                    >
                      <span className={theme === 'Dark' ? 'text-gray-200' : 'text-gray-800'}>Download my data</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          alert('Account deletion feature coming soon!');
                        }
                      }}
                      className={`w-full text-left px-4 py-3 ${theme === 'Dark' ? 'border-red-700 hover:bg-red-900/20' : 'border-red-300 hover:bg-red-50'} border text-red-600 rounded-lg transition-all`}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'Dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
              Edit Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'Dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={editProfileData.dob}
                    onChange={(e) => setEditProfileData({...editProfileData, dob: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'Dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => setShowYearSelector(!showYearSelector)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                      theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                {showYearSelector && (
                  <div className={`mt-2 max-h-40 overflow-y-auto border rounded-lg ${
                    theme === 'Dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          const currentDate = editProfileData.dob ? new Date(editProfileData.dob) : new Date();
                          currentDate.setFullYear(year);
                          setEditProfileData({
                            ...editProfileData,
                            dob: currentDate.toISOString().split('T')[0]
                          });
                          setShowYearSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-purple-600 hover:text-white ${
                          theme === 'Dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Region
                </label>
                <select
                  value={editProfileData.region}
                  onChange={(e) => setEditProfileData({...editProfileData, region: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'Dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select Region</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className={`flex-1 py-2 px-4 border rounded-lg font-medium transition-all ${
                  theme === 'Dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
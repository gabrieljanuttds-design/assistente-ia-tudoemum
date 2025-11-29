"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  Target,
  Sparkles,
  Send,
  Plus,
  Check,
  Trash2,
  Star,
  Clock,
  TrendingUp,
  Menu,
  X
} from "lucide-react";

// Types
type Tab = "chat" | "generator" | "agenda" | "habits";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  favorite?: boolean;
}

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface Habit {
  id: string;
  name: string;
  goal: string;
  streak: number;
  lastCompleted: string | null;
  completedDates: string[];
}

interface GeneratedText {
  id: string;
  prompt: string;
  result: string;
  timestamp: number;
  favorite?: boolean;
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Generator state
  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);
  const [isLoadingGenerator, setIsLoadingGenerator] = useState(false);
  
  // Agenda state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  
  // Habits state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitGoal, setNewHabitGoal] = useState("");

  // Load data from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("ai-assistant-messages");
    const savedTexts = localStorage.getItem("ai-assistant-texts");
    const savedTasks = localStorage.getItem("ai-assistant-tasks");
    const savedHabits = localStorage.getItem("ai-assistant-habits");
    
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedTexts) setGeneratedTexts(JSON.parse(savedTexts));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("ai-assistant-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("ai-assistant-texts", JSON.stringify(generatedTexts));
  }, [generatedTexts]);

  useEffect(() => {
    localStorage.setItem("ai-assistant-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("ai-assistant-habits", JSON.stringify(habits));
  }, [habits]);

  // Chat functions
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoadingChat(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua mensagem.",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Erro ao conectar com a IA. Tente novamente.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const toggleFavoriteMessage = (id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, favorite: !msg.favorite } : msg
      )
    );
  };

  // Generator functions
  const generateText = async () => {
    if (!generatorPrompt.trim()) return;
    
    setIsLoadingGenerator(true);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generatorPrompt }),
      });
      
      const data = await response.json();
      
      const newText: GeneratedText = {
        id: Date.now().toString(),
        prompt: generatorPrompt,
        result: data.result || "Erro ao gerar texto.",
        timestamp: Date.now(),
      };
      
      setGeneratedTexts(prev => [newText, ...prev]);
      setGeneratorPrompt("");
    } catch (error) {
      const errorText: GeneratedText = {
        id: Date.now().toString(),
        prompt: generatorPrompt,
        result: "Erro ao conectar com a IA. Tente novamente.",
        timestamp: Date.now(),
      };
      setGeneratedTexts(prev => [errorText, ...prev]);
    } finally {
      setIsLoadingGenerator(false);
    }
  };

  const toggleFavoriteText = (id: string) => {
    setGeneratedTexts(prev =>
      prev.map(text =>
        text.id === id ? { ...text, favorite: !text.favorite } : text
      )
    );
  };

  const deleteGeneratedText = (id: string) => {
    setGeneratedTexts(prev => prev.filter(text => text.id !== id));
  };

  // Task functions
  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      date: newTaskDate,
      time: newTaskTime || "00:00",
      completed: false,
      priority: newTaskPriority,
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskDate("");
    setNewTaskTime("");
    setNewTaskPriority("medium");
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Habit functions
  const addHabit = () => {
    if (!newHabitName.trim() || !newHabitGoal.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      goal: newHabitGoal,
      streak: 0,
      lastCompleted: null,
      completedDates: [],
    };
    
    setHabits(prev => [...prev, newHabit]);
    setNewHabitName("");
    setNewHabitGoal("");
  };

  const completeHabit = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit;
        
        if (habit.completedDates.includes(today)) {
          return habit;
        }
        
        const newCompletedDates = [...habit.completedDates, today];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const newStreak = habit.lastCompleted === yesterday ? habit.streak + 1 : 1;
        
        return {
          ...habit,
          streak: newStreak,
          lastCompleted: today,
          completedDates: newCompletedDates,
        };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const isHabitCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completedDates.includes(today);
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-500";
      case "medium": return "text-yellow-500 border-yellow-500";
      case "low": return "text-green-500 border-green-500";
      default: return "text-gray-500 border-gray-500";
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Assistente IA
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Seu parceiro inteligente</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === "chat"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab("generator")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === "generator"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">Gerador</span>
              </button>
              <button
                onClick={() => setActiveTab("agenda")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === "agenda"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Agenda</span>
              </button>
              <button
                onClick={() => setActiveTab("habits")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === "habits"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Target className="w-4 h-4" />
                <span className="font-medium">Hábitos</span>
              </button>
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 space-y-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("chat");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "chat"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Chat com IA</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("generator");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "generator"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Gerador de Textos</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("agenda");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "agenda"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Agenda Inteligente</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("habits");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === "habits"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">Hábitos & Rotinas</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat com IA</h2>
              <p className="text-gray-600 mb-6">Converse e obtenha respostas instantâneas</p>
              
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Inicie uma conversa com a IA</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => toggleFavoriteMessage(msg.id)}
                            className="mt-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${msg.favorite ? "fill-current" : ""}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={handleChatInputChange}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingChat}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoadingChat}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === "generator" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerador de Textos</h2>
              <p className="text-gray-600 mb-6">Crie textos, ideias e resumos rapidamente</p>
              
              <div className="space-y-4 mb-6">
                <textarea
                  value={generatorPrompt}
                  onChange={(e) => setGeneratorPrompt(e.target.value)}
                  placeholder="Descreva o que você quer gerar... Ex: 'Escreva um email profissional sobre...'"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  disabled={isLoadingGenerator}
                />
                <button
                  onClick={generateText}
                  disabled={isLoadingGenerator}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                >
                  {isLoadingGenerator ? "Gerando..." : "Gerar Texto"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {generatedTexts.map((text) => (
                <div key={text.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">{text.prompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavoriteText(text.id)}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${text.favorite ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => deleteGeneratedText(text.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{text.result}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda Tab */}
        {activeTab === "agenda" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Agenda Inteligente</h2>
              <p className="text-gray-600 mb-6">Organize suas tarefas e compromissos</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Título da tarefa"
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              
              <button
                onClick={addTask}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Tarefa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa agendada</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${getPriorityColor(task.priority)} ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-semibold text-gray-800 ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          task.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{task.date} às {task.time}</span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-600 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === "habits" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hábitos & Rotinas</h2>
              <p className="text-gray-600 mb-6">Crie e acompanhe seus hábitos diários</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Nome do hábito"
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newHabitGoal}
                  onChange={(e) => setNewHabitGoal(e.target.value)}
                  placeholder="Meta (ex: 30 minutos por dia)"
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={addHabit}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Hábito
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum hábito criado ainda</p>
                </div>
              ) : (
                habits.map((habit) => {
                  const completedToday = isHabitCompletedToday(habit);
                  return (
                    <div
                      key={habit.id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{habit.name}</h3>
                          <p className="text-sm text-gray-600">{habit.goal}</p>
                        </div>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-gray-800">{habit.streak}</span>
                          <span className="text-sm text-gray-600">dias</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => completeHabit(habit.id)}
                        disabled={completedToday}
                        className={`w-full py-3 rounded-xl font-medium transition-all ${
                          completedToday
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                        }`}
                      >
                        {completedToday ? "✓ Concluído Hoje" : "Marcar como Feito"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, Conversation, ChatState } from './chat';
import { PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const LoadingDots = () => (
  <div className="flex space-x-1.5 items-center">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
  </div>
);

interface ChatInterfaceProps {
  asignatura?: string;
  nombreDoc?: string;
}

export default function ChatInterface({ asignatura, nombreDoc }: ChatInterfaceProps) {
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    activeConversationId: null
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar el estado del chat del localStorage al iniciar
  useEffect(() => {
    const savedState = localStorage.getItem('chatState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setChatState(parsedState);
      setShowTabs(parsedState.conversations.length > 1);
    }
  }, []);

  // Mantener el foco en el input
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, chatState.activeConversationId]);

  // Guardar el estado del chat en localStorage cuando se actualice
  useEffect(() => {
    if (chatState.conversations.length > 0) {
      localStorage.setItem('chatState', JSON.stringify(chatState));
      setShowTabs(chatState.conversations.length > 1);
    } else {
      localStorage.removeItem('chatState');
      setShowTabs(false);
    }
  }, [chatState]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Solo hacer scroll cuando hay mensajes nuevos
    const activeConversation = chatState.conversations.find(
      conv => conv.id === chatState.activeConversationId
    );
    if (activeConversation && activeConversation.messages.length > 0) {
      scrollToBottom();
    }
  }, [chatState]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: 'Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };

    if (chatState.conversations.length === 0) {
      // Si no hay conversaciones, crear la primera
      setChatState({
        conversations: [newConversation],
        activeConversationId: newConversation.id
      });
    } else if (chatState.conversations.length === 1 && !showTabs) {
      // Si hay una conversación sin pestañas, convertirla en pestañas
      setChatState(prev => ({
        conversations: [...prev.conversations, newConversation],
        activeConversationId: newConversation.id
      }));
      setShowTabs(true);
    } else {
      // Añadir una nueva pestaña
      setChatState(prev => ({
        conversations: [...prev.conversations, newConversation],
        activeConversationId: newConversation.id
      }));
    }
  };

  const deleteConversation = (conversationId: string) => {
    setChatState(prev => {
      const newConversations = prev.conversations.filter(conv => conv.id !== conversationId);

      // Si solo queda una conversación, ocultar las pestañas
      if (newConversations.length === 1) {
        setShowTabs(false);
        return {
          conversations: newConversations,
          activeConversationId: newConversations[0].id
        };
      }

      // Si se está borrando la conversación activa, activar la última
      const newActiveId = prev.activeConversationId === conversationId
        ? newConversations[newConversations.length - 1]?.id || null
        : prev.activeConversationId;

      return {
        conversations: newConversations,
        activeConversationId: newActiveId
      };
    });
  };

  const resetAllChats = () => {
    setChatState({
      conversations: [],
      activeConversationId: null
    });
    setShowTabs(false);
    localStorage.removeItem('chatState');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Si no hay conversación activa, crear una nueva
    if (!chatState.activeConversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        name: 'Chat',
        messages: [],
        createdAt: new Date().toISOString()
      };
      setChatState({
        conversations: [newConversation],
        activeConversationId: newConversation.id
      });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    // Actualizar la conversación activa con el nuevo mensaje
    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => {
        if (conv.id === prev.activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage]
          };
        }
        return conv;
      })
    }));

    setInput('');
    setIsLoading(true);

    try {
      // DEPURACIÓN: revisa la consola del navegador para ver estos valores
      console.log("ENVIANDO AL BACKEND:", {
        message: input.trim(),
        asignatura,
        nombreDoc
      });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          asignatura: asignatura || "",
          nombreDoc: nombreDoc || ""
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id === prev.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, botMessage]
            };
          }
          return conv;
        })
      }));
    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id === prev.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, errorMessage]
            };
          }
          return conv;
        })
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return;

    // Si no hay conversación activa, crear una nueva
    if (!chatState.activeConversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        name: 'Chat',
        messages: [],
        createdAt: new Date().toISOString()
      };
      setChatState({
        conversations: [newConversation],
        activeConversationId: newConversation.id
      });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    // Actualizar la conversación activa con el nuevo mensaje
    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => {
        if (conv.id === prev.activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage]
          };
        }
        return conv;
      })
    }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id === prev.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, botMessage]
            };
          }
          return conv;
        })
      }));
    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id === prev.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, errorMessage]
            };
          }
          return conv;
        })
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    // Reemplazar **texto** con <strong>texto</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const activeConversation = chatState.conversations.find(
    conv => conv.id === chatState.activeConversationId
  );

  return (
    <>

      <div className="flex flex-col h-full w-full bg-white shadow-lg relative">
        {/* Header con pestañas o botones de acción */}
        <div className="border-b border-gray-200">
          {showTabs ? (
            <div className="flex items-center gap-1 bg-gray-50 px-2 pt-2">
              <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {chatState.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() =>
                      setChatState((prev) => ({ ...prev, activeConversationId: conv.id }))
                    }
                    className={`group relative flex items-center px-4 py-2 rounded-t-lg min-w-[120px] transition-all duration-200 ${chatState.activeConversationId === conv.id
                        ? 'bg-white text-gray-800 border-t-2 border-blue-500 border-x border-b-white z-10'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <span className="truncate">{conv.name}</span>
                    <XMarkIcon
                      className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    />
                    {chatState.activeConversationId === conv.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetAllChats}
                  className="p-2 rounded-md hover:bg-gray-200 text-gray-600 flex-shrink-0 transition-colors"
                  title="Borrar todo el historial"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={createNewConversation}
                  className="p-2 rounded-md hover:bg-gray-200 text-gray-600 flex-shrink-0 transition-colors"
                  title="Nueva conversación"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-700">Chat de Profesores</h2>
              <div className="flex items-center gap-1">
                {chatState.conversations.length > 0 && (
                  <>
                    <button
                      onClick={resetAllChats}
                      className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Borrar todo el historial"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={createNewConversation}
                      className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Nueva conversación"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

       {/* Mensajes */}
        <div className="flex-1 overflow-y-auto min-h-[600px] max-h-[calc(100vh-200px)] space-y-2 pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-2 p-4">
            {(!activeConversation || activeConversation.messages.length === 0) && (
              <div className="text-center text-gray-700 py-8">
                <p className="text-lg font-semibold mb-2">
                  ¡Bienvenido al Asistente Virtual para profesores!
                </p>
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() =>
                        handleQuickQuestion("¿Cuales son los próximos seminarios que se realizarán en este centro?")
                      }
                      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <h3 className="font-medium mb-1">Seminarios</h3>
                      <p className="text-xs text-gray-500">Localiza los próximos seminarios en este centro</p>
                    </button>

                    <button
                      onClick={() =>
                        handleQuickQuestion("¿Cuál es la nota media de cada asignatura?")
                      }
                      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <h3 className="font-medium mb-1">Notas</h3>
                      <p className="text-xs text-gray-500">
                        extrae las notas medias por asignatura
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleQuickQuestion("Realiza un horario de los exámenes con la clase en la que se realizará cada examen")
                      }
                      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <h3 className="font-medium mb-1">Exámenes</h3>
                      <p className="text-xs text-gray-500">
                        Extrae el horario y en que clase se celebrarán los exámenes
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <Image
                      src="/images/avatars/bot-avatar.png"
                      alt="Bot Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[75%] py-2 px-3 rounded-lg text-sm shadow-sm ${message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-800'
                    }`}
                >
                  {(message.content || '').split('\n').map((line, i) => (
                    <p
                      key={i}
                      className="whitespace-pre-wrap mb-1 last:mb-0"
                      dangerouslySetInnerHTML={{ __html: formatText(line) }}
                    />
                  ))}
                </div>
                {message.role === 'user' && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-blue-100">
                    <div className="w-full h-full flex items-center justify-center text-blue-500 font-semibold text-sm">
                      U
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image
                    src="/images/avatars/bot-avatar.png"
                    alt="Bot Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-white py-2 px-3 rounded-lg text-sm shadow-sm">
                  <LoadingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Escribe tu pregunta"
                className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
                disabled={isLoading}
                autoFocus={false}
                ref={inputRef}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 text-sm rounded-md bg-black text-white border border-transparent hover:bg-white hover:text-black hover:border-black transition-all duration-200 disabled:opacity-50 w-full md:w-auto"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>



    </>
  );
}

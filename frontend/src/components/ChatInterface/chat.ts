export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

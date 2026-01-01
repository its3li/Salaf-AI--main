export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachment?: Attachment;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
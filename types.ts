export interface AiMetrics {
  persuasion: number;
  agreement: number;
  engagement: number;
  agitation: number;
  deltas?: {
    persuasion?: number;
    agreement?: number;
    engagement?: number;
    agitation?: number;
  };
  changeReason?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  insight?: string; // AI's insight on its own message
  analysis?: { // Analysis of user's message
    reason: string;
    persuasion: number;
    agreement: number;
    engagement: number;
    agitation: number;
  };
  metrics: AiMetrics; // The state of metrics *after* this message
}

export interface AiPersona {
  name: string;
  role: string;
  keyTraits: string[];
  motivations: string;
  dos?: string[];
  donts?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  userObjective: string;
  aiPersona: AiPersona;
  initialAiMessage: string;
  initialMetrics: AiMetrics;
  suggestionsEnabled: boolean;
  trainerMode: boolean;
}

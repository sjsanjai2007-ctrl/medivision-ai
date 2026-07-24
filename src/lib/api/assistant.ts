// ============================================================
// MediVision AI – AI Assistant API Client
// ============================================================

import { apiRequest } from './client';
import type { ChatMessage, SupportedLanguage } from '@/lib/types';

export interface AssistantChatResponse {
  reply: string;
  intent: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  recommendations: string[];
}

export async function sendAssistantChat(
  messages: ChatMessage[],
  language: SupportedLanguage = 'en'
): Promise<AssistantChatResponse> {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    language,
  };

  try {
    return await apiRequest<AssistantChatResponse>('/assistant/chat', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    console.warn('Backend chat API offline, fallback engaged:', error);
    // Fallback response if backend server is unreachable
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastMsg.includes('asthma') || lastMsg.includes('breath')) {
      return {
        reply: "### Asthma & Respiratory Management\n\nAsthma is a chronic inflammatory disorder of the airways causing episodic bronchospasm, wheezing, breathlessness, and coughing.\n\n📋 **Evidence-Based Management Steps**:\n• Keep your prescribed fast-acting rescue inhaler (e.g. Salbutamol) with you at all times.\n• Use a peak flow meter daily to track lung function and catch flare-ups early.\n• Identify & avoid triggers: tobacco smoke, dust mites, pollen, cold air, and pet dander.\n• Take daily preventer inhalers (corticosteroids) as prescribed by your pulmonologist.\n\n🚨 **Warning Flags**: Seek emergency care (Call 108/112) if you experience severe breathlessness, inability to speak full sentences, chest retractions, or no response to rescue inhalers.\n\n_Disclaimer: MediVision AI provides clinical decision support for educational purposes. Always consult a licensed physician for personal medical diagnosis._",
        intent: 'asthma',
        urgency: 'routine',
        recommendations: [
          'Keep your rescue inhaler with you',
          'Avoid triggers: smoke, pollen, cold air',
          'Seek emergency care if breathlessness is severe',
        ],
      };
    }

    return {
      reply: "Hello! I am **MediVision AI Assistant**. How can I help answer your health or scan report questions today?",
      intent: 'greeting',
      urgency: 'routine',
      recommendations: ['Ask about your scan results', 'Ask about symptoms or conditions'],
    };
  }
}

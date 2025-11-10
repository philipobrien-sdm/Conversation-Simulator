import { GoogleGenAI, Type } from "@google/genai";
import { AiMetrics, ChatMessage, Scenario, AiPersona } from "../types";

// Fix: Per coding guidelines, initialize GoogleGenAI with a named apiKey object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Fix: Use a recommended model for complex text tasks.
const model = "gemini-2.5-pro";

const getPersonaBiography = (persona: AiPersona): string => {
    return `Your role is: ${persona.role}. Your key traits are: ${persona.keyTraits.join(', ')}. Your primary motivation is: ${persona.motivations}`;
};

// Schema for analyzing user message
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        changeReason: {
            type: Type.STRING,
            description: "A brief, 20-word-max explanation for why the metrics changed based on the user's last message."
        },
        persuasion: {
            type: Type.INTEGER,
            description: "An integer from 0-100 representing the user's current persuasion level."
        },
        agreement: {
            type: Type.INTEGER,
            description: "An integer from 0-100 representing the user's current agreement level."
        },
        engagement: {
            type: Type.INTEGER,
            description: "An integer from 0-100 representing the user's current engagement level."
        },
        agitation: {
            type: Type.INTEGER,
            description: "An integer from 0-100 representing the user's current agitation level."
        }
    },
    required: ["changeReason", "persuasion", "agreement", "engagement", "agitation"]
};

// Schema for AI's response and self-analysis
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "The AI's response to the user."
        },
        insight: {
            type: Type.STRING,
            description: "A brief, 20-word-max insight into the AI's own conversational strategy with its response."
        }
    },
    required: ["response", "insight"]
};

const trainerOptionsSchema = {
    type: Type.OBJECT,
    properties: {
        positive: { type: Type.STRING, description: "A response that is likely to advance the user's objective."},
        neutral: { type: Type.STRING, description: "A response that is passive or doesn't significantly alter the conversation's direction."},
        negative: { type: Type.STRING, description: "A response that is likely to harm the user's objective or worsen the situation."}
    },
    required: ["positive", "neutral", "negative"]
};

const scenarioSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, engaging title for the scenario." },
        description: { type: Type.STRING, description: "A description of the user's role and the situation." },
        userObjective: { type: Type.STRING, description: "The user's specific goal in the conversation." },
        aiPersonaName: { type: Type.STRING, description: "A plausible name for the AI character." },
        aiPersonaRole: { type: Type.STRING, description: "The AI character's job or role in the scenario." },
        aiPersonaKeyTraits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-4 key personality traits for the AI." },
        aiPersonaMotivations: { type: Type.STRING, description: "The core motivation or goal of the AI character in this conversation." },
        initialAiMessage: { type: Type.STRING, description: "The first thing the AI says to start the conversation." }
    },
    required: ["title", "description", "userObjective", "aiPersonaName", "aiPersonaRole", "aiPersonaKeyTraits", "aiPersonaMotivations", "initialAiMessage"]
};

const personaTipsSchema = {
    type: Type.OBJECT,
    properties: {
        dos: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 brief 'Do' tips for the user."
        },
        donts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 brief 'Don't' tips for the user."
        }
    },
    required: ["dos", "donts"]
};


// Builds the prompt history for the Gemini model
const buildHistory = (history: ChatMessage[], scenario: Scenario) => {
    const biography = getPersonaBiography(scenario.aiPersona);
    return [
        {
            role: "user",
            parts: [{ text: `SYSTEM: You are in a role-play scenario. Do not break character. Your name is ${scenario.aiPersona.name}. Your persona: ${biography}` }]
        },
        {
            role: "model",
            parts: [{ text: "Understood. I will stick to my character." }]
        },
        ...history.flatMap(msg => [
            { role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }
        ])
    ];
};


export const analyzeUserMessage = async (history: ChatMessage[], scenario: Scenario, lastUserMessage: string): Promise<AiMetrics> => {
    const previousMetrics = history.length > 0 ? history[history.length - 1].metrics : scenario.initialMetrics;
    const biography = getPersonaBiography(scenario.aiPersona);
    
    const contents = `
        Analyze the last user message in the context of this conversation.
        Your persona is: ${biography}
        The user's objective is: ${scenario.userObjective}
        The conversation history is:
        ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}

        The user's latest message is: "${lastUserMessage}"

        The PREVIOUS metrics were:
        - Persuasion: ${previousMetrics.persuasion}%
        - Agreement: ${previousMetrics.agreement}%
        - Engagement: ${previousMetrics.engagement}%
        - Agitation: ${previousMetrics.agitation}%

        Based on the user's last message, provide the NEW, updated values for these four metrics.
        Also, provide a brief "changeReason" explaining the metric changes.
        Return ONLY the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            // Fix: For a single-turn request with a prompt string, the string should be passed directly.
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });
        
        // Fix: Per coding guidelines, access the response text directly.
        const resultText = response.text.trim();
        const jsonResponse = JSON.parse(resultText);

        const newMetrics: AiMetrics = {
            persuasion: jsonResponse.persuasion,
            agreement: jsonResponse.agreement,
            engagement: jsonResponse.engagement,
            agitation: jsonResponse.agitation,
            changeReason: jsonResponse.changeReason,
            deltas: {
                persuasion: jsonResponse.persuasion - previousMetrics.persuasion,
                agreement: jsonResponse.agreement - previousMetrics.agreement,
                engagement: jsonResponse.engagement - previousMetrics.engagement,
                agitation: jsonResponse.agitation - previousMetrics.agitation,
            }
        };

        return newMetrics;
    } catch (error) {
        console.error("Error analyzing user message:", error);
        // Fallback to previous metrics if analysis fails
        return { ...previousMetrics, changeReason: "Analysis failed.", deltas: {} };
    }
};

export const getAiResponse = async (history: ChatMessage[], scenario: Scenario): Promise<{ text: string, insight: string }> => {
    const conversationHistory = buildHistory(history, scenario);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: conversationHistory,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        // Fix: Per coding guidelines, access the response text directly.
        const resultText = response.text.trim();
        const jsonResponse = JSON.parse(resultText);
        
        return { text: jsonResponse.response, insight: jsonResponse.insight };
    } catch (error) {
        console.error("Error getting AI response:", error);
        return { text: "Sorry, I encountered an error. Please try again.", insight: "Error in generation." };
    }
};


export const getSuggestions = async (history: ChatMessage[], scenario: Scenario): Promise<string[]> => {
    const biography = getPersonaBiography(scenario.aiPersona);
    const prompt = `
        You are a conversational coach. Based on the following scenario and conversation history, provide three brief, distinct suggestions for what the user could say next to better achieve their objective.
        
        Scenario:
        - User's Objective: ${scenario.userObjective}
        - AI's Persona: ${biography}

        Conversation History (last few messages):
        ${history.slice(-4).map(m => `${m.sender === 'user' ? 'USER' : 'AI'}: ${m.text}`).join('\n')}

        Provide three distinct, actionable suggestions for the user's next message. Each suggestion should be a single sentence.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });

        // Fix: Per coding guidelines, access the response text directly.
        const text = response.text;
        // Simple parsing logic, assuming suggestions are numbered or on new lines
        return text.split('\n').map(s => s.replace(/^[0-9]+\.\s*/, '').trim()).filter(Boolean);
    } catch (error) {
        console.error("Error getting suggestions:", error);
        return ["Sorry, couldn't generate suggestions right now."];
    }
};

export const getTrainerOptions = async (history: ChatMessage[], scenario: Scenario): Promise<{positive: string, neutral: string, negative: string}> => {
    const biography = getPersonaBiography(scenario.aiPersona);
    const prompt = `
        You are a conversational training AI. Your task is to generate three potential responses for the user in a role-play scenario.
        The user's objective is: ${scenario.userObjective}
        The AI persona they are talking to is: ${biography}
        The conversation history is:
        ${history.slice(-4).map(m => `${m.sender === 'user' ? 'USER' : 'AI'}: ${m.text}`).join('\n')}

        Based on the last message from the AI, generate three distinct responses for the USER.
        1. A 'positive' response that is assertive, strategic, and likely to advance the user's objective.
        2. A 'neutral' response that is passive, safe, or doesn't significantly change the conversation's direction.
        3. A 'negative' response that is counter-productive, aggressive, or likely to harm the user's chances of success.

        Return ONLY the JSON object with the three responses.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: trainerOptionsSchema
            }
        });

        const resultText = response.text.trim();
        return JSON.parse(resultText);
    } catch (error) {
        console.error("Error getting trainer options:", error);
        return {
            positive: "I understand your position, but my situation is...",
            neutral: "Okay, I see.",
            negative: "This is unacceptable!"
        };
    }
};

export const getScenarioSuggestions = async (prompt: string) => {
    const fullPrompt = `
        You are a creative assistant designing a role-play conversation scenario.
        Based on the user's idea, generate a complete and coherent scenario. All the fields must logically connect to create a believable situation.

        User's Idea: "${prompt}"

        Generate all the necessary fields for the scenario.
        Return ONLY the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scenarioSuggestionsSchema
            }
        });
        
        const resultText = response.text.trim();
        const jsonResponse = JSON.parse(resultText);

        return jsonResponse;

    } catch (error) {
        console.error("Error getting scenario suggestions:", error);
        // Return a default error object that matches the type
        return {
            title: "Error",
            description: "Could not generate suggestions. Please try again.",
            userObjective: "",
            aiPersonaName: "ErrorBot",
            aiPersonaRole: "Error Bot",
            aiPersonaKeyTraits: ["buggy"],
            aiPersonaMotivations: "An error occurred.",
            initialAiMessage: "Sorry, I couldn't generate a scenario.",
        };
    }
};

export const getPersonaTips = async (scenario: Scenario): Promise<{ dos: string[], donts: string[] }> => {
    const biography = getPersonaBiography(scenario.aiPersona);
    const prompt = `
        Based on the AI persona and the user's objective, generate a short list of "Do's" and "Don'ts" to help the user succeed.
        
        AI Persona: ${biography}
        User's Objective: ${scenario.userObjective}

        Provide 2-3 brief "Do" tips and 2-3 brief "Don't" tips.
        Return ONLY the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: personaTipsSchema
            }
        });
        const resultText = response.text.trim();
        return JSON.parse(resultText);
    } catch (error) {
        console.error("Error getting persona tips:", error);
        return {
            dos: ["Be clear and concise."],
            donts: ["Don't be overly aggressive."]
        };
    }
};

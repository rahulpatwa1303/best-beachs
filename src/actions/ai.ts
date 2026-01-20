"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/db"
import { beaches } from "@/db/schema"
import { eq } from "drizzle-orm"

const apiKey = process.env.GOOGLE_AI_API_KEY
if (!apiKey) {
  console.warn("WARNING: GOOGLE_AI_API_KEY is not set. AI features will not work.")
}

const genAI = new GoogleGenerativeAI(apiKey || "")
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

export async function getBeachChatResponse(messages: { role: "user" | "model", content: string }[], currentBeachSlug?: string) {
  try {
    // Fetch all beaches for context (simplified for now, in a real app we'd use RAG or a subset)
    const allBeaches = await db.select().from(beaches)
    
    let context = `You are "The Beach Scout", a helpful and enthusiastic AI concierge for BeachAtlas. 
    Your goal is to help users find their perfect beach. 
    You have access to the following beaches in our database:
    ${allBeaches.map((b: any) => `- ${b.name} in ${b.country} (${b.region}). Vibe: ${b.shortDescription}`).join("\n")}
    
    Rules:
    - Be concise, friendly, and use beach-related emojis. 
    - Use markdown **bolding** for beach names and key features.
    - If a user asks about a specific beach not in the list, tell them we're still exploring the world but recommend a similar one from our list.
    `

    if (currentBeachSlug) {
      const currentBeach = allBeaches.find((b: any) => b.slug === currentBeachSlug)
      if (currentBeach) {
        context += `\n\nThe user is currently looking at ${currentBeach.name}. Use this as context if they ask "here" or "this beach".`
      }
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: context }] },
        { role: "model", parts: [{ text: "Got it! I am ready to help users find their perfect beach as The Beach Scout. 🏖️" }] },
        ...messages.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))
      ]
    })

    const result = await chat.sendMessage(messages[messages.length - 1].content)
    return { content: result.response.text() }
  } catch (error) {
    console.error("AI Chat Error:", error)
    return { content: "Sorry, I'm having a little trouble connecting to the waves right now. 🌊 Try again in a moment!" }
  }
}

export async function getBeachVibeSummary(beachName: string, description: string, vibes: string[]) {
  try {
    const prompt = `As "The Beach Scout", write a very short, punchy, and enticing "Vibe Check" (max 2 sentences) for ${beachName}. 
    Description: ${description}
    Vibes: ${vibes.join(", ")}
    
    Rules:
    - Use markdown **bolding** for the most important keywords.
    - Do NOT use surrounding quotes.
    - Focus on why someone would LOVE this specific beach.
    - Use 1-2 emojis.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("AI Summary Error:", error)
    return null
  }
}

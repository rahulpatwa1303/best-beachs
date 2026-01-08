"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getBeachChatResponse } from "@/actions/ai"
import { useParams } from "next/navigation"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: "user" | "model"
  content: string
}

export function BeachScout() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hey there! I'm **The Beach Scout**. 🏖️ Looking for a specific vibe or need help picking a beach?" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await getBeachChatResponse([...messages, userMessage], slug)
      setMessages(prev => [...prev, { role: "model", content: response.content }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", content: "Oops, the tide is too high! I couldn't connect. 🌊" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <Card className="flex h-[500px] w-[350px] flex-col overflow-hidden border-slate-200 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:w-[400px] animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-rose-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">The Beach Scout</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold">AI Concierge</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex w-full",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed",
                  m.role === "user" 
                    ? "bg-rose-500 text-white rounded-tr-none" 
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-strong:text-rose-500 dark:prose-strong:text-rose-400"
                )}>
                  {m.role === "model" ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-100 dark:border-slate-700">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input 
                placeholder="Ask about a beach..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110",
          isOpen ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-rose-500 text-white"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>
    </div>
  )
}

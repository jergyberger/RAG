"use client";

import Image from "next/image";
import RagLogo from "./assets/myRAG.png";
import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: "" },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: newMessages }),
      headers: { "Content-Type": "application/json" },
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullMessage = "";

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullMessage += chunk;
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, content: fullMessage } : msg
        )
      );
    }

    setInput("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main>
      <a href="https://jergyberger.github.io/portfolio/index.html" className="back-button">
  ← Back to Portfolio
</a>

      <Image className="logo" src={RagLogo} width="200" alt="RAG Logo" priority />
      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "right" : "left"}`}
          >
            <div className={`bubble ${msg.role}`}>
              <strong>{msg.role === "user" ? "You" : "myRAG"}: </strong>
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          value={input}
          placeholder="Ask me something..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </main>
  );
}

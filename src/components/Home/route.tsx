"use client";

import React, { useState, useEffect, useRef } from "react";

type Message = {
  sender: "me" | "rag";
  text: string;
  source?: { url: string; title: string }[];
};

function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "rag", text: "👋 Welcome! Upload a file or enter a URL to begin." },
  ]);

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  /** ✅ Handle chat send */
  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "me", text: input }]);
    const userInput = input;
    setInput("");
    setThinking(true);

    try {
      const res = await fetch(
        `/api/retriver-data?input=${encodeURIComponent(userInput)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "rag",
          text: data.message || "⚠️ No response from API",
          source: data.data || [],
        },
      ]);
    } catch (error) {
      console.error("Error fetching chat:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "rag", text: "⚠️ Error while fetching response" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  /** ✅ Handle PDF upload */
  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf-url/using-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "me", text: `📤 Uploaded: ${file.name}` },
          { sender: "rag", text: "✅ Document processed and ready" },
        ]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "rag", text: "❌ File upload failed. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Handle URL upload */
  const handleUrlUpload = async () => {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/pdf-url/using-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "me", text: `📤 Uploaded: ${url}` },
          { sender: "rag", text: "✅ URL content processed and ready" },
        ]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "rag", text: "❌ URL upload failed. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-black text-white">
      {/* LEFT PANEL - Control Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-900 border-r border-gray-800 p-6 md:sticky top-0 h-auto md:h-screen flex-shrink-0 overflow-y-auto">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-3 border border-purple-500 animate-pulse">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Data Control</h2>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <label className="mb-3 font-medium text-sm text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Web URL Destination
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white placeholder-gray-500"
            />
            <button
              onClick={handleUrlUpload}
              disabled={!url || loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:bg-gray-800 disabled:text-gray-500 transition flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Upload
                </>
              ) : "Upload"}
            </button>
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className=" mb-3 font-medium text-sm text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Document Upload
          </label>
          <div className="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center bg-gray-800 hover:bg-gray-750 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-400">
                {file ? file.name : "Drag & drop or click to upload PDF"}
              </p>
            </div>
          </div>

          {file && (
            <button
              onClick={handleFileUpload}
              disabled={loading}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg transition disabled:bg-gray-800 disabled:text-gray-500 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Document
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Upload documents or URLs to enable AI assistance</span>
          </div>
        </div>
      </div>

      {/* RIGHT CHAT - Conversation Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-black to-gray-900">
        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            <h2 className="font-semibold text-white">RAG Assistant</h2>
          </div>
          <div className="text-xs text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Online
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-black to-gray-900">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-4 rounded-2xl shadow-lg ${
                  msg.sender === "me"
                    ? "bg-purple-600 text-white rounded-br-none border border-purple-500"
                    : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
                }`}
              >
                <div className="text-sm leading-relaxed">{msg.text}</div>

                {/* ✅ Show Sources */}
                {msg.source?.length ? (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2 font-medium">Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {msg.source.map((s, j) => (
                        <a
                          key={j}
                          href={s.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-900 hover:bg-gray-700 text-gray-300 py-1 px-2 rounded-md transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div
                  className={`text-xs mt-2 ${msg.sender === "me" ? "text-purple-300" : "text-gray-500"}`}
                >
                  {msg.sender === "me" ? "You" : "Assistant"}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking */}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-300 px-5 py-3 rounded-2xl border border-gray-700 flex items-center animate-pulse">
                <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Processing your request...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 bg-gray-800 p-1">
            <input
              type="text"
              placeholder="Enter your message here..."
              className="flex-1 border-0 rounded-xl py-3 px-4 bg-transparent text-white focus:outline-none placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-3 rounded-xl ml-2 ${
                input.trim()
                  ? "bg-purple-600 hover:bg-purple-500 animate-pulse"
                  : "bg-gray-700 cursor-not-allowed"
              } transition`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center">
            <svg className="w-4 h-4 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Press Enter to send message
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
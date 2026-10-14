// app/dashboard/page.js
"use client";

import { useState } from "react";

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const startInvestigation = async () => {
    setIsRunning(true);
    setLogs([]);
    setReport("");
    setError("");

    try {
      const response = await fetch("/api/agent-run", { method: "POST" });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            if (data.type === "log") setLogs((prev) => [...prev, data.message]);
            if (data.type === "report") setReport(data.report);
            if (data.type === "error") setError(data.message);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">System Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg">AI-Powered DevOps Investigation</p>
          </div>
          <button
            onClick={startInvestigation}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
              isRunning ? "bg-indigo-400 cursor-not-allowed animate-pulse" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {isRunning ? "Investigating..." : "Run System Diagnostics"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Live Terminal */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live Agent Activity
            </h2>
            <div className="bg-gray-900 rounded-xl p-5 h-96 overflow-y-auto shadow-inner border border-gray-800">
              {logs.length === 0 && !isRunning && (
                <p className="text-gray-500 font-mono text-sm">Waiting for task...</p>
              )}
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 font-mono text-sm mb-2 border-b border-gray-800 pb-2">
                  <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="text-indigo-400 font-mono text-sm animate-pulse mt-4">
                  Agent is thinking...
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Final Report */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Official Report</h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 shadow-sm">
                <p className="text-red-700 font-medium">Error: {error}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-8 h-96 overflow-y-auto shadow-sm border border-gray-200">
              {!report && !isRunning && !error && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p>No report generated yet.</p>
                </div>
              )}
              
              {report && (
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
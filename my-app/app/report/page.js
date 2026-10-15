"use client";

import { useState } from "react";

export default function ReportIssuePage() {
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReplyMessage(""); // Clear previous messages

    try {
      const res = await fetch("/api/agent-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber, description }),
      });
      const data = await res.json();

      if (data.success) {
        setReplyMessage(data.message); // This is the AI's personalized apology!
        setDescription(""); // Clear the text box after success
      } else {
        setReplyMessage("Error submitting report: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setReplyMessage("Network error. Please inform the front desk directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>Hotel Maintenance & Support</h1>
      <p style={{ color: "#555", marginBottom: "25px" }}>
        Experiencing an issue in your room? Let us know so our team can resolve it right away.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
            Room Number:
          </label>
          <input
            type="text"
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 304"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
            What is the issue?
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's happening (e.g. AC is blowing warm air, or the TV remote is broken)..."
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: loading ? "#9ca3af" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {loading ? "Notifying Maintenance Team..." : "Submit Report"}
        </button>
      </form>

      {/* This box appears when the AI replies */}
      {replyMessage && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "5px",
            color: "#166534",
            lineHeight: "1.5",
          }}
        >
          <strong>Message from the Front Desk:</strong>
          <p style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>{replyMessage}</p>
        </div>
      )}
    </div>
  );
}
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import { authenticateRequest } from "./_core/session";
import { buildFeedbackMessages } from "./feedback";

type StreamRequest = {
  studentName?: string;
  sessionTopic?: string;
  evidence?: string;
};

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function chatCompletionsUrl() {
  const base = ENV.llmBaseUrl;
  return `${base}/v1/chat/completions`;
}

export function registerFeedbackStream(app: Express) {
  app.post("/api/feedback/stream", async (req: Request, res: Response) => {
    const user = await authenticateRequest(req).catch(() => null);
    if (!user) {
      res.status(401).json({ error: "Authentication is required to generate feedback." });
      return;
    }
    if (user.role !== "teacher") {
      res.status(403).json({ error: "Only teacher users can generate feedback." });
      return;
    }

    const input = req.body as StreamRequest;
    const studentName = input.studentName?.trim();
    const sessionTopic = input.sessionTopic?.trim();
    const evidence = input.evidence?.trim();
    if (!studentName || !sessionTopic || !evidence || evidence.length > 20000) {
      res.status(400).json({ error: "Student, session topic, and up to 20,000 characters of evidence are required." });
      return;
    }

    if (!ENV.llmApiKey) {
      res.status(503).json({ error: "The feedback generation service is not configured." });
      return;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let finished = false;
    const aborter = new AbortController();
    res.on("close", () => {
      if (!finished) aborter.abort();
    });

    try {
      const upstream = await fetch(chatCompletionsUrl(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ENV.llmApiKey}`,
        },
        body: JSON.stringify({
          stream: true,
          max_tokens: 800,
          messages: buildFeedbackMessages({ studentName, sessionTopic, evidence }),
        }),
        signal: aborter.signal,
      });

      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text();
        sendEvent(res, "error", { error: "The feedback service could not complete this request.", detail });
        finished = true;
        res.end();
        return;
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const dataLine = rawEvent
            .split("\n")
            .find(line => line.startsWith("data:"));
          if (!dataLine) continue;
          const data = dataLine.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) sendEvent(res, "delta", { delta });
          } catch {
            // Ignore incomplete or provider-specific keepalive events.
          }
        }
      }

      finished = true;
      sendEvent(res, "done", { complete: true });
      res.end();
    } catch (error) {
      if (!aborter.signal.aborted) {
        sendEvent(res, "error", {
          error: error instanceof Error ? error.message : "The feedback stream stopped unexpectedly.",
        });
      }
      finished = true;
      res.end();
    }
  });
}

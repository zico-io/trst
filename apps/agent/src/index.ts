const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Agent running on http://localhost:${server.port}`);

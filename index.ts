import index from "./index.html";

Bun.serve({
  routes: {
    "/": index,
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3001,
});

console.log("🟢 PLA Calculator running at http://localhost:3001");

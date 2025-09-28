import { createRoot } from "react-dom/client";
import RealApp from "./RealApp";
import "./index.css";

// Disable hot reload completely
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("Hot reload disabled - refreshing page...");
    window.location.reload();
  });
}

console.log("🚀 DeSocialAI - Loading full application...");

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<RealApp />);
    console.log("✅ DeSocialAI application rendered successfully!");
  } catch (error) {
    console.error("❌ Error rendering DeSocialAI:", error);

    // Fallback error display
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: white;
        padding: 2rem;
      ">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">❌ DeSocialAI Error</h1>
          <p style="margin-bottom: 1rem;">${error.message}</p>
          <pre style="background: #000; color: #0f0; padding: 1rem; margin: 1rem; text-align: left; white-space: pre-wrap; font-size: 0.8rem;">${error.stack}</pre>
          <p style="margin-top: 1rem; opacity: 0.7;">Check console for more details.</p>
        </div>
      </div>
    `;
  }
} else {
  console.error("❌ Root element not found!");
}
import React, { useState } from "react";
import { useRecipes } from "../context/RecipeContext";
import { motion } from "framer-motion";

export default function AIRecipe() {
  const { addRecipe } = useRecipes();
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAISuggestion = async () => {
    if (!ingredient) return;
    setLoading(true);

    try {
      // @ts-expect-error: Vite exposes env variables
      const API_KEY = import.meta.env.VITE_GEMINI_KEY;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Give me a detailed South Indian recipe using ${ingredient}.
Return only JSON:
{
  "title": "Recipe Name",
  "instructions": "Step 1... Step 2... Step 3..."
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let title = "AI Recipe";
      let description = "No instructions found.";

      try {
        const json = JSON.parse(aiText.match(/\{[\s\S]*\}/)?.[0] || "{}");
        title = json.title || title;
        description = json.instructions || description;
      } catch {
        const lines = aiText.split("\n");
        title = lines[0] || title;
        description = lines.slice(1).join("\n") || description;
      }

      let imageUrl = `https://source.unsplash.com/400x300/?${ingredient},indian-food`;

      addRecipe(title, description, imageUrl);
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI suggestion failed. Check API key.");
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mb-8"
    >
      <h2 className="text-xl font-bold mb-3">🤖 AI Recipe Suggestion</h2>
      <input
        type="text"
        placeholder="Enter an ingredient..."
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />
      <button
        onClick={handleAISuggestion}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded"
      >
        {loading ? "✨ Generating..." : "Suggest Recipe with AI"}
      </button>
    </motion.div>
  );
}

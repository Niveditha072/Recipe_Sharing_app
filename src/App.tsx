import React, { useState } from "react";
import { useRecipes } from "./context/RecipeContext";
import AIRecipe from "./components/AIRecipe";

export default function App() {
  const { recipes, addRecipe, deleteRecipe, loading, error } = useRecipes();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleAdd = () => {
    if (!title || !description || !image) return;
    addRecipe(title, description, image);
    setTitle("");
    setDescription("");
    setImage("");
  };

  const handleKnowMore = async (recipe: any) => {
    if (!recipe.idMeal && !recipe.fromAPI) {
      setSelectedRecipe({
        strMeal: recipe.title,
        strMealThumb: recipe.image,
        strInstructions: recipe.description,
        strCategory: "Custom",
        strArea: "Manual Entry",
        strYoutube: "",
      });
      return;
    }

    setLoadingDetails(true);
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.id}`
      );
      const data = await res.json();
      setSelectedRecipe(data.meals[0]);
    } catch {
      alert("Failed to load recipe details");
    }
    setLoadingDetails(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-center text-purple-600 mb-6">
        🍲 Recipe Sharing App
      </h1>

      <AIRecipe />

      <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
        >
          Add Recipe
        </button>
      </div>

      {loading && (
        <p className="text-center text-blue-600 font-bold">
          Loading recipes...
        </p>
      )}
      {error && <p className="text-center text-red-500 font-bold">{error}</p>}

      <div className="max-w-3xl mx-auto space-y-4 overflow-x-hidden">
        {recipes.map((recipe) => (
          <div
  key={recipe.id}
  className="flex flex-col sm:flex-row bg-white rounded-lg shadow-md overflow-hidden transition-transform w-full hover:shadow-lg">
  <img
    src={recipe.image}
    alt={recipe.title}
    className="w-full sm:w-40 h-40 object-cover"
  />
  <div className="p-4 flex-1">
    <h2 className="text-xl font-bold break-words">{recipe.title}</h2>

    <p className="text-gray-600 break-words">
      {recipe.description.length > 100
        ? recipe.description.slice(0, 100) + "..."
        : recipe.description.slice(0, 50) + "..."}
    </p>

    <button
      onClick={() => handleKnowMore(recipe)}
      className="text-blue-500 underline text-sm mt-1"
    >
      {loadingDetails && selectedRecipe?.idMeal === recipe.id
        ? "Loading..."
        : "Know More"}
    </button>

    <button
      onClick={() => deleteRecipe(recipe.id)}
      className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded block"
    >
      Delete
    </button>
  </div>
</div>

        ))}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg relative max-h-[80vh] overflow-y-auto animate-zoomIn">
            <button
              className="absolute top-2 right-3 text-red-500 font-bold text-lg"
              onClick={() => setSelectedRecipe(null)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-3 break-words">
              {selectedRecipe.strMeal}
            </h2>
            <img
              src={selectedRecipe.strMealThumb}
              alt={selectedRecipe.strMeal}
              className="w-full h-56 object-cover rounded mb-3"
            />
            <p className="text-gray-700 mb-3">
              <strong>Category:</strong> {selectedRecipe.strCategory} |{" "}
              <strong>Area:</strong> {selectedRecipe.strArea}
            </p>
            <p className="text-gray-700 mb-3 whitespace-pre-line break-words">
              <strong>Instructions:</strong> {selectedRecipe.strInstructions}
            </p>
            {selectedRecipe.strYoutube && (
              <a
                href={selectedRecipe.strYoutube}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 underline"
              >
                📺 Watch on YouTube
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

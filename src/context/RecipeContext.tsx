import React, { createContext, useContext, useState, useEffect } from "react";

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  fromAPI: boolean;
}

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (title: string, description: string, image: string) => void;
  deleteRecipe: (id: number) => void;
  loading: boolean;
  error: string | null;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem("recipes");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch from API if no recipes exist
  useEffect(() => {
    if (recipes.length === 0) {
      setLoading(true);
      fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=chicken")
        .then((res) => res.json())
        .then((data) => {
          const apiRecipes = data.meals.map((item: any) => ({
            id: Number(item.idMeal),
            title: item.strMeal,
            description: item.strInstructions, // full description
            image: item.strMealThumb,
            fromAPI: true, // mark as API recipe
          }));
          setRecipes(apiRecipes);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load recipes");
          setLoading(false);
        });
    }
  }, []);

  // ✅ Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = (title: string, description: string, image: string) => {
    const newRecipe = {
      id: Date.now(),
      title,
      description,
      image,
      fromAPI: false, // mark as manual recipe
    };
    setRecipes((prev) => [...prev, newRecipe]);
  };

  const deleteRecipe = (id: number) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, deleteRecipe, loading, error }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error("useRecipes must be used within RecipeProvider");
  return context;
};

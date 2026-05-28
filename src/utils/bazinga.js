export const MAX_LUGGAGE_KG = 23;

export const ITEM_CATEGORIES = [
  "Clothing",
  "Electronics",
  "Toiletries",
  "Documents",
  "Footwear",
  "Food & Snacks",
  "Medical",
  "Other",
];

export function getTotalWeight(items) {
  return items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
}

export function getWeightStatus(items) {
  const total = getTotalWeight(items);
  const diff = MAX_LUGGAGE_KG - total;
  return {
    total: parseFloat(total.toFixed(2)),
    limit: MAX_LUGGAGE_KG,
    diff: parseFloat(Math.abs(diff).toFixed(2)),
    over: total > MAX_LUGGAGE_KG,
    percent: Math.min(100, Math.round((total / MAX_LUGGAGE_KG) * 100)),
  };
}

export function getOptimizationTips(items, over) {
  const tips = [];
  if (!over) {
    tips.push("✅ You are within your luggage limit. Great packing!");
    tips.push("💡 Consider leaving some room for souvenirs.");
    tips.push("🔒 Keep documents and valuables in your carry-on.");
  } else {
    const heaviest = [...items]
      .sort((a, b) => Number(b.weight) - Number(a.weight))
      .slice(0, 3);
    tips.push(`⚠️ You are over the limit. Consider removing heavy items.`);
    if (heaviest[0]) tips.push(`🏋️ Heaviest item: "${heaviest[0].name}" at ${heaviest[0].weight} kg`);
    tips.push("👗 Check if clothing can be reduced or worn in layers.");
    tips.push("🧴 Switch full-size toiletries to travel-size versions.");
  }
  return tips;
}

// some default demo items
export const DEMO_ITEMS_BY_TRIP = {
  1: [
    { id: "d1", name: "Swimsuit x2", category: "Clothing", weight: "0.3" },
    { id: "d2", name: "Sunscreen SPF50", category: "Toiletries", weight: "0.25" },
    { id: "d3", name: "Sunglasses", category: "Other", weight: "0.1" },
    { id: "d4", name: "Charger", category: "Electronics", weight: "0.2" },
    { id: "d5", name: "T-shirts x5", category: "Clothing", weight: "0.8" },
  ],
  2: [
    { id: "d6", name: "Hiking Boots", category: "Footwear", weight: "1.2" },
    { id: "d7", name: "Jacket", category: "Clothing", weight: "0.9" },
    { id: "d8", name: "Gloves", category: "Clothing", weight: "0.15" },
    { id: "d9", name: "Thermos", category: "Other", weight: "0.45" },
    { id: "d10", name: "Map + compass", category: "Other", weight: "0.1" },
  ],
};

export function emptyItem() {
  return { id: "", name: "", category: "", weight: "" };
}

export function validateItem(item) {
  const errors = {};
  if (!item.name.trim()) errors.name = "Item name is required.";
  if (!item.category) errors.category = "Category is required.";
  if (!item.weight && item.weight !== 0) {
    errors.weight = "Weight is required.";
  } else if (isNaN(Number(item.weight)) || Number(item.weight) <= 0) {
    errors.weight = "Weight must be a positive number (kg).";
  }
  return errors;
}
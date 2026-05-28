export function formatDate(d) {
  if (!d) return "—";

  const [y, m, day] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return `${parseInt(day)} ${months[parseInt(m) - 1]}, ${y}`;
}

export function badgeClass(cat) {
  const map = {
    Beach: "beach",
    Mountain: "mountain",
    City: "city",
    Adventure: "adventure",
    Cultural: "cultural",
    "Road Trip": "road",
    Other: "other",
  };

  return `badge badge-${map[cat] || "other"}`;
}
export interface SavedItinerary {
  id: string;
  location: string;
  created_at: string;
  data: Record<string, unknown>;
}

export async function saveItinerary(itinerary: Record<string, unknown>, token: string): Promise<string> {
  const res = await fetch("/itinerary-api/save_itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(itinerary),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).id as string;
}

export async function fetchMyItineraries(token: string): Promise<SavedItinerary[]> {
  const res = await fetch("/itinerary-api/my_itineraries", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).itineraries as SavedItinerary[];
}

export async function deleteItinerary(id: string, token: string): Promise<void> {
  const res = await fetch(`/itinerary-api/delete_itinerary/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

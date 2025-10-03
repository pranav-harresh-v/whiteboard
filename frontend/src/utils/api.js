const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const updateCanvas = async (id, elements) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${API_BASE_URL}/canvas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ elements }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "failed to update canvas");
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "failed to update canvas");
  }
};

import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

if (typeof window !== 'undefined') {
  console.log("🔌 UnReel API Connected to:", API_BASE_URL);
}

if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined') {
  console.warn("⚠️ API Base URL is missing! (NEXT_PUBLIC_API_URL). Falling back to localhost.");
}



async function getAuthHeaders(providedUser?: any) {
  const user = providedUser || auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function analyzeVideo(videoUrl: string, user?: any, lenses?: Record<string, boolean>) {
  try {
    const body: any = { 
      url: videoUrl,
      focusResource: true // Link-detective is enabled by default
    };
    if (lenses) {
      body.focusEducational = lenses.educational;
      body.focusShopping = lenses.shopping;
      body.focusLocation = lenses.location;
      body.focusFactCheck = lenses.factCheck;
      body.focusMusic = lenses.music;
    }

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: await getAuthHeaders(user),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to analyze video");
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
}

export async function listHistory(user?: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "GET",
      headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch history");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}

export async function chatAboutVideo(analysisId: string, message: string, user?: any, persona?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: await getAuthHeaders(user),
      body: JSON.stringify({
        analysisId: analysisId,
        message: message,
        persona: persona || null
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error chatting about video:", error);
    throw error;
  }
}

export async function translateTranscript(analysisId: string, targetLanguage: string, user?: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/${analysisId}/translate`, {
      method: "POST",
      headers: await getAuthHeaders(user),
      body: JSON.stringify({ target_language: targetLanguage }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to translate transcript");
    }

    return await response.json();
  } catch (error) {
    console.error("Error translating transcript:", error);
    throw error;
  }
}

export async function getAnalysis(analysisId: string, user?: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/${analysisId}`, {
      method: "GET",
      headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       throw new Error(errorData.detail || "Failed to fetch analysis");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
}

export async function getChatHistory(analysisId: string, user?: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${analysisId}`, {
      method: "GET",
      headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       throw new Error(errorData.detail || "Failed to fetch chat history");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
}

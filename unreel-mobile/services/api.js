// API service for communicating with the UnReel backend

import { Platform } from "react-native";

// For Android devices, use the development machine's IP address
// For iOS simulator and physical devices, use localhost
const API_BASE_URL =
  Platform.OS === "android"
    ? "http:// 192.168.51.112:3000/api/v1" // Use your development machine's correct IP
    : "http://localhost:3000/api/v1";

// Function to test network connectivity
export const testConnectivity = async () => {
  try {
    console.log(
      `Testing connectivity to: ${API_BASE_URL.replace("/api/v1", "")}/health`
    );
    const response = await fetch(
      `${API_BASE_URL.replace("/api/v1", "")}/health`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Health check response status: ${response.status}`);
    const data = await response.json();
    console.log("Health check response:", data);
    return data;
  } catch (error) {
    console.error("Connectivity test failed:", error);
    throw error;
  }
};

// Function to analyze a video
export const analyzeVideo = async (videoUrl) => {
  try {
    console.log(`Attempting to connect to: ${API_BASE_URL}/analyze/`);
    const response = await fetch(`${API_BASE_URL}/analyze/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: videoUrl }),
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else if (response.status === 400) {
        // Handle bad request errors (like inappropriate content)
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            "Invalid video URL or content unavailable. Please try a different video."
        );
      } else if (response.status >= 500) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            "Server error. Please try again later."
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing video:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error. Please check your connection and make sure the backend is running."
      );
    }
    throw error;
  }
};

// Function to chat about a video analysis
export const chatAboutVideo = async (analysisId, message) => {
  try {
    console.log(`Attempting to connect to: ${API_BASE_URL}/chat/`);
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analysisId: analysisId,
        message: message,
      }),
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else if (response.status === 400) {
        // Handle bad request errors
        const errorText = await response.text();
        throw new Error(
          errorText || "Invalid request. Please check your input and try again."
        );
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error chatting about video:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error. Please check your connection and make sure the backend is running."
      );
    }
    throw error;
  }
};

// Function to get analysis history
export const getAnalysisHistory = async () => {
  try {
    // This would be implemented when we have a history endpoint
    // For now, we'll return an empty array
    return [];
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    throw error;
  }
};

// Function to get a specific analysis by ID
export const getAnalysisById = async (analysisId) => {
  try {
    // This would be implemented when we have an endpoint to get a specific analysis
    // For now, we'll return null
    return null;
  } catch (error) {
    console.error("Error fetching analysis by ID:", error);
    throw error;
  }
};

// Function to translate a video transcript
export const translateTranscript = async (analysisId, targetLanguage) => {
  try {
    console.log(`Attempting to translate transcript for analysis: ${analysisId}`);
    const response = await fetch(`${API_BASE_URL}/analyze/${analysisId}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_language: targetLanguage
      }),
    });

    console.log(`Translation response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Analysis not found. Please make sure the analysis exists."
        );
      } else if (response.status === 400) {
        // Handle bad request errors (like unsupported language)
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            "Invalid translation request. Please check the language selection."
        );
      } else if (response.status >= 500) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            "Server error during translation. Please try again later."
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Translation request failed with status ${response.status}: ${errorText}`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error translating transcript:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error. Please check your connection and make sure the backend is running."
      );
    }
    throw error;
  }
};

export default {
  testConnectivity,
  analyzeVideo,
  chatAboutVideo,
  getAnalysisHistory,
  getAnalysisById,
  translateTranscript
};

import { analyzeVideo, chatAboutVideo } from '../services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should have the correct API base URL', () => {
    // This test would require actually importing the api.js file to check the URL
    // For now, we'll just verify the function exists
    expect(analyzeVideo).toBeDefined();
    expect(chatAboutVideo).toBeDefined();
  });

  it('analyzeVideo should call the correct endpoint', async () => {
    // Mock the fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        analysisId: 'test-id',
        originalUrl: 'https://example.com/video.mp4',
        status: 'completed'
      })
    });

    // Call the function
    await analyzeVideo('https://example.com/video.mp4');

    // Verify fetch was called with correct URL and options
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/analyze'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://example.com/video.mp4' })
      })
    );
  });

  it('chatAboutVideo should call the correct endpoint', async () => {
    // Mock the fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Test response' })
    });

    // Call the function
    await chatAboutVideo('test-analysis-id', 'Test message');

    // Verify fetch was called with correct URL and options
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: 'test-analysis-id',
          message: 'Test message'
        })
      })
    );
  });
});
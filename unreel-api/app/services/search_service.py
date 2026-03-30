import logging
import asyncio
import json
from typing import List, Dict, Any, Optional

import requests

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)


class SearchService:
    """
    RAG (Retrieval-Augmented Generation) service for UnReel.
    
    Uses Google Search (via Serper.dev API) to:
    1. Verify factual claims with real-time evidence
    2. Find actual product URLs for the Link-Detective
    3. Fetch current trending topics for Trend Analysis
    """

    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.base_url = "https://google.serper.dev/search"
        self.available = bool(self.api_key)
        if not self.available:
            logger.warning("SERPER_API_KEY not set. RAG features will use Gemini-only mode (no live search).")

    async def _search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Perform a single Google search query via Serper API.
        
        Args:
            query: The search query string
            num_results: Number of results to return
            
        Returns:
            List of search result dicts with 'title', 'link', 'snippet'
        """
        if not self.available:
            return []

        try:
            headers = {
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json"
            }
            payload = {
                "q": query,
                "num": num_results
            }

            response = await asyncio.to_thread(
                requests.post, self.base_url, headers=headers, json=payload, timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                organic = data.get("organic", [])
                results = []
                for item in organic[:num_results]:
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                    })
                return results
            else:
                logger.warning(f"Serper API returned status {response.status_code}: {response.text}")
                return []

        except Exception as e:
            logger.error(f"Search error: {e}")
            return []

    # ─── FACT-CHECK RAG ─────────────────────────────────────────────

    async def verify_claims(self, claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Take a list of claims from the initial AI pass and search for evidence.
        
        Args:
            claims: List of claim dicts from the Gemini first-pass 
                    (each has 'claim', 'verdict', 'confidence', 'explanation')
                    
        Returns:
            Enriched claim list with 'searchEvidence' field added
        """
        if not claims or not self.available:
            return claims or []

        enriched_claims = []
        for claim_obj in claims:
            claim_text = claim_obj.get("claim", "")
            if not claim_text:
                enriched_claims.append(claim_obj)
                continue

            # Search for evidence about this claim
            query = f"is it true that {claim_text}"
            results = await self._search(query, num_results=3)

            claim_obj["searchEvidence"] = results
            enriched_claims.append(claim_obj)

        return enriched_claims

    # ─── LINK-DETECTIVE RAG ─────────────────────────────────────────

    async def find_resource_urls(self, resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Take a list of enhanced resources from the AI and try to find actual URLs.
        
        Args:
            resources: List of resource dicts from the Gemini first-pass
                       (each has 'name', 'type', 'urlSuggestion', 'detectiveLogic')
                       
        Returns:
            Enriched resource list with 'resolvedUrl' and 'searchResults' added
        """
        if not resources or not self.available:
            return resources or []

        enriched_resources = []
        for resource in resources:
            search_query = resource.get("urlSuggestion") or resource.get("name", "")
            if not search_query:
                enriched_resources.append(resource)
                continue

            results = await self._search(search_query, num_results=3)

            # Pick the most relevant link as the "resolved" URL
            if results:
                resource["resolvedUrl"] = results[0].get("link")
                resource["searchResults"] = results
            else:
                resource["resolvedUrl"] = None
                resource["searchResults"] = []

            enriched_resources.append(resource)

        return enriched_resources

    # ─── SHOPPING RAG ───────────────────────────────────────────────

    async def find_product_urls(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Take a list of shopping items and try to find purchase links.
        
        Args:
            items: List of shopping item dicts from the Gemini first-pass
                   (each has 'name', 'description', 'potentialUrl')
                   
        Returns:
            Enriched items with 'resolvedUrl' and 'searchResults' added
        """
        if not items or not self.available:
            return items or []

        enriched_items = []
        for item in items:
            search_query = item.get("potentialUrl") or f"buy {item.get('name', '')}"
            if not search_query:
                enriched_items.append(item)
                continue

            results = await self._search(search_query, num_results=3)

            if results:
                item["resolvedUrl"] = results[0].get("link")
                item["searchResults"] = results
            else:
                item["resolvedUrl"] = None
                item["searchResults"] = []

            enriched_items.append(item)

        return enriched_items

    # ─── TREND ANALYSIS RAG ─────────────────────────────────────────

    async def get_trending_topics(self, topics: List[str]) -> Dict[str, Any]:
        """
        Search for current trending content related to the video's topics.
        
        Args:
            topics: List of key topics from the video analysis
            
        Returns:
            Dict with 'trendingData' containing search results for each topic
        """
        if not topics or not self.available:
            return {"trendingData": [], "available": False}

        trending_data = []
        # Search for trending content related to the top 3 topics
        for topic in topics[:3]:
            query = f"{topic} trending 2026 viral"
            results = await self._search(query, num_results=3)
            if results:
                trending_data.append({
                    "topic": topic,
                    "trendResults": results,
                    "isTrending": True
                })

        return {
            "trendingData": trending_data,
            "available": len(trending_data) > 0
        }

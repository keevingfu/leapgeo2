"""Citation Tracker Service - AI Platform Citation Detection

This service tracks brand citations across 8 major AI platforms:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Perplexity AI
- Google Gemini
- Microsoft Copilot
- Meta AI
- You.com
- Phind

Uses Firecrawl for web scraping and implements citation parsing algorithms.
"""

import re
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class PlatformConfig:
    """Configuration for an AI platform"""
    name: str
    base_url: str
    search_endpoint: str
    requires_auth: bool
    citation_patterns: List[str]  # Regex patterns to detect citations
    source_patterns: List[str]    # Patterns to extract source URLs


# Platform configurations
AI_PLATFORMS = {
    "chatgpt": PlatformConfig(
        name="ChatGPT",
        base_url="https://chat.openai.com",
        search_endpoint="/",
        requires_auth=True,
        citation_patterns=[
            r'\[(\d+)\]\s*(https?://[^\s\]]+)',  # [1] https://example.com
            r'Source:\s*(https?://[^\s]+)',       # Source: https://example.com
        ],
        source_patterns=[
            r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)',
        ]
    ),
    "claude": PlatformConfig(
        name="Claude",
        base_url="https://claude.ai",
        search_endpoint="/new",
        requires_auth=True,
        citation_patterns=[
            r'\[(\d+)\]\s*(https?://[^\s\]]+)',
            r'According to\s+([^,]+),?\s+(https?://[^\s]+)',
        ],
        source_patterns=[
            r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)',
        ]
    ),
    "perplexity": PlatformConfig(
        name="Perplexity",
        base_url="https://www.perplexity.ai",
        search_endpoint="/search",
        requires_auth=False,
        citation_patterns=[
            r'\[(\d+)\]\s*\[([^\]]+)\]\((https?://[^\)]+)\)',  # [1][Title](url)
            r'<sup>(\d+)</sup>\s*(https?://[^\s]+)',            # <sup>1</sup> url
        ],
        source_patterns=[
            r'\[([^\]]+)\]\((https?://[^\)]+)\)',
        ]
    ),
    "gemini": PlatformConfig(
        name="Google Gemini",
        base_url="https://gemini.google.com",
        search_endpoint="/app",
        requires_auth=True,
        citation_patterns=[
            r'\[(\d+)\]\s*(https?://[^\s\]]+)',
            r'Sources?:\s*(https?://[^\s]+)',
        ],
        source_patterns=[
            r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)',
        ]
    ),
    "copilot": PlatformConfig(
        name="Microsoft Copilot",
        base_url="https://copilot.microsoft.com",
        search_endpoint="/",
        requires_auth=False,
        citation_patterns=[
            r'\[(\d+)\]\s*:\s*(https?://[^\s\]]+)',
            r'\[(\d+)\]\((https?://[^\)]+)\)',
        ],
        source_patterns=[
            r'\[([^\]]+)\]\((https?://[^\)]+)\)',
        ]
    ),
    "meta_ai": PlatformConfig(
        name="Meta AI",
        base_url="https://www.meta.ai",
        search_endpoint="/",
        requires_auth=False,
        citation_patterns=[
            r'\[(\d+)\]\s*(https?://[^\s\]]+)',
        ],
        source_patterns=[
            r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)',
        ]
    ),
    "you": PlatformConfig(
        name="You.com",
        base_url="https://you.com",
        search_endpoint="/search",
        requires_auth=False,
        citation_patterns=[
            r'\[(\d+)\]\s*([^\[]+)',
            r'Source:\s*([^\n]+)',
        ],
        source_patterns=[
            r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)',
        ]
    ),
    "phind": PlatformConfig(
        name="Phind",
        base_url="https://www.phind.com",
        search_endpoint="/search",
        requires_auth=False,
        citation_patterns=[
            r'\[(\d+)\]\s*([^\[]+)',
            r'\[([^\]]+)\]\((https?://[^\)]+)\)',
        ],
        source_patterns=[
            r'\[([^\]]+)\]\((https?://[^\)]+)\)',
        ]
    ),
}


@dataclass
class CitationMatch:
    """Represents a detected citation"""
    platform: str
    prompt: str
    source: str
    position: int
    snippet: str
    url: Optional[str] = None


class CitationTrackerService:
    """Service for tracking brand citations across AI platforms"""

    def __init__(self):
        self.firecrawl_url = "http://localhost:3002/v0/scrape"
        self.firecrawl_api_key = "fs-test"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    async def scrape_with_firecrawl(
        self,
        url: str,
        wait_for: str = "networkidle"
    ) -> Optional[Dict]:
        """
        Scrape a URL using Firecrawl API

        Args:
            url: Target URL to scrape
            wait_for: Wait condition (networkidle, load, domcontentloaded)

        Returns:
            Scraped content dictionary or None if failed
        """
        try:
            response = await self.client.post(
                self.firecrawl_url,
                json={
                    "url": url,
                    "waitFor": wait_for,
                    "formats": ["markdown", "html"],
                },
                headers={
                    "Authorization": f"Bearer {self.firecrawl_api_key}",
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("data", {})
            else:
                logger.error(f"Firecrawl error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            logger.error(f"Failed to scrape {url}: {str(e)}")
            return None

    def parse_citations(
        self,
        content: str,
        platform_config: PlatformConfig,
        prompt: str
    ) -> List[CitationMatch]:
        """
        Parse citations from scraped content using platform-specific patterns

        Args:
            content: Scraped content (markdown or text)
            platform_config: Platform configuration with regex patterns
            prompt: Original search prompt

        Returns:
            List of detected citations
        """
        citations = []
        position = 1

        # Try each citation pattern
        for pattern in platform_config.citation_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)

            for match in matches:
                # Extract URL from the match
                url = None
                for group in match.groups():
                    if group and group.startswith("http"):
                        url = group
                        break

                # Extract snippet (context around the citation)
                start = max(0, match.start() - 100)
                end = min(len(content), match.end() + 100)
                snippet = content[start:end].strip()

                # Extract source name from URL or match
                source = url or match.group(0)
                if url:
                    # Clean source name from URL
                    domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
                    if domain_match:
                        source = domain_match.group(1)

                citations.append(CitationMatch(
                    platform=platform_config.name,
                    prompt=prompt,
                    source=source,
                    position=position,
                    snippet=snippet,
                    url=url,
                ))

                position += 1

        # Also try source patterns as fallback
        if not citations:
            for pattern in platform_config.source_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)

                for match in matches:
                    url = match.group(0)

                    # Extract snippet
                    start = max(0, match.start() - 100)
                    end = min(len(content), match.end() + 100)
                    snippet = content[start:end].strip()

                    # Extract domain as source
                    domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
                    source = domain_match.group(1) if domain_match else url

                    citations.append(CitationMatch(
                        platform=platform_config.name,
                        prompt=prompt,
                        source=source,
                        position=position,
                        snippet=snippet,
                        url=url,
                    ))

                    position += 1

        return citations

    async def scan_platform(
        self,
        platform_id: str,
        prompt: str,
        project_id: str
    ) -> List[CitationMatch]:
        """
        Scan a single AI platform for citations

        Args:
            platform_id: Platform identifier (e.g., 'chatgpt', 'perplexity')
            prompt: Search query/prompt
            project_id: Project identifier

        Returns:
            List of detected citations
        """
        if platform_id not in AI_PLATFORMS:
            logger.error(f"Unknown platform: {platform_id}")
            return []

        config = AI_PLATFORMS[platform_id]

        # Construct search URL (simplified - may need platform-specific logic)
        search_url = f"{config.base_url}{config.search_endpoint}?q={prompt}"

        logger.info(f"Scanning {config.name} for prompt: '{prompt}'")

        # Scrape the platform
        scraped_data = await self.scrape_with_firecrawl(search_url)

        if not scraped_data:
            logger.warning(f"Failed to scrape {config.name}")
            return []

        # Extract content (prefer markdown, fallback to HTML)
        content = scraped_data.get("markdown") or scraped_data.get("html") or ""

        if not content:
            logger.warning(f"No content scraped from {config.name}")
            return []

        # Parse citations
        citations = self.parse_citations(content, config, prompt)

        logger.info(f"Found {len(citations)} citations on {config.name}")

        return citations

    async def save_citations(
        self,
        citations: List[CitationMatch],
        project_id: str,
        db: AsyncSession
    ) -> int:
        """
        Save detected citations to database

        Args:
            citations: List of citation matches
            project_id: Project identifier
            db: Database session

        Returns:
            Number of citations saved
        """
        saved_count = 0

        for citation in citations:
            try:
                conn = await db.connection()
                await conn.execute(
                    text("""
                        INSERT INTO citations (
                            project_id, platform, prompt, source,
                            position, snippet, detected_at, created_at
                        )
                        VALUES (
                            :project_id, :platform, :prompt, :source,
                            :position, :snippet, :detected_at, :created_at
                        )
                    """),
                    {
                        "project_id": project_id,
                        "platform": citation.platform,
                        "prompt": citation.prompt,
                        "source": citation.source,
                        "position": citation.position,
                        "snippet": citation.snippet,
                        "detected_at": datetime.now(),
                        "created_at": datetime.now(),
                    }
                )
                saved_count += 1

            except Exception as e:
                logger.error(f"Failed to save citation: {str(e)}")

        await db.commit()

        return saved_count

    async def scan_all_platforms(
        self,
        prompt: str,
        project_id: str,
        db: AsyncSession,
        platforms: Optional[List[str]] = None
    ) -> Dict[str, any]:
        """
        Scan all AI platforms for a given prompt

        Args:
            prompt: Search query/prompt
            project_id: Project identifier
            db: Database session
            platforms: Optional list of platform IDs (defaults to all)

        Returns:
            Summary dictionary with scan results
        """
        if platforms is None:
            platforms = list(AI_PLATFORMS.keys())

        all_citations = []
        results_by_platform = {}

        for platform_id in platforms:
            try:
                citations = await self.scan_platform(platform_id, prompt, project_id)
                all_citations.extend(citations)
                results_by_platform[platform_id] = {
                    "platform": AI_PLATFORMS[platform_id].name,
                    "citations_found": len(citations),
                    "status": "success" if citations else "no_citations",
                }

            except Exception as e:
                logger.error(f"Error scanning {platform_id}: {str(e)}")
                results_by_platform[platform_id] = {
                    "platform": AI_PLATFORMS.get(platform_id, {}).name or platform_id,
                    "citations_found": 0,
                    "status": "error",
                    "error": str(e),
                }

        # Save all citations to database
        saved_count = await self.save_citations(all_citations, project_id, db)

        return {
            "prompt": prompt,
            "project_id": project_id,
            "total_citations": len(all_citations),
            "citations_saved": saved_count,
            "platforms_scanned": len(platforms),
            "results_by_platform": results_by_platform,
            "timestamp": datetime.now().isoformat(),
        }


# Singleton instance
_citation_tracker_service: Optional[CitationTrackerService] = None


async def get_citation_tracker_service() -> CitationTrackerService:
    """Get or create citation tracker service instance"""
    global _citation_tracker_service

    if _citation_tracker_service is None:
        _citation_tracker_service = CitationTrackerService()

    return _citation_tracker_service

# Self-Hosted RSS Feed Generator - Technical Research

> **Date**: December 2025
> **Status**: Research Complete
> **Goal**: Create a self-hosted RSS feed generator for football transfer rumors using Python + BeautifulSoup

---

## Executive Summary

The best football transfer rumor sources (TransferFeed, Fichajes, Transfermarkt) do not provide public RSS feeds. This document outlines a solution: a **self-hosted RSS feed generator** that scrapes these sources and outputs valid RSS XML, hosted for free using GitHub Actions and GitHub Pages.

### Why Build This?

| Problem | Solution |
|---------|----------|
| Best sources have no RSS | Scrape and generate our own |
| Third-party RSS generators cost money | Use free GitHub infrastructure |
| Need control over data quality | Custom filtering and deduplication |
| Want reliable, consistent feeds | Scheduled automation |

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GitHub Actions (Free Tier)                       │
│                     Scheduled: Every 6 hours                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│   │TransferFeed │   │  Fichajes   │   │Transfermarkt│               │
│   │  Scraper    │   │  Scraper    │   │  Scraper    │               │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘               │
│          │                 │                 │                       │
│          └─────────────────┼─────────────────┘                       │
│                            ▼                                         │
│                 ┌─────────────────────┐                              │
│                 │   Data Normalizer   │                              │
│                 │   & Deduplicator    │                              │
│                 └──────────┬──────────┘                              │
│                            │                                         │
│                            ▼                                         │
│                 ┌─────────────────────┐                              │
│                 │   RSS XML Generator │                              │
│                 │   (feedgen library) │                              │
│                 └──────────┬──────────┘                              │
│                            │                                         │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │      GitHub Pages (Free)      │
              │                              │
              │  /feeds/betis-rumors.xml     │
              │  /feeds/betis-all.xml        │
              │  /feeds/laliga-rumors.xml    │
              └──────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │     Consumers (Soylenti)      │
              │     RSS Readers              │
              │     Other Applications       │
              └──────────────────────────────┘
```

---

## 2. Technology Stack

### Chosen: Python + BeautifulSoup

| Component | Technology | Reason |
|-----------|------------|--------|
| **Language** | Python 3.11+ | Best scraping ecosystem, clean syntax |
| **HTTP Client** | `requests` / `httpx` | Simple, reliable, async support |
| **HTML Parser** | `BeautifulSoup4` | Industry standard, handles malformed HTML |
| **RSS Generator** | `feedgen` | Full RSS 2.0/Atom support, well-maintained |
| **Scheduler** | GitHub Actions | Free, reliable, no infrastructure |
| **Hosting** | GitHub Pages | Free static hosting |

### Why Python over JavaScript?

| Factor | Python | JavaScript |
|--------|--------|------------|
| Scraping libraries | ⭐⭐⭐⭐⭐ BeautifulSoup, Scrapy | ⭐⭐⭐ Cheerio, Puppeteer |
| RSS generation | ⭐⭐⭐⭐⭐ feedgen, rfeed | ⭐⭐⭐ rss, feed |
| Learning curve | ⭐⭐⭐⭐⭐ Very readable | ⭐⭐⭐⭐ Familiar to web devs |
| GitHub Actions | ⭐⭐⭐⭐⭐ Native support | ⭐⭐⭐⭐ Needs Node setup |
| Async support | ⭐⭐⭐⭐ asyncio/httpx | ⭐⭐⭐⭐⭐ Native |

**Verdict**: Python wins for scraping tasks due to mature ecosystem and cleaner code.

---

## 3. Target Sources

### Primary Sources (Transfer Rumors)

| Source | URL | Content Type | Update Frequency |
|--------|-----|--------------|------------------|
| **TransferFeed** | `transferfeed.com/es/clubes/real-betis/403` | Live rumors | Real-time |
| **Fichajes.net** | `fichajes.net/equipos/real-betis-balompie` | Rumors + news | Daily |
| **Fichajes.com** | `fichajes.com/equipo/real-betis-balompie/noticias` | Market news | Daily |
| **Transfermarkt** | `transfermarkt.es/real-betis-sevilla/geruechte/verein/150` | Verified rumors | Daily |

### Secondary Sources (General News)

| Source | URL | Content Type |
|--------|-----|--------------|
| **NewsNow** | `newsnow.co.uk/h/Sport/Football/La+Liga/Real+Betis` | Aggregated news |
| **OneFootball** | `onefootball.com/es/equipo/real-betis-691/transfers` | Transfers page |

---

## 4. Data Model

### Rumor Item Schema

```python
@dataclass
class RumorItem:
    # Required fields
    id: str                    # Unique identifier (hash of url + title)
    title: str                 # Headline
    url: str                   # Source article URL
    source: str                # Source name (e.g., "TransferFeed")
    published: datetime        # Publication date

    # Optional fields
    player_name: str | None    # Player involved
    current_club: str | None   # Player's current club
    category: str | None       # transfer_in, transfer_out, contract, loan
    summary: str | None        # Brief description

    # Metadata
    scraped_at: datetime       # When we scraped it
    language: str = "es"       # Content language
```

### RSS Output Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Real Betis Transfer Rumors</title>
    <link>https://github.com/user/betis-rss-feeds</link>
    <description>Aggregated transfer rumors for Real Betis from multiple sources</description>
    <language>es</language>
    <lastBuildDate>Sun, 15 Dec 2025 12:00:00 GMT</lastBuildDate>
    <atom:link href="https://user.github.io/betis-rss-feeds/feeds/betis-rumors.xml" rel="self" type="application/rss+xml"/>

    <item>
      <title>Betis interested in Dani Ceballos</title>
      <link>https://transferfeed.com/article/12345</link>
      <description>Real Betis reportedly preparing €12M bid for Real Madrid midfielder</description>
      <pubDate>Sun, 15 Dec 2025 10:30:00 GMT</pubDate>
      <guid isPermaLink="true">https://transferfeed.com/article/12345</guid>
      <source url="https://transferfeed.com">TransferFeed</source>
      <category>transfer_in</category>
    </item>

    <!-- More items... -->
  </channel>
</rss>
```

---

## 5. Implementation Details

### Project Structure

```
betis-rss-feeds/
├── .github/
│   └── workflows/
│       └── generate-feeds.yml    # GitHub Actions workflow
├── src/
│   ├── __init__.py
│   ├── main.py                   # Entry point
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── base.py               # Base scraper class
│   │   ├── transferfeed.py       # TransferFeed scraper
│   │   ├── fichajes.py           # Fichajes.net/com scraper
│   │   └── transfermarkt.py      # Transfermarkt scraper
│   ├── models/
│   │   ├── __init__.py
│   │   └── rumor.py              # RumorItem dataclass
│   ├── generators/
│   │   ├── __init__.py
│   │   └── rss.py                # RSS XML generator
│   └── utils/
│       ├── __init__.py
│       ├── deduplication.py      # Fuzzy matching deduplication
│       └── http.py               # HTTP client with retry logic
├── feeds/                        # Output directory (served by GitHub Pages)
│   └── .gitkeep
├── tests/
│   ├── __init__.py
│   ├── test_scrapers.py
│   └── test_generators.py
├── config.yaml                   # Configuration (clubs, sources, etc.)
├── requirements.txt
├── pyproject.toml
└── README.md
```

### Core Components

#### 1. Base Scraper Class

```python
# src/scrapers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
import httpx
from bs4 import BeautifulSoup

@dataclass
class RumorItem:
    id: str
    title: str
    url: str
    source: str
    published: datetime
    player_name: str | None = None
    current_club: str | None = None
    category: str | None = None
    summary: str | None = None
    scraped_at: datetime = field(default_factory=datetime.utcnow)
    language: str = "es"

class BaseScraper(ABC):
    """Base class for all scrapers"""

    def __init__(self, club: str, http_client: httpx.Client):
        self.club = club
        self.client = http_client
        self.source_name = self.__class__.__name__.replace("Scraper", "")

    @property
    @abstractmethod
    def url(self) -> str:
        """URL to scrape"""
        pass

    @abstractmethod
    def parse(self, soup: BeautifulSoup) -> list[RumorItem]:
        """Parse HTML and extract rumors"""
        pass

    def scrape(self) -> list[RumorItem]:
        """Fetch page and parse rumors"""
        response = self.client.get(self.url, follow_redirects=True)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        return self.parse(soup)
```

#### 2. TransferFeed Scraper Example

```python
# src/scrapers/transferfeed.py
from datetime import datetime
import hashlib
from bs4 import BeautifulSoup
from .base import BaseScraper, RumorItem

class TransferFeedScraper(BaseScraper):
    """Scraper for TransferFeed.com"""

    CLUB_IDS = {
        "real-betis": "403",
        "sevilla": "368",
        "barcelona": "131",
        # Add more clubs as needed
    }

    @property
    def url(self) -> str:
        club_id = self.CLUB_IDS.get(self.club, self.club)
        return f"https://www.transferfeed.com/es/clubes/{self.club}/{club_id}"

    def parse(self, soup: BeautifulSoup) -> list[RumorItem]:
        rumors = []

        # Find rumor articles (adjust selectors based on actual HTML structure)
        articles = soup.select("article.rumor-item, div.transfer-rumor")

        for article in articles:
            try:
                title_elem = article.select_one("h2, h3, .title")
                link_elem = article.select_one("a[href]")
                date_elem = article.select_one("time, .date, .published")
                player_elem = article.select_one(".player-name, .player")

                if not title_elem or not link_elem:
                    continue

                title = title_elem.get_text(strip=True)
                url = link_elem.get("href", "")

                # Make URL absolute if relative
                if url.startswith("/"):
                    url = f"https://www.transferfeed.com{url}"

                # Generate unique ID
                item_id = hashlib.md5(f"{url}{title}".encode()).hexdigest()[:12]

                # Parse date
                published = datetime.now(timezone.utc)  # Default to now
                if date_elem:
                    # Parse date string (implement date parsing logic)
                    pass

                # Extract player name if available
                player_name = None
                if player_elem:
                    player_name = player_elem.get_text(strip=True)

                rumors.append(RumorItem(
                    id=item_id,
                    title=title,
                    url=url,
                    source="TransferFeed",
                    published=published,
                    player_name=player_name,
                    category=self._detect_category(title),
                ))

            except Exception as e:
                print(f"Error parsing article: {e}")
                continue

        return rumors

    def _detect_category(self, title: str) -> str | None:
        """Detect transfer category from title keywords"""
        title_lower = title.lower()

        if any(kw in title_lower for kw in ["ficha", "llega", "incorpora", "interesa"]):
            return "transfer_in"
        elif any(kw in title_lower for kw in ["sale", "deja", "marcha", "traspaso"]):
            return "transfer_out"
        elif any(kw in title_lower for kw in ["renueva", "contrato", "extiende"]):
            return "contract"
        elif any(kw in title_lower for kw in ["cesión", "cedido", "préstamo"]):
            return "loan"

        return None
```

#### 3. RSS Generator

```python
# src/generators/rss.py
from datetime import datetime
from feedgen.feed import FeedGenerator
from ..models.rumor import RumorItem

class RSSGenerator:
    """Generate RSS feeds from rumor items"""

    def __init__(self, club: str, base_url: str):
        self.club = club
        self.base_url = base_url

    def generate(self, rumors: list[RumorItem], output_path: str) -> None:
        """Generate RSS XML file from rumors"""

        fg = FeedGenerator()
        fg.title(f"{self.club.title()} Transfer Rumors")
        fg.link(href=self.base_url, rel="alternate")
        fg.link(href=f"{self.base_url}/feeds/{self.club}-rumors.xml", rel="self")
        fg.description(f"Aggregated transfer rumors for {self.club.title()} from multiple sources")
        fg.language("es")
        fg.lastBuildDate(datetime.now(timezone.utc))

        # Add generator info
        fg.generator("betis-rss-feeds")

        # Add items
        for rumor in rumors:
            fe = fg.add_entry()
            fe.id(rumor.url)
            fe.title(rumor.title)
            fe.link(href=rumor.url)
            fe.published(rumor.published)
            fe.updated(rumor.scraped_at)
            fe.source(title=rumor.source, url=rumor.url)

            if rumor.summary:
                fe.description(rumor.summary)

            if rumor.category:
                fe.category(term=rumor.category)

            if rumor.player_name:
                fe.author(name=rumor.player_name)  # Using author for player name

        # Write to file
        fg.rss_file(output_path, pretty=True)
        print(f"Generated RSS feed: {output_path} ({len(rumors)} items)")
```

#### 4. Deduplication

```python
# src/utils/deduplication.py
from rapidfuzz import fuzz
from ..models.rumor import RumorItem

def deduplicate_rumors(rumors: list[RumorItem], threshold: int = 85) -> list[RumorItem]:
    """
    Remove duplicate rumors using fuzzy title matching.

    Args:
        rumors: List of rumor items
        threshold: Similarity threshold (0-100). Default 85%.

    Returns:
        Deduplicated list of rumors
    """
    if not rumors:
        return []

    unique_rumors = []

    for rumor in rumors:
        is_duplicate = False

        for existing in unique_rumors:
            # Check URL exact match first (fastest)
            if rumor.url == existing.url:
                is_duplicate = True
                break

            # Check fuzzy title match
            similarity = fuzz.ratio(rumor.title.lower(), existing.title.lower())
            if similarity >= threshold:
                is_duplicate = True
                # Keep the one with more info or newer date
                if rumor.published > existing.published:
                    unique_rumors.remove(existing)
                    unique_rumors.append(rumor)
                break

        if not is_duplicate:
            unique_rumors.append(rumor)

    return unique_rumors
```

#### 5. Main Entry Point

```python
# src/main.py
import httpx
from pathlib import Path
from .scrapers import TransferFeedScraper, FichajesScraper, TransfermarktScraper
from .generators.rss import RSSGenerator
from .utils.deduplication import deduplicate_rumors

def main():
    """Main entry point for RSS feed generation"""

    # Configuration
    club = "real-betis"
    output_dir = Path("feeds")
    base_url = "https://yourusername.github.io/betis-rss-feeds"

    output_dir.mkdir(exist_ok=True)

    # HTTP client with headers to avoid blocking
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; BetisRSSBot/1.0; +https://github.com/user/betis-rss-feeds)"
    }

    all_rumors = []

    with httpx.Client(headers=headers, timeout=30.0) as client:
        # Scrape each source
        scrapers = [
            TransferFeedScraper(club, client),
            FichajesScraper(club, client),
            # TransfermarktScraper(club, client),  # May need special handling
        ]

        for scraper in scrapers:
            try:
                print(f"Scraping {scraper.source_name}...")
                rumors = scraper.scrape()
                print(f"  Found {len(rumors)} rumors")
                all_rumors.extend(rumors)
            except Exception as e:
                print(f"  Error scraping {scraper.source_name}: {e}")

    # Deduplicate
    print(f"\nTotal rumors before deduplication: {len(all_rumors)}")
    unique_rumors = deduplicate_rumors(all_rumors)
    print(f"Total rumors after deduplication: {len(unique_rumors)}")

    # Sort by date (newest first)
    unique_rumors.sort(key=lambda r: r.published, reverse=True)

    # Generate RSS feed
    generator = RSSGenerator(club, base_url)
    generator.generate(unique_rumors, output_dir / f"{club}-rumors.xml")

    print("\nDone!")

if __name__ == "__main__":
    main()
```

---

## 6. GitHub Actions Workflow

```yaml
# .github/workflows/generate-feeds.yml
name: Generate RSS Feeds

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch:  # Allow manual trigger

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  generate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Generate RSS feeds
        run: |
          python -m src.main

      - name: Commit and push feeds
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add feeds/
          git diff --staged --quiet || git commit -m "Update RSS feeds [skip ci]"
          git push

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'feeds'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 7. Dependencies

### requirements.txt

```
# HTTP client
httpx>=0.25.0

# HTML parsing
beautifulsoup4>=4.12.0
lxml>=4.9.0  # Faster parser for BeautifulSoup

# RSS generation
feedgen>=1.0.0

# Fuzzy matching for deduplication
rapidfuzz>=3.5.0

# Date parsing
python-dateutil>=2.8.0

# Configuration
pyyaml>=6.0

# Testing
pytest>=7.4.0
pytest-httpx>=0.28.0  # For mocking HTTP requests
```

---

## 8. Configuration

### config.yaml

```yaml
# Club configurations
clubs:
  real-betis:
    name: "Real Betis"
    sources:
      - transferfeed
      - fichajes
      - transfermarkt
    language: es

  # Can add more clubs
  sevilla:
    name: "Sevilla FC"
    sources:
      - transferfeed
      - fichajes
    language: es

# Source configurations
sources:
  transferfeed:
    enabled: true
    base_url: "https://www.transferfeed.com"
    rate_limit: 2  # seconds between requests

  fichajes:
    enabled: true
    base_url: "https://www.fichajes.net"
    rate_limit: 2

  transfermarkt:
    enabled: true
    base_url: "https://www.transfermarkt.es"
    rate_limit: 3  # Be more conservative with Transfermarkt

# Output configuration
output:
  directory: "feeds"
  format: "rss"  # or "atom"
  max_items: 50  # Maximum items per feed

# Deduplication
deduplication:
  enabled: true
  threshold: 85  # Fuzzy match threshold (0-100)
```

---

## 9. Open Source Considerations

### Potential Project Name Ideas

- `football-rss-feeds` - Generic name
- `transfer-rumors-rss` - Descriptive
- `futbol-feeds` - Spanish flair
- `laliga-rss` - League-specific

### Features for Open Source Version

1. **Multi-club support** - Configure any club via YAML
2. **Multi-league support** - La Liga, Premier League, Serie A, etc.
3. **Pluggable scrapers** - Easy to add new sources
4. **Customizable output** - RSS 2.0, Atom, JSON Feed
5. **Docker support** - Easy self-hosting
6. **Rate limiting** - Respectful scraping
7. **Caching** - Avoid redundant requests

### README Template

```markdown
# Football RSS Feeds

Self-hosted RSS feed generator for football transfer rumors.

## Features

- 📰 Aggregates rumors from multiple sources
- 🔄 Automatic updates via GitHub Actions
- 🆓 Free hosting via GitHub Pages
- 🎯 Deduplication using fuzzy matching
- ⚽ Multi-club and multi-league support

## Quick Start

1. Fork this repository
2. Edit `config.yaml` with your club(s)
3. Enable GitHub Pages
4. Your feeds will be available at `https://yourusername.github.io/football-rss-feeds/feeds/`

## Supported Sources

- TransferFeed
- Fichajes.net
- Fichajes.com
- Transfermarkt
- (More coming soon)

## Configuration

See [Configuration Guide](docs/configuration.md)

## Contributing

PRs welcome! See [Contributing Guide](CONTRIBUTING.md)

## License

MIT
```

---

## 10. Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| GitHub Actions | **Free** | 2,000 minutes/month free tier |
| GitHub Pages | **Free** | 1GB storage, 100GB bandwidth |
| Domain (optional) | ~$10/year | Custom domain if desired |
| **Total** | **$0** | Completely free! |

### Usage Estimates

- **Actions minutes**: ~2 min/run × 4 runs/day × 30 days = **240 min/month** (well under 2,000)
- **Storage**: ~100KB per feed × 10 feeds = **~1MB** (well under 1GB)
- **Bandwidth**: ~100KB × 1000 requests/day × 30 = **~3GB/month** (well under 100GB)

---

## 11. Next Steps

### Phase 1: Proof of Concept (2-3 hours)
- [ ] Create basic TransferFeed scraper
- [ ] Test locally with Real Betis
- [ ] Generate sample RSS output

### Phase 2: Full Implementation (4-6 hours)
- [ ] Add Fichajes scraper
- [ ] Add Transfermarkt scraper
- [ ] Implement deduplication
- [ ] Set up GitHub Actions workflow
- [ ] Configure GitHub Pages

### Phase 3: Polish & Open Source (2-3 hours)
- [ ] Add configuration system
- [ ] Write documentation
- [ ] Add tests
- [ ] Create separate repository
- [ ] Publish to GitHub

---

## 12. References

- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [feedgen Documentation](https://feedgen.kiesow.be/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [rapidfuzz Documentation](https://rapidfuzz.github.io/RapidFuzz/)

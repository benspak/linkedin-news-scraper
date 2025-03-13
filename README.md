# LinkedIn New Scraper

Opens a new tab and scrapes the titles and URLs for each trending news story that is currently trending.

Takes the historical news data and correlates it with the current stock market status.

Allows users to add and track stock prices over time.

What would be the best way to display this information over time?

Interactive Dashboard (Combination of Charts)
Why? Gives users the flexibility to explore multiple data points simultaneously.
How? Use a combination of:
Line chart for price trends.
Timeline for major news events.
Bar chart for stock performance over different timeframes.
Enhancements:
Filters for users to customize data (e.g., specific stocks, time periods, news categories).
Sentiment analysis indicator to predict possible stock movement.

How often to run each?
- every minute for paid users
- every 30 minutes for free users

// Symbol Lookup
https://finnhub.io/docs/api/symbol-search

// Symbol Tracking
https://finnhub.io/docs/api/stock-symbols

Current Market Status
https://finnhub.io/docs/api/market-status

1. Data Collection & Storage
News Scraper (Trending LinkedIn News)
Use Puppeteer or Cheerio in a Node.js backend to scrape LinkedIn trending news (titles + URLs).
Store historical news data in a MongoDB or PostgreSQL database.
Attach timestamps to track when each news article was trending.
Stock Market Data
Use Finnhub API to pull:
Live stock prices
Market trends
Historical stock data for correlation
Store stock data in MongoDB or PostgreSQL for historical analysis.

2. Data Correlation (News & Stock Movements)
Compare timestamps of news events with stock price movements.
Use Sentiment Analysis (NLP)
Use OpenAI API, sentiment package, or vaderSentiment for analyzing if the news is bullish or bearish.
Label news as Positive/Negative/Neutral.
Build a correlation model:
Example: "Tesla stock rose 3% after positive LinkedIn news."

3. Interactive Dashboard (Best Data Visualization)
📊 Dashboard Components
Line Chart 📈

Shows stock price trends over time.
X-axis: Date/Time
Y-axis: Stock Price
Timeline (Major News Events) 📰

Interactive news timeline overlaying stock price.
Users can hover over news events to see the title & sentiment.
Bar Chart for Stock Performance 📊

Compare stock performance across different timeframes (1D, 1W, 1M).
Sentiment Analysis Indicator 🔴🟡🟢

Gauge whether news had a positive/negative impact on a stock.
Filters & Customization

Select stocks
Choose time ranges
Filter by news category (Tech, Finance, etc.)

4. Tech Stack
Feature	Tech
Web Scraper	Puppeteer / Cheerio (Node.js)
Stock Market Data	Finnhub API
Sentiment Analysis	OpenAI API / Natural.js / VADER
Database	MongoDB / PostgreSQL
Backend	Express.js (Node.js)
Frontend	React + Chart.js + D3.js
Dashboard	React-based UI (e.g., Next.js, Tailwind CSS)

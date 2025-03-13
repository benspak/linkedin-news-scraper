// Required Dependencies
const puppeteer = require('puppeteer');
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const FINNHUB_API_KEY = "your_api_key_here";
const LINKEDIN_NEWS_URL = "https://www.linkedin.com/news/";

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/stock_news', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const NewsSchema = new mongoose.Schema({
    title: String,
    url: String,
    timestamp: Date
});

const StockSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    timestamp: Date
});

const News = mongoose.model('News', NewsSchema);
const Stock = mongoose.model('Stock', StockSchema);

// Scraper Function
async function scrapeLinkedInNews() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(LINKEDIN_NEWS_URL);

    const newsData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.news-card')).map(news => ({
            title: news.querySelector('.news-card__title')?.innerText.trim(),
            url: news.querySelector('a')?.href
        }));
    });

    await browser.close();
    return newsData;
}

// Fetch Stock Data
async function getStockData(symbol) {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        return { symbol, price: response.data.c, timestamp: new Date() };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
}

// API Routes
app.get('/scrape-news', async (req, res) => {
    const news = await scrapeLinkedInNews();
    await News.insertMany(news.map(n => ({ ...n, timestamp: new Date() })));
    res.json({ message: "News scraped and saved", news });
});

app.get('/stock/:symbol', async (req, res) => {
    const stockData = await getStockData(req.params.symbol);
    if (stockData) {
        await Stock.create(stockData);
        res.json(stockData);
    } else {
        res.status(500).json({ message: "Failed to fetch stock data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

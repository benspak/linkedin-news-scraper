// Dashboard load function to retrieve stored data and display in Bootstrap cards
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('newsData', function(data) {
        const newsContainer = document.getElementById('news-container');
        if (data.newsData && data.newsData.length > 0) {
            data.newsData.forEach(item => {
                const cardHtml = `
                    <div class="card" style="width: 18rem; margin: 10px;">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text"><a href="${item.url}" target="_blank">${item.url}</a></p>
                            <p class="card-text">Date: ${item.date}</p>
                        </div>
                    </div>
                `;
                newsContainer.innerHTML += cardHtml;
            });
        } else {
            newsContainer.innerHTML = '<p>No news data available. Go scrape, first.</p>';
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension successfully installed!');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapingCompleted") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    alert("Scraping completed! Data has been saved locally. You can export it to CSV whenever you're ready.");
                }
            });
        }
});

    }
});

// SCRAPE
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startScraping") {
        chrome.tabs.create({ url: "https://www.linkedin.com/feed/", active: true }, function(newTab) {
            chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
                if (tabId === newTab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(onTabUpdate);
                    chrome.scripting.executeScript({
                        target: {tabId: newTab.id},
                        function: pageScript
                    });
                }
            });
        });
        sendResponse({status: "Scraping started"});
    }
    return true;
});

// SHOW DASHBOARD
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showDashboard") {
        chrome.tabs.create({url: 'dashboard.html'});
        sendResponse({status: "Showing Dashboard"});
    }
    return true;
});

// EXPORT DATA FUNCTION
function exportToCSV(data) {
    if (!data || data.length === 0) {
        console.error("No data to export.");
        return;
    }

    const csvData = [];
    data.forEach(item => {
        const date = item.date;
        const title = `"${item.title.replace(/"/g, '""')}"`;
        const url = `"${item.url.replace(/"/g, '""')}"`;
        csvData.push(`${date},${title},${url}`);
    });

    const headers = ['date', 'title', 'url'];
    csvData.unshift(headers.join(','));

    const csvString = csvData.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const reader = new FileReader();

    reader.onload = function(event) {
        chrome.downloads.download({
            url: event.target.result,
            filename: 'news_data.csv',
            saveAs: true
        });
    };
    reader.readAsDataURL(blob);
}

// DOWNLOAD STORED DATA
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "exportData") {
        chrome.storage.local.get({ 'newsData': [] }, function(result) {
            exportToCSV(result.newsData);
        });
        sendResponse({status: "Downloading stored data"});
    }
    return true;
});

function pageScript() {
    function mainContentScript() {
        clickShowMoreButton(() => {
            setTimeout(getTitleAndURI, 2000);
        });
    }

    function clickShowMoreButton(callback) {
        setTimeout(() => {
            const button = document.querySelector('button[aria-label="Show more"]');
            if (button) {
                button.click();
                console.log("Clicked 'Show more' button.");
                setTimeout(callback, 2000); // Wait for content to load before proceeding
            } else {
                console.log("Show more button not found, proceeding with scraping.");
                callback();
            }
        }, 3000); // Wait 3 seconds before looking for the button
    }

    function getTitleAndURI() {
        const storyLineArray = document.querySelectorAll('.news-module__storyline');
        const newData = [];
        const currentDate = new Date().toISOString().split('T')[0];

        storyLineArray.forEach(element => {
            let headlineElement = element.querySelector('.news-module__headline');
            let title = headlineElement ? headlineElement.innerText.replace(/,/g, '') : 'No title';
            let url = '';
            const linkElement = element.querySelector('a');
            if (linkElement) {
                url = linkElement.href;
            }
            newData.push({ title: title, url: url, date: currentDate });
        });

        chrome.storage.local.get({ newsData: [] }, (result) => {
            const existingData = result.newsData;
            const updatedData = [...existingData];

            newData.forEach(item => {
                if (!existingData.some(entry => entry.title === item.title && entry.url === item.url)) {
                    updatedData.push(item);
                }
            });

            chrome.storage.local.set({ newsData: updatedData }, () => {
                console.log("Data updated and stored locally");

                chrome.runtime.sendMessage({
                    action: "showNotification",
                    title: "Data Scraped",
                    message: "New unique data has been successfully scraped and added to local storage."
                });


                // Show alert to the user
                chrome.runtime.sendMessage({ action: "scrapingCompleted" });
            });
        });
    }

    mainContentScript();
}

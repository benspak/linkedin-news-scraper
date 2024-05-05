chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension successfully installed!');
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
    return true; // Keeps the messaging channel open
});

// SHOW DASHBOARD
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showDashboard") {
        // Open the dashboard in a new tab
        chrome.tabs.create({url: 'dashboard.html'});
        sendResponse({status: "Showing Dashboard"});
    }
    return true; // Keeps the messaging channel open
});

function pageScript() {
    function mainContentScript() {
        clickShowMoreButton();
        setTimeout(getTitleAndURI, 2000);
    }

    function clickShowMoreButton() {
        const buttons = document.querySelectorAll('[aria-label="Show more"]');
        if (buttons.length > 0) {
            buttons[0].click();
        } else {
            console.log("Show more button not found.");
        }
    }

    function getTitleAndURI() {
        const storyLineArray = document.querySelectorAll('.news-module__storyline');
        const newData = [];
        const currentDate = new Date().toISOString().split('T')[0];  // Gets the current date in YYYY-MM-DD format

        storyLineArray.forEach(element => {
            let headlineElement = element.querySelector('.news-module__headline'); // Target the correct element for title
            let title = headlineElement ? headlineElement.innerText.replace(/,/g, '') : 'No title'; // Remove commas to maintain integrity, fallback to 'No title' if not found
            let url = '';
            const linkElement = element.querySelector('a');
            if (linkElement) {
                url = linkElement.href;
            }
            newData.push({title: title, url: url, date: currentDate});
        });

        chrome.storage.local.get({newsData: []}, (result) => {
            const existingData = result.newsData;
            const updatedData = [...existingData];

            newData.forEach(item => {
                // Check if the item is already in the storage
                if (!existingData.some(entry => entry.title === item.title && entry.url === item.url)) {
                    updatedData.push(item);  // Add only unique items
                }
            });

            chrome.storage.local.set({newsData: updatedData}, () => {
                console.log("Data updated and stored locally");
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.png',
                    title: 'Data Scraped',
                    message: 'New unique data has been successfully scraped and added to the local storage.'
                });
            });
        });
    }

    mainContentScript();

}

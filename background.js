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
        const data = [];
        const currentDate = new Date().toISOString().split('T')[0];  // Gets the current date in YYYY-MM-DD format

        storyLineArray.forEach(element => {
            let title = element.innerText.replace(/,/g, '');  // Remove commas to maintain integrity
            let url = '';
            const linkElement = element.querySelector('a');
            if (linkElement) {
                url = linkElement.href;
            }
            data.push({title: title, url: url, date: currentDate});
        });

        chrome.storage.local.set({newsData: data}, () => {
            console.log("Data stored locally");
        });
    }
    mainContentScript();
}

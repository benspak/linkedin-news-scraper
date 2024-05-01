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
        /*
        chrome.action.onClicked.addListener(() => {
            chrome.tabs.create({url: 'dashboard.html'});
        });
        */
        sendResponse({status: "Showing Dashboard"});
    }
    return true; // Keeps the messaging channel open
});

function testScript() {
    console.log("Test script executed");
    window.alert("Test Dash");
}

function pageScript() {
    console.log("Page script executed");
    // Placeholder for scraping functionality
    // Additional functions like clickShowMoreButton, getTitleAndURI, downloadCSV would be added here
        // Main function to handle scraping, should be injected into the LinkedIn page
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
    const csvRows = ["Title,URL,Date"];  // Added Date column in the header

    const currentDate = new Date().toISOString().split('T')[0];  // Gets the current date in YYYY-MM-DD format

    storyLineArray.forEach(element => {
        let title = element.innerText.replace(/,/g, '');  // Remove commas to maintain CSV integrity
        let url = '';
        const linkElement = element.querySelector('a');
        if (linkElement) {
            url = linkElement.href;
        } else {
            console.log("No URL found in element", element);
        }
        // Append the current date to each row
        csvRows.push(`"${title}",${url},${currentDate}`);
    });

    downloadCSV(csvRows.join('\n'));
}


    function downloadCSV(csvString) {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "news_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Function possibly called from the popup for direct scraping without opening a new tab
    function startUp() {
        // Could log a message or handle a direct scrape if the current tab is LinkedIn
        console.log('Direct scrape function called, ensure current tab is appropriate for scraping.');
    }
    mainContentScript();
}

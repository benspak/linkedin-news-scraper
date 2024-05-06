document.getElementById('scrapeButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "startScraping"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
        } else {
            console.log('Response:', response.status);
        }
    });
});

document.getElementById('showDashboardButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "showDashboard"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
        } else {
            console.log('Response:', response.status);
        }
    });
});

document.getElementById('exportDataButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "exportData"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
        } else {
            console.log('Response:', response.status);
        }
    });
});

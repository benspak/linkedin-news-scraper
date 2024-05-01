document.getElementById('scrapeButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "startScraping"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
        } else {
            console.log('Response:', response.status);
        }
    });
});

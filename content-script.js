function addGitHubButton(runButton) {
    const button = document.createElement('button');
    button.textContent = 'Add to GitHub';
    button.setAttribute('type', 'button');
    button.style.marginRight = '12px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.padding = '8px 20px';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
        console.log('Add to GitHub button clicked');
    });
    runButton.parentElement.insertBefore(button, runButton);
}


function waitForElementById(id, callback) {
    const targetElement = document.getElementById(id);
    if (targetElement) {
        callback(targetElement);
        return;
    }
    
    const observer = new MutationObserver((_, observer) => {
        const element = document.getElementById(id);
        if (element) {
            observer.disconnect();
            callback(element);
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

waitForElementById('run-button', (runButton) => {
    addGitHubButton(runButton);
});

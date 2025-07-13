
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
    const pathName = 'README.md';
    const dataToAdd = {
        owner: config.github.username,
        repo: config.github.repo_name,
        path: 'PATH',
        message: 'my commit message',
        committer: {
            name: config.github.committer_name,
            email: config.github.committer_email
        },
        content: btoa('test commit'),
    }

    fetch(`https://api.github.com/repos/${config.github.username}/${config.github.repo_name}/contents/${pathName}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.github.token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify(dataToAdd)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
});
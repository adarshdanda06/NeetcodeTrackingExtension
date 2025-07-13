function addGitHubButtonToDOM(runButton) {
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
    runButton.parentElement.insertBefore(button, runButton);
    return button;
}


async function waitForElement(getElement, identifier) {
    const targetElement = document[getElement](identifier);
    if (targetElement) {
        return targetElement;
    }

    return new Promise((resolve) => {
        const observer = new MutationObserver((_, observer) => {
            const element = document[getElement](identifier);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function getDate() {
    const date = new Date();
    return date.toISOString().split('T')[0];
}

function getTitle() {
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 8; // Length of random string
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}

function addToGitHub() {
    const date = getDate();
    const title = getTitle();
    const pathName = `${date}/${title}.txt`;
    const dataToAdd = {
        owner: config.github.username,
        repo: config.github.repo_name,
        path: 'PATH',
        message: `Completed ${title} on ${date}`,
        committer: {
            name: config.github.committer_name,
            email: config.github.committer_email
        },
        content: btoa('test commit') // need to add the content of the user text here
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
}

async function main() {
    try {
        const runButton = await waitForElement('getElementById', 'run-button');
        const button = addGitHubButtonToDOM(runButton);
        button.addEventListener('click', addToGitHub);
    } catch (error) {
        console.error('Error in main function:', error);
    }
};

main();
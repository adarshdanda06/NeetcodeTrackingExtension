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

function showToast(message, color, duration = 3000) {
    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
      .toast {
        position: fixed;
        top: 24px;
        right: 24px;
        background-color: ${color};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: sans-serif;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateY(-20px);
        z-index: 9999;
      }
    
      .toast.show {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
    `;
      document.head.appendChild(style);
    }
  
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.backgroundColor = color;
    document.body.appendChild(toast);
  
    void toast.offsetHeight;
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
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

async function waitForAllElements(selector, identifier) {
    const elements = document[selector](identifier);
    if (elements.length > 0) {
        return Array.from(elements);
    }

    return new Promise((resolve) => {
        const observer = new MutationObserver((_, observer) => {
            const elements = document[selector](identifier);
            if (elements.length > 0) {
                observer.disconnect();
                resolve(Array.from(elements));
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

async function getTitle() {
    const title = await waitForElement('querySelector', 'h1');
    const result = title.textContent.replaceAll(' ', '_');
    return result;
}

async function getCode() {
    const codeLines = await waitForAllElements('getElementsByClassName', 'view-line');
    const sortedLines = codeLines.sort((a, b) => {
        const topA = parseInt(a.style.top, 10) || 0;
        const topB = parseInt(b.style.top, 10) || 0;
        return topA - topB;
    });
    const codeText = sortedLines.map(line => line.textContent).join('\n');
    return codeText;
}

async function findExistingFile(dataToFind, pathName) {
    const response = await fetch(
        `https://api.github.com/repos/${config.github.username}/${config.github.repo_name}/contents/${pathName}`, dataToFind
    );
    const data = await response.json();
    return {
        "response": data,
        "status": response.status
    };
}

async function uploadToGitHub(pathName, dataToAdd) {
    const response = await fetch(
        `https://api.github.com/repos/${config.github.username}/${config.github.repo_name}/contents/${pathName}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${config.github.token}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(dataToAdd)
        }
    );
    const data = await response.json();
    const status = response.status;
    return {
        "response": data,
        "status": status
    };
}


async function addToGitHub() {
    try {
        const code = await getCode();
        const date = getDate();
        const title = await getTitle();
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
            content: btoa(code)
        }
        const dataToFind = {
            owner: config.github.username,
            repo: config.github.repo_name,
            path: 'PATH',
            headers: {
                'Authorization': `Bearer ${config.github.token}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }   
        const existingFile = await findExistingFile(dataToFind, pathName);
        if (existingFile.status === 200) {
            dataToAdd.sha = existingFile.response.sha;
            const data = await uploadToGitHub(pathName, dataToAdd);
            return {
                "response": data,
                "status": data.status,
                "updated": true
            }
        } else {
            const data = await uploadToGitHub(pathName, dataToAdd);
            return {
                "response": data,
                "status": data.status,
                "message": "File does not exist"
            };
        }
    } catch (error) {
        console.error('Error in addToGitHub function:', error);
        return {
            "response": error,
            "status": 500
        };
    }
}



async function main() {
    try {
        const runButton = await waitForElement('getElementById', 'run-button');
        const button = addGitHubButtonToDOM(runButton);
        button.addEventListener('click', async () => {
            console.log("Content: ", content);
            const data = await addToGitHub();
            if (data.status === 201 || data.status === 200) {
                if (data.updated) {
                    showToast('Successfully updated in GitHub', '#007bff');
                } else {
                    showToast('Successfully added to GitHub', "#007bff");
                }
            } else {
                showToast('Failed to add to GitHub', '#e74c3c');
            }
        });

    } catch (error) {
        console.error('Error in main function:', error);
    }
};

main();

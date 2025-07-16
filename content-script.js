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


function getLanguage(language) {
    if (language === "Python") {
        return "py";
    } else if (language === "Java") {
        return "java";
    } else if (language === "C++") {
        return "cpp";
    } else if (language === "C#") {
        return "c";
    } else if (language === "JavaScript") {
        return "js";
    }
    return "py";
}

async function addContentToGitHub(code, questionTitle, questionContent, language) {
    const title = questionTitle.replaceAll(' ', '-').toLowerCase().trim();
    const solutionAdded = await addToGithub(code, title, "solution", getLanguage(language));
    const problemAdded = await addToGithub(questionContent, title, "problem", "md");

    if (solutionAdded.status !== 201 && solutionAdded.status !== 200) {
        return solutionAdded;
    }

    if (problemAdded.status !== 201 && problemAdded.status !== 200) {
        return problemAdded;
    }

    return problemAdded;
}

async function addToGithub(content, title, contentType, fileType) {
    try {
        const date = getDate();
        const pathName = `${date}/${title}/${contentType}.${fileType}`;
        const dataToAdd = {
            owner: config.github.username,
            repo: config.github.repo_name,
            path: 'PATH',
            message: `Added ${title} on ${date}`,
            committer: {
                name: config.github.committer_name,
                email: config.github.committer_email
            },
            content: btoa(String.fromCharCode(...new TextEncoder().encode(content)))
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
        return {
            "response": error,
            "status": 500
        };
    }
}

function formatArticleComponent(title, articleComponent) {
    if (!articleComponent) return '';
    
    let markdown = `# **${title}**\n\n`;
    
    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent.trim();
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const textContent = node.textContent.trim();
            
            switch (tagName) {
                case 'p':
                    if (textContent) {
                        return textContent + '\n\n';
                    }
                    break;
                    
                case 'div':
                    if (node.classList.contains('code-toolbar')) {
                        const codeElement = node.querySelector('code');
                        if (codeElement) {
                            return '```\n' + codeElement.textContent + '\n```\n\n';
                        }
                    }
                    let divContent = '';
                    for (const child of node.childNodes) {
                        divContent += processNode(child);
                    }
                    return divContent;
                    
                case 'ul':
                    let ulContent = '';
                    const listItems = node.querySelectorAll('li');
                    for (const li of listItems) {
                        ulContent += '- ' + li.textContent.trim() + '\n';
                    }
                    return ulContent + '\n';
                    
                case 'ol':
                    let olContent = '';
                    const orderedItems = node.querySelectorAll('li');
                    for (let i = 0; i < orderedItems.length; i++) {
                        olContent += (i + 1) + '. ' + orderedItems[i].textContent.trim() + '\n';
                    }
                    return olContent + '\n';
                    
                case 'details':
                    if (node.classList.contains('hint-accordion')) {
                        const summary = node.querySelector('summary');
                        const content = node.querySelector('div') || node.querySelector('p');
                        if (summary && content) {
                            return '### ' + summary.textContent.trim() + '\n\n' + 
                                   content.textContent.trim() + '\n\n';
                        }
                    }
                    break;
                    
                case 'br':
                    return '\n';
                    
                case 'strong':
                case 'b':
                    return '**' + textContent + '**';
                    
                case 'em':
                case 'i':
                    return '*' + textContent + '*';
                    
                case 'code':
                    if (node.parentElement && node.parentElement.classList.contains('code-toolbar')) {
                        return '```\n' + textContent + '\n```\n\n';
                    }
                    return '`' + textContent + '`';
                    
                case 'pre':
                    return '```\n' + textContent + '\n```\n\n';
                    
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    const level = parseInt(tagName.charAt(1));
                    const prefix = '#'.repeat(level);
                    return prefix + ' ' + textContent + '\n\n';
                    
                default:
                    let content = '';
                    for (const child of node.childNodes) {
                        content += processNode(child);
                    }
                    return content;
            }
        }
        
        return '';
    }
    
    for (const child of articleComponent.childNodes) {
        markdown += processNode(child);
    }
    
    return markdown.trim();
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'CODE_DATA' && message.code && message.title) {
        try {
            const questionTitle = await waitForElement('querySelector', 'h1');
            const articleComponent = await waitForElement('querySelector', 'div.my-article-component-container');
            const markdownContent = formatArticleComponent(questionTitle.textContent, articleComponent);
            const languageElement = await waitForElement('querySelector', '.selected-language');

            const title = questionTitle.textContent.replaceAll(' ', '-').toLowerCase().trim();
            const conentAdded = await addContentToGitHub(message.code, title, markdownContent, languageElement.textContent);
            if (conentAdded.status === 201 || conentAdded.status === 200) {
                const message = conentAdded.updated ? 'Successfully updated in GitHub' : 'Successfully added to GitHub';
                showToast(message, '#007bff');
            } else {
                showToast('Failed to add to GitHub', '#e74c3c');
            }
        } catch (error) {
            showToast('Failed to add to GitHub', '#e74c3c');
        }
    }
});

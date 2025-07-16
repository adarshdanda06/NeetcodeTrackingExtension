# NeetCode Tracking Extension

A Chrome extension that automatically captures your NeetCode solutions and problem descriptions, then uploads them to your GitHub repository in a well-organized format.

## Features

- **Automatic Code Capture**: Captures your solution code when you run or submit it on NeetCode
- **Problem Description**: Extracts and formats the problem description in Markdown
- **GitHub Integration**: Automatically uploads both solution and problem files to your GitHub repository
- **Organized Structure**: Creates a clean folder structure: `{date}/{problem-name}/`
- **Multiple Languages**: Supports various programming languages (Python, Java, C++, JavaScript, etc.)

## Installation

### 1. Clone or Download the Extension

```bash
git clone https://github.com/adarshdanda06/NeetcodeTrackingExtension
cd NeetcodeTrackingExtension
```

### 2. Create a GitHub Repository

Create a new GitHub repository where you want to track your NeetCode progress:

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "neetcode-solutions" or "coding-progress")
5. Choose public or private (your preference)
6. Click "Create repository"
7. **Note down the repository name** - you'll need it for the config file

### 3. Create Configuration File

**IMPORTANT**: You need to create a `config.js` file in the root directory with your GitHub credentials.

Create `config.js` with the following structure:

```javascript
const config = {
    github: {
        username: "your-github-username",
        repo_name: "your-repository-name",
        token: "your-github-personal-access-token",
        committer_name: "Your Name",
        committer_email: "your-email@example.com"
    }
};
```

#### How to Get GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Give it a name like "Neetcode_Extension_Token"
4. Go to Repository Access: `Only select repositories` and select the repository you created
5. Go to the Repository select and select Repository Permissions. You will drop down. Scroll to the Contents section and select the `Access` dropdown. Click `Read and write`. 
7. Click `Generate Token`
6. Copy the generated token and paste it in your `config.js`

### 4. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder containing your extension files

## File Structure

```
NeetcodeTrackingExtension/
├── manifest.json
├── background.js
├── content-script.js
├── config.js (you need to create this)
└── README.md
```

## How It Works

1. **Background Script** (`background.js`): Monitors network requests to NeetCode's API endpoints
2. **Content Script** (`content-script.js`): Extracts problem descriptions and handles GitHub uploads
3. **Configuration** (`config.js`): Contains your GitHub credentials and repository settings

## Usage

1. **Navigate to a NeetCode problem** (e.g., https://neetcode.io/problems/two-integer-sum?list=neetcode150/)
2. **Write your solution** in the code editor
3. **Submit your solution** (click "Submit" or "Run")
4. **Extension automatically captures** your code and the problem description
5. **Files are uploaded to GitHub** in the following structure:
   ```
   2024-01-15/
   └── two-sum/
       ├── solution.py (or .js, .java, etc.)
       └── problem.md
   ```

## Supported Languages

The extension automatically detects and uses the correct file extension for:
- Python (`.py`)
- JavaScript (`.js`)
- Java (`.java`)
- C++ (`.cpp`)
- C# (`.c`)


## Troubleshooting

### Extension Not Working?

1. **Check Console**: Open DevTools (F12) and check for errors
2. **Verify Config**: Ensure `config.js` exists and has correct credentials
3. **Check Permissions**: Make sure the personal access token has necessary permissions
4. **Reload Extension**: Go to `chrome://extensions/` and click the refresh icon

### Files Not Uploading to GitHub?

1. **Verify Token**: Check if your GitHub token is valid and has correct permissions
2. **Repository Access**: Ensure the repository exists and you have write access
3. **Network Issues**: Check if you can access GitHub from your browser

### Language Detection Issues?

- The extension defaults to Python (`.py`) if it can't detect the language
- Check if the language selector on NeetCode is properly loaded

## Security Notes

- **Never commit your `config.js`** file to version control
- **Keep your GitHub token secure** - it provides access to your repositories

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE). 
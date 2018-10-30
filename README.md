![](https://user-images.githubusercontent.com/3017676/38424019-ffb04316-39af-11e8-9a67-655746a3be9c.png)

# Account Purser
Account Purser is a self-hosted web application which scans your Gmail inbox to generate a list of all accounts you own. You can also gain insight into your security by checking which accounts are stored in your password manager, for example 1Password and LastPass.

# How does it work?
1. You sign into your Gmail Account
2. Purser will perform search queries in your Gmail inbox to find your registred accounts. It will use queries like 'gdpr' and 'thank you for signing up'. (you can find the full list in search_queries.js)
3. Your accounts will be presented in a table. You can see the account name, email address and website

Optionally you can check which accounts are stored in your password manager:

4. Drag an export file of your password manager in Purser
5. The list of accounts will now show if the account is found in the export file

# How does Purser deal with sensitive data?
I completely understand if you're wary of using an application like this; the reason I wrote this app is because I don't want to trust my sensitive data to a third party app. I have taken some steps to ensure Purser is safe to use:

* It's open source
* It's self-hosted
* You have to set up the Gmail API yourself
* It's written in (minimal) vanilla Javascript without using any third party libraries.
* It doesn't communicate with any third party service (apart from the Gmail API)
* You can import your password manager exports without it containing your actual password data

# Set up
## Requirements
* A (local) web server
* Gmail account

## Steps
1. Clone the repo to any folder
2. Turn on the Gmail API. [See Step 1 of the Google quickstart for instructions.](https://developers.google.com/gmail/api/quickstart/js)
3. Rename .env.example to .env and place your Gmail Client_ID in this file
4. Start a web server. You could use the following command from your working directory: Python 2.X: `python -m SimpleHTTPServer 8000`, Python 3.X `python -m http.server 8000`
5. Load the URL http://localhost:8000/ into your browser.

# Contribute
## Add new search queries
You can add new search queries in the `search_queries.js` file. Add quotes (") to be more precise with your search queries.

![screenshot from 2018-04-07 22-32-44](https://user-images.githubusercontent.com/3017676/38460098-a3fdc6f6-3ab3-11e8-84ce-92a0c9c0949e.png)

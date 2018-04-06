![](https://user-images.githubusercontent.com/3017676/38424019-ffb04316-39af-11e8-9a67-655746a3be9c.png)

#  Account Purser
Retrieve a list of all accounts you own. Check if your accounts are stored in a password manager.

# Requirements
* A (local) web server
* A Google account with Gmail enabled

# Set up
1. Clone the repo to any folder
2. Rename .env.example to .env and place your Gmail Client_ID in this file
3. Start the web server using the following command from your working directory: for example Python 2.X: `python -m SimpleHTTPServer 8000`, Python 3.X `python -m http.server 8000`
4. Load the URL http://localhost:8000/ into your browser.

# Add new search queries
You can add new search queries in the `search_queries.js` file. Add quotes (") to be more precise with your search queries.

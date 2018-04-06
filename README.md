#  Account Purser
Retrieve a list of all accounts you own. Check if your accounts are stored in a password manager.

# Requirements
* Python 2.4 or greater (to provide a web server).
* A Google account with Gmail enabled.

# Set up
1. Clone the repo to any folder
2. Rename .env.example to .env and place your Gmail Client_ID in this file
3. Start the web server using the following command from your working directory: Python 2.X: `python -m SimpleHTTPServer 8000`, Python 3.X `python -m http.server 8000`
4. Load the URL http://localhost:8000/ into your browser.

# Add new search queries
You can add new search queries in the `search_queries.js` file. Make sure to add quotes to your queries if you want a better search precision.

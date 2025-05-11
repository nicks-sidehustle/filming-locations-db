import requests
from bs4 import BeautifulSoup

# Test fetching IMDb locations page
url = "https://www.imdb.com/title/tt0111161/locations"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

print(f"Fetching: {url}")
response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Try different selectors
    print("\nTrying to find location elements...")
    
    # Check page title
    title = soup.find('title')
    print(f"Page title: {title.text if title else 'Not found'}")
    
    # Look for location items
    location_items = soup.find_all('div', class_=['ipc-html-content', 'ipc-html-content--base'])
    print(f"Found {len(location_items)} location divs")
    
    # Try other selectors
    soda_divs = soup.find_all('div', class_=['soda', 'soda odd', 'soda even'])
    print(f"Found {len(soda_divs)} soda divs")
    
    # Look for any text containing locations
    text_content = soup.get_text()
    if "filming locations" in text_content.lower():
        print("Found 'filming locations' in page text")
    
    # Save HTML for inspection
    with open('imdb_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("\nSaved page to imdb_page.html for inspection")

import requests

headers = {
    'accept': 'application/json',
    'accept-language': 'ru,en;q=0.9',
    'cache-control': 'no-cache',
    'origin': 'http://localhost:3000',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'http://localhost:3000/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
}

response = requests.get('https://api.kuchizu.online/clients', headers=headers)
print(response)
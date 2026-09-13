## How to Use

This is a backend-only API. There is no frontend interface.
To interact with the API, use one of the following:

### Option 1: cURL
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"1984","author":"George Orwell","year":1949,"status":"completed"}'

### Option 2: Postman
1. Import the collection (or create a new request)
2. Method: POST
3. URL: http://localhost:3000/books
4. Body: raw → JSON
5. Paste the book data
6. Click Send

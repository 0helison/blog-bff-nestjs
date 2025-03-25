# Backend for Frontend (BFF) - Blog

### The project aims to create a BFF with NestJs using concepts of: timeouts, circuit breakers and cache with redis


#### Clone reposiory:

```bash
git clone https://github.com/0helison/blog-bff-nestjs.git
```

### Services

* Posts
* Comments
* Users
* Fetch Blog

#### Start the container with the following command:

```bash
docker-compose up --build -d
```

#### Then run the next command:

```bash
docker-compose exec -it bff bash
```

#### * All commands from now on must be done in a bash terminal inside the container *

#### In bash terminal install node modules :

```bash
yarn install
```

#### Create a .env file with the information present in .env.example:

```bash
PORT=3000
HTTP_POSTS_URL=http://localhost:3001
HTTP_COMMENTS_URL=http://localhost:3002
HTTP_USERS_URL=http://localhost:3003
```

#### Now run the application in bash terminal:

```bash
yarn dev
```

### Request Posts - in bash terminal:

```bash
curl -Ss http://localhost:3000/posts | jq
```

#### Expect Response:

```bash
[
  {
    "id": 3,
    "title": "This is a third title",
    "author": "Daniel"
  },
  {
    "id": 2,
    "title": "This is a second title",
    "author": "Nathan"
  },
  {
    "id": 1,
    "title": "This is a first title",
    "author": "Vincent"
  }
]
```

### Request Post - in bash terminal:

```bash
curl -Ss http://localhost:3000/posts/1 | jq
```

#### Expect Response:

```bash
{
  "id": 1,
  "title": "This is a first title",
  "text": "Effective communication in writing relies...",
  "author": "Vincent",
  "comments": [
    {
      "id": 1,
      "text": "This is a great example of how users engage with content, sharing their thoughts and opinions to contribute to the discussion.",
      "user": "Ryan"
    },
    {
      "id": 2,
      "text": "I really appreciate the insights shared in this post. It adds valuable perspective and encourages further discussion on the topic.",
      "user": "Daniel"
    }
  ]
}
```
#### Run tests:

```bash
yarn test
```

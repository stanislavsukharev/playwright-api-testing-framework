import { test, expect } from '@playwright/test';

let authToken: string

test.beforeEach(async ({request}) => {
  const tokenResponse = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
    data: {
      "user": {
        "email": "email@test.io",
        "password": "password"
      }
    }
  })
  const tokenResponseJSON = await tokenResponse.json()
  authToken = 'Token ' + tokenResponseJSON.user.token
});


test('Get test tags', async ({ request }) => {
  const tagsResponse = await request.get("https://conduit-api.bondaracademy.com/api/tags")
  const tagsResponseJSON = await tagsResponse.json()
  expect(tagsResponse.status()).toEqual(200)
  expect(tagsResponseJSON.tags[0]).toEqual('Test')
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10)
});

test('Get articles', async ({ request }) => {
  const articlesResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0")
  const articlesResponseJSON = await articlesResponse.json()
  expect(articlesResponse.status()).toEqual(200)
  expect(articlesResponseJSON.articles.length).toBeLessThanOrEqual(10)
  expect(articlesResponseJSON.articlesCount).toEqual(10)
});

test('Create and delete article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "TEST26",
        "description": "test19",
        "body": "test19",
        "tagList": [
          "Lorem"
        ]
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const newArticleResponseJSON = await newArticleResponse.json()
  expect(newArticleResponse.status()).toEqual(201)
  expect(newArticleResponseJSON.article.title).toEqual('TEST26')
  const slugId = newArticleResponseJSON.article.slug


  const articlesResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", {
    headers: {
      Authorization: authToken
    }
  })
  const articlesResponseJSON = await articlesResponse.json()
  expect(articlesResponse.status()).toEqual(200)
  expect(articlesResponseJSON.articles[0].title).toEqual('TEST26')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
     headers: {
      Authorization: authToken
    }
  })
   expect(deleteArticleResponse.status()).toEqual(204)
});

test('Create, update and delete article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      "article": {
        "title": "TEST POST",
        "description": "TEST POST",
        "body": "TEST POST",
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const newArticleResponseJSON = await newArticleResponse.json()
  expect(newArticleResponse.status()).toEqual(201)
  expect(newArticleResponseJSON.article.title).toEqual('TEST POST')
  const slugId = newArticleResponseJSON.article.slug

  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    data: {
      "article": {
        "title": "TEST PUT",
        "description": "TEST PUT",
        "body": "TEST PUT",
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const updateArticleResponseJSON = await updateArticleResponse.json()
  expect(updateArticleResponse.status()).toEqual(200)
  const newSlugId = updateArticleResponseJSON.article.slug
  expect(updateArticleResponseJSON.article.title).toEqual('TEST PUT')


  const articlesResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", {
    headers: {
      Authorization: authToken
    }
  })
  const articlesResponseJSON = await articlesResponse.json()
  expect(articlesResponse.status()).toEqual(200)
  expect(articlesResponseJSON.articles[0].title).toEqual('TEST PUT')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${newSlugId}`, {
     headers: {
      Authorization: authToken
    }
  })
   expect(deleteArticleResponse.status()).toEqual(204)
});
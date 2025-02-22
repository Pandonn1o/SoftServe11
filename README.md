# Node.js Practical

## The task of the topic "mongoose"

Create a web application using Node.js and Express.js that allows users to create, read, update, and delete articles  
(base url /api/v1/articles)

1.  Each article has the next structure:  
     <img src="./dev-data/data-structure.png" width=400>

    - _title_ is mandatory field, it should be unique (with 'Title is required' error message), and its length cannot be less than 10 characters (with 'Title should be longer than 10 characters' message)
    - _theme_ is mandatory, can be one of the next possible values: 'trips', 'shopping', 'beauty', 'art', 'food'
    - _description_ should be trimmed when saved through the schema
    - _viewsCount_ - Number datatype with default value 0
    - _lastChangedAt_ should be of Date type and have default value of date and time of last change when saved through the schema.
    - _comments_ - array of elements. Each comment has:

        - _evaluation_ - can have one of two values: 'like', 'dislike'
        - _content_ - should be trimmed when saved through the schema

        <br>

    - also, article has fields, that are not stored in database, but are evaluated:

        - _likesQuantity_ - reflects count of comments to this article with evaluation equal to 'like'
        - _dislikesQuantity_ - reflects count of comments to this article with evaluation equal to 'dislike'
        - _rating_ - likesQuantity minus dislikesQuantity, divided by the count of comments to this article and incremented by one after that

    Definition of this structure should be placed in /models/articleModel.js

2.  user should be able to get articles through get request to /api/v1/articles

    - articles should be filtered by params set in query string (title, theme, description, viewsCount and lastChangedAt fields). For example, get request /api/v1/articles?theme=shopping should provide only articles with the theme 'shopping'.
    - filtering should be performed not only by equality, but by other comparisons: greater, greater or equal, less, less or equal. For exammpe, get request api/v1/articles?viewsCount[gte]=2 should return all articles with count of views greater than 2
    - articles should be sorted by fields defined for sort param in query string (title, theme, description, viewsCount and lastChangedAt fields).  
       For example, get request
      - api/v1/articles?sort=lastChangedAt should provide articles sorted by lastChangedAt in ascending order,
      - api/v1/articles?sort=lastChangedAt,title should provide articles sorted by lastChangedAt in ascending order and then by title in ascending order
      - api/v1/articles?sort=-lastChangedAt should provide articles sorted by lastChangedAt in descending order
        user can limit fields of articles to be provided. He can do this with fields param in query string. For example, get request api/v1/articles?fields=title,lastChangedAt should provide result colection with each item containing only title and lastChangedAt fields.
    - user can limit count of provided articles by limit parameter. For example, get request api/v1/articles?limit=3 should provide not more than 3 articles
    - user can get articles of specified page with specified amount of elements on page. For example, get request api/v1/tours?limit=5&page=2 should provide 5 articles, starting from the 6th and finishing with 10th

3.  user sould be able to create (through POST request), update (through PATCH request) and delete (through DELETE request) articles. Default values should be stored in database on creation and updating article if user didn't provide values for the fields.

4.  Provide endpoint for statistics - of reviews number by article theme (/api/v1/articles/views-by-theme). The result shoud have the next structure:

```
{
    "status": "success",
    "data": {
        "count": 2,
        "result": [
            {
                "_id": "trips",
                "views": 20
            },
            {
                "_id": "shopping",
                "views": 3
            }
        ]
    }
}
```

5.\* Provide endpoint for selecting the most liked posts with ability lo limit the count of results (/api/v1/articles/most-liked). Posts should be ordered by rating in descending order and then by title in ascending order.  
The response shoud have the next structure:

```
{
    "status": "success",
    "data": {
        "count": 2,
        "result": [
            {
                "title": "The Forest Hiker",
                "commentsCount": 1,
                "rating": 1
            },
            {
                "title": "The Coastal Explorer",
                "commentsCount": 2,
                "rating": -0.3333333333333333
            }
        ]
    }
}
```

Rating here is an average value of likes (comment with like is evaluated as 1, with dislike as -1, without evaluation as 0)

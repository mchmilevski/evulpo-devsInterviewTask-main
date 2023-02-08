# EXERCISE 1 - IMPROVMENTS
1. Website UI
2. Display the progress for each category
3. Display the questions per category
4. Mobile friendly (responsive)

# EXERCISE 2 - SOLUTION

## Adding new language in the database

Adding a new column **parent_id** into the **ltm_translations** database. This will be **null** for the original language (German in our example). 

If we want to tanslate from one language to another, we will run a query which will give us a list with all the keys with parent_id=null (the original language)

`SELECT * FROM ltm_translations WHERE parent_id=null`

After receiving the list we call a function that will translate the text in the desired language using DeepL API and then insert rows with parent_id being the id of translated key.

**Example of rows**:

`(id, lang, key, text, parent_id)` \
`(1, de_DE, 'index.question.start', 'Nachhilfe', NULL)`\
`(2, en_EN, 'index.question.start', 'Tutoring', 1)`

**Function example:**
```
function translate(row, language):
  translatedRow = deepL.translate(row.text, row.lang, language)
  translatedRow.parant_id = row.id
  INSERT INTO ltm_translations translatedRow`
```

In this way we translate only one language. In case the table had 3 languages (DE, FR, RO), we don't have to go throught the entire table and translate all the languages to the new language. We only search for the original language and translate that one to the new language.

## Inserting new text in the database

If we want to insert a new text in the database and translate it into all the other languages, we first add it in the original language and then call the same function from above with only this key, desired languages and this inserts them into the table.

## Deleting a translation

When we want to delete a translation that is not used anymore, we can search for the id and delete it together with it's children (rows that have parent_id=id)

## Udating a translation

If we need to update the original language, we update the text of it, delete it's children and simulate the insertion step from above.

If we need to ubdate a child then we just update the text of that row.

## UI/UX flow

We can have a dropdown with all the available languages and when the user selects a new language, a GET request to the `https:/evulpo/en/` route will be made which gives us back an array with the keys and translations that can be used inside the application.

In case the conaction to the database is down we can have all the translations stored in the project repository. 
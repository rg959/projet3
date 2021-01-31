# Delete Account

Used to delete a new account

:warning: This action cannot be reversed

**URL** : `/account`

**Method** : `DELETE`

**Auth required** : `YES`

**Data constraints**

```json
{
  "email": "[valid unique email]"
}
```

**Data example**

```json
{
  "email": "karen@gmail.com"
}
```

---

## Success Response

**Code** : `200`

```json
{
  "success": true, 
  "message": "Successfully deleted"
}
```

---

## Error Response

**Condition** : If one field is missing

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "error": "Field [X] is missing."
}
```

**Condition** : If one field isn't valid

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Condition** : If authentification failed

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "error": "authentification failed"
}
```

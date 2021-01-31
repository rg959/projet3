# Refresh token

Used when current token is no longer valid.

**URL** : `/account/refresh-token`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "refresh_token": "[valid refresh token]",
    "id": "[valid user id]"
}
```

**Data example**

```json
{
    "refresh_token": "[valid refresh token]",
    "id": "[valid user id]"
}
```

---

## Success Response

**Code** : `200`

```json
{
    "success": true,
    "id": "[id]",
    "name": "Karen Paul",
    "email": "karen@gmail.com",
    "phone": "+33611223344",
    "token": "[token]",
    "refresh_token": "[token]"
}
```

---

## Error Response

**Condition** : If id or refresh token is empty

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Invalid body"
}
```

**Condition** : If user don't exist on database

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Invalid id"
}
```


**Condition** : If refresh token is invalid

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Invalid token"
}
```

**Condition** : If authentification failed

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Invalid credentials"
}
```

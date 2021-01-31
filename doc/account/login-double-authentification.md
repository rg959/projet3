# Login double authentification

Used to confirm login process with code received by phone.
Only if double authentification is activated.

**URL** : `/account/login-validate`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "email": "[valid unique email]",
    "code": "[valid code received by phone after trying to login]"
}
```

**Data example**

```json
{
    "email": "karen@gmail.com",
    "code": "470532"
}
```

---

## Success Response

**Code** : `200`

```json
{
    "success": true,
    "name": "Karen Paul",
    "email": "karen@gmail.com",
    "picture": "[raw picture]", // Will be added later
    "phone": "+33611223344",
    "id": "[id]",
    "token": "[token]",
    "refresh_token": "[token]"
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
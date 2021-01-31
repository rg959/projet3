# Request code verify email

Used to get an email with a code to verify your email adress. The code is valid for 10 minutes.

**URL** : `/account/request-verify-email`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "email": "[valid email]"
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
    "success": true
}
```

---

## Error Response

**Condition** : If one field is missing or invalid

**Code** : `BAD REQUEST`

```json
{
    "success": false, 
    "message": "Invalid body"
}
```

**Condition** : If the email verification code has not been generated

**Code** : `500`

```json
{
  "success": false,
  "error": "Can't generate verify email code"
}
```

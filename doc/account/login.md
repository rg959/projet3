# Create Account

Used to login to an account

**URL** : `/account/login`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "email": "[valid unique email]",
    "password": "[valid password]",
    "code?": "[Valid code, required only if double authentification is activated]"
}
```

**Data example**

```json
{
    "email": "karen@gmail.com",
    "password": "password987",
    "code?": "468074"
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
    "refresh_token": "[token]",
    "phone_verified": "[boolean]"
}
```

---

## Error Response

**Condition** : If one field is missing

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Missing [X]"
}
```

**Condition** : If credentials are not valid

**Code** : `401`

```json
{
    "success": false,
    "error": "Login failed! Check authentication credentials"
}
```

**Condition** : If user's email is not verified

**Code** : `400`

```json
{
    "success": false,
    "error": "Email address not verified"
}
```

**Condition** : If double authentification is active

**Code** : `400`

```json
{
    "success": false,
    "error": "Double authentification is activated, code is required"
}
```

**Condition** : If code expired

**Code** : `400`

```json
{
    "success": false,
    "error": "Code is no longer valid"
}
```

**Condition** : If code is wrong

**Code** : `400`

```json
{
    "success": false,
    "error": "Wrong code"
}
```



**Condition** : If one field doesn't match the database result

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Invalid username or password."
}
```

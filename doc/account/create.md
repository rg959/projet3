# Create Account

Used to create a new account

**URL** : `/account/register`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

**NOTE**
Not all data are mandatory.

```json
{
    "name": "[valid unique name]",
    "email": "[valid unique email]",
    "picture?": "[valid picture]", // Will be added later
    "password": "[valid password]",
    "phone": "[valid phone number]"
}
```

**Data example**

```json
{
    "name": "Karen Paul",
    "email": "karen@gmail.com",
    "picture?": "[raw picture]", // Will be added later
    "password": "password987",
    "phone": "+33611223344"
}
```

---

## Success Response

**Code** : `201`

```json
{
    "success": true,
    "name": "Karen Paul",
    "email": "karen@gmail.com",
    "phone": "+33611223344",
    "picture": "[raw picture]", // Will be added later
    "id": "[id]"
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

**Condition** : If one field doesn't match the database result

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Field [X] is not valid."
}
```

# Reset Forgotten Password

Used to reset a password of an account after requesting code

**URL** : `/account/reset-password`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "email": "[valid email]",
    "code": "[Code received by route /account/request-reset-password]",
    "password": "[valid password]"
}
```

**Data example**

```json
{
    "email": "karen@gmail.com",
    "code": "975261",
    "password": "édphçéèhè27"
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

**Condition** : If one field is missing or if the code is invalid.

If code isn't valid : User has 3 change to get the right code

**Code** : `BAD REQUEST`

```json
{
    "success": false, 
    "message": "Invalid body"
}
```

**Condition** : If code has been send more than 10 minute after it has been requested

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "message": "Code is no longer valid"
}
```

**Condition** : If a wrong code is sent

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "message": "Code isn't valid"
}
```

# Request code reset password

Used to get an email or an sms with a code to reset your forgotten password. The code is valid for 10 minutes.

**URL** : `/account/request-reset-password`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
    "type": "['email' OR 'phone']",
    "email": "[valid email]"
}
```

**Data example**

```json
{
    "type": "email", OR "type": "phone",
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
    "message": "Invalide body"
}
```

**Condition** : If the user request a recovery by phone, but the account does not contain any phone number

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "message": "Can't send sms. The user has not set any recovery phone number."
}
```
**Condition** : If the password reset code has not been generated

**Code** : `500`

```json
{
    "success": false,
    "message": "Can't generate password code"
}
```

# Login double authentification

Used to request to send a code by phone for double authentification.

**URL** : `/account/request-double-authentification`

**Method** : `POST`

**Auth required** : `NO`

**Data constraints**

```json
{
  "email": "[valid unique email]",
  "password": "[valid password]"
}
```

**Data example**

```json
{
  "email": "karen@gmail.com",
  "password": "S2PH28TG6+D8ee"
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

**Condition** : If email field is missing

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Missing email"
}
```

---

## Error Response

**Condition** : If password field is missing

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Missing password"
}
```

---

## Error Response

**Condition** : If we send invalid email or password

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Login failed! Check authentication credentials"
}
```

---

## Error Response

**Condition** : If email is not verified

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Email address not verified"
}
```

---

## Error Response

**Condition** : Internal server Error

**Code** : `500`

```json
{
  "success": false,
  "message": "[MongoDB error]"
}
```

# Toggle double authentification

Used to able or disable double authentification

**URL** : `/account/double-authentification`

**Method** : `POST`

**Auth required** : `YES`

**Data constraints**

```json
{
  "allow": "[Boolean]"
}
```

**Data example**

```json
{
  "allow": true
}
```

---

## Success Response

**Code** : `200`

```json
{
    "success": true,
    "activated": true or false
}
```

---

## Error Response

**Condition** : If allow field is missing

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Invalid body"
}
```

**Condition** : If activation doesn't work

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "[MongoDB error]"
}
```

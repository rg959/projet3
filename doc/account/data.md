# Get account

Used to get information about current account

**URL** : `/account`

**Method** : `GET`

**Auth required** : `YES`

**Data constraints**

```json
NONE
```

**Data example**

```json
NONE
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
    "picture?": "[raw picture]", // Will be added later
    "group": "[valid group id]"
}
```

---

## Error Response

**Condition** : If authentification failed

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "Authentification failed."
}
```

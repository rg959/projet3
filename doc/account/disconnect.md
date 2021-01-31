# Disconnect

Used to disconnect from OMCU-L

**URL** : `/account/disconnect`

**Method** : `POST`

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
    "message": "Successfully logout"
}
```

---

## Error Response

**Condition** : If authentification failed

**Code** : `BAD REQUEST`

```json
{
    "success": false,
    "error": "authentification failed"
}
```

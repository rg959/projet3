# Delete History

Used to delete a history

**URL** : `/history`

**Method** : `DELETE`

**Auth required** : `YES`

**Data constraints**

```json
{
  "id": "[valid history id]"
}
```

---

**Data example**

```json
{
  "id": "48q4dqzdqz8d49q84d65qqzd"
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

**Condition** : If we send invalid user or history ID

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "Invalid user or history ID"
}
```

---

**Condition** : If we don't send history ID

**Code** : `BAD REQUEST`

```json
{
  "success": false,
  "message": "History ID is missing"
}
```

---

**Condition** : If delete doesn't work

**Code** : `500`

```json
{
  "success": false,
  "message": "[MongoDB error]"
}
```

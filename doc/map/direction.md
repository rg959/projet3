# Create History

Used to create a new history

**URL** : `/direction`

**Method** : `POST`

**Auth required** : `YES`

**Data constraints**

**NOTE**
Not all data are mandatory.

```json
{
  "origin": "[valid origin address]",
  "destination": "[valid destination address]",
  "waypoints?": ["Array of valid waypoints address"],
  "mode": "[valid google travel mode]"
}
```

---

**Data example**

```json
{
  "origin": "Paris",
  "destination": "Bordeaux",
  "waypoints?": ["Juvisy", "Marseille", "Lille"],
  "mode": "driving"
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

**Condition** : If we don't send origin or destination

**Code** : `400`

```json
{
  "success": false,
  "message": "Invalid body"
}
```

---

## Error Response

**Condition** : If we send an invalid mode

**Code** : `400`

```json
{
  "success": false,
  "message": "Invalid travel mode"
}
```

---

## Error Response

**Condition** : If we send more than 23 waypoints

**Code** : `400`

```json
{
  "success": false,
  "message": "To much waypoints"
}
```

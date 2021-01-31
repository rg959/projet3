# Create History

Used to create a new history

**URL** : `/history`

**Method** : `POST`

**Auth required** : `YES`

**Data constraints**

```json
{
  "departure_location": "[valid departure location]",
  "arrival_location": "[valid arrival location]",
  "waypoints?": ["valid array of waypoints"],
  "duration": "[valid duration]",
  "mode": "[valid google travel mode]"
}
```

---

**Data example**

```json
{
  "departure_location": "Paris",
  "arrival_location": "Boulogne",
  "waypoints?": [{ "location": "Marseille" }, { "Location": "Lille" }],
  "duration": "3h 45min",
  "mode": "driving"
}
```

---

## Success Response

**Code** : `201`

```json
{
  "success": true
}
```

---

## Error Response

**Condition** : If we don't send all data

**Code** : `400`

```json
{
  "success": false,
  "message": "[MongoDB Error]"
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

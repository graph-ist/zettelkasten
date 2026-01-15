


#### Most Cited Persons (Top 50)

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "References"
FROM ""
FLATTEN authors AS author
WHERE author
GROUP BY author
SORT length(rows) DESC
LIMIT 50
```

---

#### All Persons by Letter

##### A-C

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[A") OR startswith(string(author), "[[B") OR startswith(string(author), "[[C"))
GROUP BY author
SORT author ASC
```

##### D-F

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[D") OR startswith(string(author), "[[E") OR startswith(string(author), "[[F"))
GROUP BY author
SORT author ASC
```

##### G-I

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[G") OR startswith(string(author), "[[H") OR startswith(string(author), "[[I"))
GROUP BY author
SORT author ASC
```

##### J-L

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[J") OR startswith(string(author), "[[K") OR startswith(string(author), "[[L"))
GROUP BY author
SORT author ASC
```

##### M-O

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[M") OR startswith(string(author), "[[N") OR startswith(string(author), "[[O"))
GROUP BY author
SORT author ASC
```

##### P-R

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[P") OR startswith(string(author), "[[Q") OR startswith(string(author), "[[R"))
GROUP BY author
SORT author ASC
```

##### S-U

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[S") OR startswith(string(author), "[[T") OR startswith(string(author), "[[U"))
GROUP BY author
SORT author ASC
```

##### V-Z

```dataview
TABLE WITHOUT ID
  author AS "Person",
  length(rows) AS "Refs"
FROM ""
FLATTEN authors AS author
WHERE author AND (startswith(string(author), "[[V") OR startswith(string(author), "[[W") OR startswith(string(author), "[[X") OR startswith(string(author), "[[Y") OR startswith(string(author), "[[Z"))
GROUP BY author
SORT author ASC
```

---

#### Missing Person Notes

Persons cited in `authors` field but without a dedicated note:

```dataview
TABLE WITHOUT ID
  author AS "Missing Note",
  length(rows) AS "References"
FROM ""
FLATTEN authors AS author
WHERE author AND !author.file
GROUP BY author
SORT length(rows) DESC
LIMIT 30
```

---

#### Statistics

Total unique persons in vault:

```dataview
TABLE WITHOUT ID
  length(rows) AS "Total Unique Persons"
FROM ""
FLATTEN authors AS author
WHERE author
GROUP BY true
```

---

> [!NOTE]
> *This index is dynamically generated using Dataview. It updates automatically when notes are modified.*

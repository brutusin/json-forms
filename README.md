# json-forms
`org.brutusin:json-forms` is a javascript library that generates HTML forms from JSON Schemas.

`Documentation in progress`

**Table of Contents:** 

- [org.brutusin:json-forms](#)
  - [Features](#features)
  - [Usage](#usage)
  - [Extensions](#extensions)
  - [Demo](#demo)
  - [TODO](#todo)
  - [See also](#see-also)
  - [Support, bugs and requests](#support-bugs-and-requests)
  - [Authors](#authors)
  - [License](#license)

## Features
* Dynamic schemas support
* Extensible
* Customizable
* No external libraries needed
* Validation
* Multiple forms per document supported

## Usage
Include the main library dependencies:
```html
<link rel="stylesheet" href='src/brutusin-json-forms.css'/>
<script src="src/brutusin-json-forms.js"></script>
```
Optionally, include the bootstrap extension (requires bootstrap):
```html
<script src="src/brutusin-json-forms-bootstrap.js"></script>
```
Create the javascript `BrutusinForms` instance, being `schema` a javascript `object` representing the schema structure:
```javascript
var bf = BrutusinForms.create(schema);
```
And finally, render the form inside a container, with optional JSON initial `data` preloaded:
```javascript
var container = document.getElementById('container');
bf.render(container, data);
```

## Demo
http://brutusin.org/json-forms/

##See also

## Support bugs and requests
https://github.com/brutusin/json/issues

## Authors

- Ignacio del Valle Alles (<https://github.com/idelvall/>)

Contributions are always welcome and greatly appreciated!

##License
Apache License, Version 2.0

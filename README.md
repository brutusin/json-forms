# json-forms
`org.brutusin:json-forms` is a javascript library that generates HTML forms from JSON Schemas.

`Documentation in progress`

**Table of Contents:** 

- [org.brutusin:json-forms](#)
  - [Features](#features)
  - [Usage](#usage)
  - [Demo](#demo)
  - [Extensions](#extensions)
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
<link rel="stylesheet" href='http://brutusin.org/json-forms/src/brutusin-json-forms.css'/>
<script src="http://brutusin.org/json-forms/src/brutusin-json-forms.js"></script>
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

## API
### Static members:

Member|Description
------| -------
`BrutusinForms.create(schema)`|BrutusinForms factory method
`BrutusinForms.decorator(htmlElement)`|Callback function to be notified after an HTML element has been rendered (passed as parameter)
`BrutusinForms.postRender(instance)`|Callback function to be notified after a BrutusinForms instance has been rendered (passed as parameter)
`BrutusinForms.instances`|Array containing the BrutusinForms instances created in the document

### Instance members:

Member|Description
------| -------
`bf.render(container, data)`| Renders the form inside the the container, with the specified data preloaded
`bf.validate()`| Returns `true` if the input data entered by the user passes validation
`bf.getData()`| Returns the javascript object with the data entered by the user
`bf.setSchemaResolver(f)`| Sets `f` as the schema resolver for dynamic schemas. Being `f=funtion(nameArray, data)`

##See also

## Support bugs and requests
https://github.com/brutusin/json/issues

## Authors

- Ignacio del Valle Alles (<https://github.com/idelvall/>)

Contributions are always welcome and greatly appreciated!

##License
Apache License, Version 2.0

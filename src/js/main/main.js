/*
 * Copyright 2015 brutusin.org
 *
 * Licensed under the Apache License, Version 2.0 (the "SuperLicense");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @author Ignacio del Valle Alles idelvall@brutusin.org
 */

if (typeof brutusin === "undefined") {
    window.brutusin = new Object();
} else if (typeof brutusin !== "object") {
    throw ("brutusin global variable already exists");
}

(function () {
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    if (!String.prototype.includes) {
        String.prototype.includes = function () {
            'use strict';
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var formatted = this;
            for (var i = 0; i < arguments.length; i++) {
                var regexp = new RegExp('\\{' + i + '\\}', 'gi');
                formatted = formatted.replace(regexp, arguments[i]);
            }
            return formatted;
        };
    }
    
    var SCHEMA_TYPES = ["string", "object", "array", "integer", "number", "boolean", "any"];
    
    var BrutusinForms = new Object();
    brutusin["json-forms"] = BrutusinForms;
    BrutusinForms.create = function (schema) {
        return new BrutusinForm(schema);
    }
    
    function SchemaInput() {
    }

    SchemaInput.prototype = {}

    function BrutusinForm(schema) {
        this.schema = schema;
        this.inputPrototypes = {};
    }

    BrutusinForm.prototype = {
        setInputPrototype: function (schemaType, schemaInputPrototype) {
            if(!schemaType | !schemaInputPrototype){
                throw ("Both arguments are required");
            }
            if(!schemaType in SCHEMA_TYPES){
               throw ("First argument must be a valid type: " + SCHEMA_TYPES); 
            }
            if(!Object.prototype.isPrototypeOf(SchemaInput)){
                throw ("Second argument must be a SchemaInput prototype");
            }
        },
        render: function (htmlContainer, initialData) {
            
        },
        getData: function () {
            
        },
        validate: function () {
            
        }
    };
    
}());

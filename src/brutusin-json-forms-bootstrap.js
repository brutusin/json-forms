/*
 * Copyright 2015 brutusin.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
if ("undefined" == typeof BrutusinForms) {
    throw new Error("brutusin-json-forms-bootstrap.js requires brutusin-json-forms.js");
}

BrutusinForms.decorator = function (element) {
    if (element.tagName) {
        var tagName = element.tagName.toLowerCase();
        if (tagName === "input" && element.type !== "checkbox" || tagName === "textarea") {
            element.className += " form-control";
        } else if (tagName === "select") {
            element.className += " chosen-select form-control";
        } else if (tagName === "button") {
            element.className += "btn btn-primary  btn-xs";
        } else if (tagName === "form") {
            element.className += " form-inline";
        }
    }
    if (element.title) {
        element.setAttribute("data-toggle", "tooltip");
        $(element).tooltip({
            container: 'body'
        });
    }
};
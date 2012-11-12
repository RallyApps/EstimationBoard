/**
 Copyright (c) 2012 Rally Software Development Corp. All rights reserved.
 */

EstimationBoardSettings = function(rallyDataSource, sizes, prefs) {
    rally.sdk.ComponentBase.call(this);

    var that = this;
    var accessors = [], deleteLinkConnections = [];
    var dialog, projectPrefRef, sizesObject;
    var validationDiv = dojo.byId("validationErrors");

    that.show = function() {
        if (dialog) {
            dialog.show();
            that._alignSettingsDialog();
        }
    };

    that.hide = function() {
        if (dialog) {
            dialog.hide();
        }
    };

    that._saveComplete = function() {
        window.location.reload();
    };

    that._getValues = function() {
        var values = {fieldInfos:{}};
        rally.forEach(accessors, function(value) {
            values.fieldInfos[value.field] = value.get();
        });
        return values;
    };

    that._storeValues = function(callback) {
        var pref;

        function errorCallback(results) {
            rally.Logger.warn(results);
        }

        if (!projectPrefRef) {
            pref = {
                Name: "EstimationBoard/Settings",
                Value: that._getValues(),
                Project:"/Project/" + rallyDataSource.projectOid
            };
            rallyDataSource.preferences.createAppPreference(pref, callback, errorCallback);
        } else {
            pref = {
                _ref : projectPrefRef,
                Value:that._getValues()
            };
            rallyDataSource.preferences.update(pref, callback, errorCallback);
        }
    };

    that.validateSizes = function() {
        var validationErrors = [], uniqueEstimates = [], uniqueColumns = [];
        rally.forEach(accessors, function(value) {
            if (dojo.trim(value.get().label) === "") {
                var columnError = "Please enter a value for all your column names.";
                if (validationErrors.indexOf(columnError) === -1) {
                    validationErrors.push(columnError);
                }
            }
            if (uniqueColumns.indexOf(dojo.trim(value.get().label)) === -1) {
                uniqueColumns.push(dojo.trim(value.get().label));
            } else {
                var uniqueColumnError = "Please enter unique values for all your column names.";
                if (validationErrors.indexOf(uniqueColumnError) === -1) {
                    validationErrors.push(uniqueColumnError);
                }
            }
            if (dojo.trim(value.get().planEstimate) === "" || isNaN(value.get().planEstimate) || value.get().planEstimate < 0) {
                var planEstimateError = "Please enter a positive number for all your plan estimates.";
                if (validationErrors.indexOf(planEstimateError) === -1) {
                    validationErrors.push(planEstimateError);
                }
            }
            if (uniqueEstimates.indexOf(dojo.trim(value.get().planEstimate)) === -1) {
                uniqueEstimates.push(dojo.trim(value.get().planEstimate));
            } else {
                var uniqueEstimateError = "Please enter unique numbers for all your plan estimates.";
                if (validationErrors.indexOf(uniqueEstimateError) === -1) {
                    validationErrors.push(uniqueEstimateError);
                }
            }
            if (!isNaN(value.get().planEstimate) && (dojo.trim(value.get().planEstimate) >= 1000 || dojo.trim(value.get().planEstimate).split('.')[1] > 100 )) {
                var tooManyDigitsError = "Please enter a number with a maximum of 3 digits before and 2 digits after the decimal point.";
                if (validationErrors.indexOf(tooManyDigitsError) === -1) {
                    validationErrors.push(tooManyDigitsError);
                }
            }
        });
        if (validationErrors.length > 0) {
            validationDiv.innerHTML = validationErrors.join("<br/>");
            dojo.removeClass(validationDiv, "hide");
        }
        return validationErrors.length === 0;
    };

    that._addControlToRow = function(row, divId, control, containerCss) {
        var td = document.createElement("td");
        var div = document.createElement("div");
        dojo.addClass(div, containerCss);
        td.appendChild(div);
        div.id = divId;
        if (divId.search(/deleteLink/) === -1) {
            control.display(div);
        } else {
            dojo.place(control, div);
        }
        row.appendChild(td);
    };

    that.deleteTableRow = function(fieldName) {
        dojo.byId(fieldName).parentNode.removeChild(dojo.byId(fieldName));  //remove size's form row
        dojo.forEach(accessors, function(value, i) {
            if (value && fieldName === value.field) {
                accessors.splice(i, 1); //remove size's object from accessors array
            }
        });
    };

    that._createTableRow = function(size) {
        var fieldName = size.label ? size.label : "new_" + new Date();
        var row = document.createElement("tr");
        row.id = fieldName;

        var labelTextBox = new rally.sdk.ui.basic.TextBox({rememberValue:false, value:size.label});
        that._addControlToRow(row, fieldName + "-labelTextBox", labelTextBox, "labelTextBoxContainer");

        var isNoPlanEstimateRow = size.planEstimate === 0 || size.planEstimate === "0";
        var planEstimateTextBox = new rally.sdk.ui.basic.TextBox({rememberValue:false, value:size.planEstimate, readOnly: isNoPlanEstimateRow});
        that._addControlToRow(row, fieldName + "-planEstimateTextBox", planEstimateTextBox, "planEstimateTextBoxContainer");

        if (!isNoPlanEstimateRow) {
            var deleteLink = "<a href='' id='" + fieldName + "DeleteLink'>Delete</a>";
            that._addControlToRow(row, fieldName + "-deleteLink", deleteLink, "deleteLinkContainer");
        }

        var accessor = {
            field:fieldName,
            get: function() {
                var result = {};
                result.label = labelTextBox.getValue();
                result.planEstimate = planEstimateTextBox.getValue();
                return result;
            },
            set:function(object) {
                labelTextBox.setValue(object.label);
                planEstimateTextBox.setValue(object.planEstimate);
            }
        };
        accessors.push(accessor);
        return row;
    };

    that.restrictDialogHeight = function() {
        //restrict size of dialog to prevent scrolling issues when a field has A LOT of attributes
        dojo.query(".dijitDialog").forEach(function(node) {
            dojo.attr(node, "style", {
                "max-height": "550px",
                "overflow": "auto"
            });
        });
    };

    that.displaySaveCancelFeatures = function() {
        var buttonContainer = dojo.query(".buttonContainer")[0];

        var saveButton = new rally.sdk.ui.basic.Button({text:"Save", value:"Save"});
        saveButton.display(buttonContainer, function() {
            if (that.validateSizes()) {
                that._storeValues(that._saveComplete);
            }
        });

        var cancelLink = "<a href='' id='cancelLink'>Cancel</a>";
        dojo.place(cancelLink, buttonContainer);
        dojo.connect(dojo.byId('cancelLink'), "onclick", function(event) {
            dojo.addClass(validationDiv, "hide");
            dialog.hide();
            dojo.stopEvent(event);
        });

    };

    that.getValidEvents = function() {
        return {onHide:"onHide"};
    };

    that.displayDialog = function() {
        if (dialog) {
            return;
        }

        dojo.byId("settingsDialogDiv").style.visibility = "visible";

        dialog = new rally.sdk.ui.basic.Dialog({
            id : new Date().toString(),
            title: "Configure Settings for Estimation Board",
            draggable:false,
            closable:false,
            content: dojo.byId("settingsDialogDiv")
        });
        dialog.addEventListener("onHide", function() {
            that.fireEvent(that.getValidEvents().onHide, {});
        });
        dojo.addClass(validationDiv, "hide");
        dialog.display();
        that._alignSettingsDialog();
        that.displaySaveCancelFeatures();

        that.restrictDialogHeight();
    };

    that.connectDeleteLinkHandlers = function() {
        dojo.forEach(deleteLinkConnections, dojo.disconnect);
        dojo.forEach(dojo.query(".deleteLinkContainer"), function(deleteContainer) {
            deleteLinkConnections.push(
                    dojo.connect(deleteContainer.children[0], "onclick", function(event) {
                        var fieldName = event.target.id.replace("DeleteLink", "");
                        that.deleteTableRow(fieldName);
                        dojo.stopEvent(event);
                    })
            );
        });
        that.displayDialog();
    };

    that.displayUnits = function() {
        function displayRetrievedUnits(results) {
            if (results && results.units[0]) {
                units = results.units[0].IterationEstimateUnitName;
                dojo.byId("units").innerHTML = "(" + units + ")";
            }
            that.connectDeleteLinkHandlers();
        }

        rallyDataSource.find({
            key: "units",
            type: "WorkspaceConfiguration",
            fetch: "IterationEstimateUnitName"}, displayRetrievedUnits);
    };

    that.displayAddLink = function() {
        dojo.byId("addLinkCell").innerHTML = "<a href='' id='addLink'>Add <img src='/slm/analytics/images/plus-196b89-gr.png'></a>";
        dojo.connect(dojo.byId('addLink'), "onclick", function(event) {
            if (accessors.length < 12) {
                var row = that._createTableRow({label:"", planEstimate:""});
                dojo.byId("settingsTableBody").appendChild(row);
                that.connectDeleteLinkHandlers();
            } else {
                validationDiv.innerHTML = "There is a limit of 12 columns.";
                dojo.removeClass(validationDiv, "hide");
            }
            dojo.stopEvent(event);
        });
        that.displayUnits();
    };

    that._alignSettingsDialog = function() {
        var dialogContainer = dojo.query(".dijitDialog");
        if (dialogContainer.length > 0) {
            dojo.style(dialogContainer[0], 'top', '10px');
        }
    },

    that._setPreferenceValues = function(values) {
        sizesObject = {};
        rally.forEach(values.fieldInfos, function(size) {
            sizesObject[size.planEstimate] = {label: size.label, planEstimate: size.planEstimate};
        });
    };

    that._setDefaultValues = function() {
        sizesObject = {};
        rally.forEach(sizes, function(sizeValue, sizeKey) {
            sizesObject[sizeKey] = {label: sizeValue, planEstimate: sizeKey};
        });
    };

    that._retrievePreferences = function(/*function*/callback) {
        var projectPref;
        if (prefs && prefs.length) {
            dojo.forEach(prefs, function(p) {
                if (p.Project) {
                    //projectOid is a string need both strings to compare.
                    var projectRef = rally.sdk.util.Ref.getOidFromRef(p.Project) + "";
                    if (projectRef === rallyDataSource.projectOid) {
                        projectPref = p;
                        projectPrefRef = projectPref._ref;
                    }
                }
            });
            if (projectPref) {
                that._setPreferenceValues(projectPref.Value);
                callback({projectName:projectPref.Project._refObjectName});
            }
        } else {
            that._setDefaultValues();
            callback({});
        }
    };

    that._numericSort = function(o1, o2) {
        var key1 = parseFloat(o1.planEstimate);
        var key2 = parseFloat(o2.planEstimate);

        if (key1 === key2) {
            return 0;
        }

        return key1 < key2 ? -1 : 1;
    };

    that.display = function() {
        function createForm() {
            accessors = [];
            var rowArr = [];

            //to ensure correct order, we push objects into an array and then apply a custom numeric sort
            rally.forEach(sizesObject, function(size1) {
                rowArr.push(size1);
            });
            rowArr = rowArr.sort(that._numericSort);

            rally.forEach(rowArr, function(size2) {
                var row = that._createTableRow(size2);
                dojo.byId("settingsTableBody").appendChild(row);
            });

            that.displayAddLink();
        }

        that._retrievePreferences(createForm);
    };
};

function EstimationBoard(rallyDataSource, settingsShow, sizes) {
    var cardboard;
    var that = this;
    var checkBoxes = [];

    this._createLayout = function(element) {
        rally.sdk.ui.AppHeader.showPageTools(true);
        rally.sdk.ui.AppHeader.setHelpTopic("236");

        var headerDiv = document.createElement("div");
        element.appendChild(headerDiv);

        var controlDiv = document.createElement("div");
        dojo.addClass(controlDiv, "controlContainer");
        headerDiv.appendChild(controlDiv);

        var checkBoxContainerDiv = document.createElement("div");
        dojo.addClass(checkBoxContainerDiv, "typeFilterContainer");
        controlDiv.appendChild(checkBoxContainerDiv);

        var showSpan = document.createElement("span");
        showSpan.appendChild(document.createTextNode("Show:"));
        checkBoxContainerDiv.appendChild(showSpan);

        var userStoriesSpan = document.createElement("span");
        userStoriesSpan.id = "userStories";
        checkBoxContainerDiv.appendChild(userStoriesSpan);

        var userStoriesCheckBox = new rally.sdk.ui.basic.Checkbox({
            showLabel: true,
            label: "User Stories",
            labelPosition: "after",
            value: "HierarchicalRequirement",
            checked: true
        });
        checkBoxes.push(userStoriesCheckBox);
        userStoriesCheckBox.display(userStoriesSpan);

        var defectsSpan = document.createElement("span");
        defectsSpan.id = "defects";
        checkBoxContainerDiv.appendChild(defectsSpan);

        var defectsCheckBox = new rally.sdk.ui.basic.Checkbox({
            showLabel: true,
            label: "Defects",
            labelPosition: "after",
            value: "Defect"
        });
        checkBoxes.push(defectsCheckBox);
        defectsCheckBox.display(defectsSpan);

        var defectSuitesSpan = document.createElement("span");
        defectSuitesSpan.id = "defectSuites";
        checkBoxContainerDiv.appendChild(defectSuitesSpan);

        var defectSuitesCheckBox = new rally.sdk.ui.basic.Checkbox({
            showLabel: true,
            label: "Defect Suites",
            labelPosition: "after",
            value: "DefectSuite"
        });
        checkBoxes.push(defectSuitesCheckBox);
        defectSuitesCheckBox.display(defectSuitesSpan);

        var clearDiv = document.createElement("div");
        dojo.addClass(clearDiv, "clearFloats");
        headerDiv.appendChild(clearDiv);

        var kanbanBoard = document.createElement("div");
        kanbanBoard.id = "cardBoard";
        dojo.addClass(kanbanBoard, "cardBoard");
        element.appendChild(kanbanBoard);


        //Wire up events
        dojo.forEach(checkBoxes, function(checkBox) {
            checkBox.addEventListener("onChange", that._refreshBoard);
        });

    };

    this._numericSort = function(o1, o2) {
        var key1, key2;

        rally.forEach(o1, function(value1, keyorig1) {
            key1 = parseFloat(keyorig1);
        });
        rally.forEach(o2, function(value2, keyorig2) {
            key2 = parseFloat(keyorig2);
        });

        if (key1 === key2) {
            return 0;
        }

        return key1 < key2 ? -1 : 1;
    };

    this._getColumns = function() {
        var columns = [];
        rally.forEach(sizes, function(label, size) {
            var columnObj = {};
            columnObj[size] = { displayValue: label };
            columns.push(columnObj);
        });

        columns = columns.sort(that._numericSort);
        return columns;
    };

    this._getItems = function(callback) {
        //Build types based on checkbox selections
        var queries = [];
        dojo.forEach(checkBoxes, function(checkBox) {
            if (checkBox.getChecked()) {
                queries.push({key:checkBox.getValue(),
                    type: checkBox.getValue(),
                    fetch: "Name,FormattedID,Owner,ObjectID,Rank,PlanEstimate,Children,Ready,Blocked",
                    query: '(ScheduleState < Accepted)',
                    order: "Rank"
                });
            }
        });

        function bucketItems(results) {
            var items = [];
            rally.forEach(queries, function(query) {
                if (results[query.key]) {
                    rally.forEach(results[query.key], function(item) {
                        //exclude epic stories since estimates cannot be altered
                        if ((item._type !== 'HierarchicalRequirement') ||
                                (item._type === 'HierarchicalRequirement' && item.Children.length === 0)) {
                            items = items.concat(item);
                        }
                    });
                }
            });

            var columns = dojo.clone(cardboard.getColumns());
            columns.shift();
            rally.forEach(items, function(item) {
                item.RealPlanEstimate = item.PlanEstimate;
                if (item.PlanEstimate === null || item.PlanEstimate === undefined) {
                    item.PlanEstimate = 0; //Show in not estimated field
                } else {
                    var bucketed = false;
                    rally.forEach(columns, function(column) {
                        if (!bucketed) {
                            var columnSize = column.getColumnValue();
                            if (item.PlanEstimate <= columnSize) {
                                item.PlanEstimate = columnSize;
                                bucketed = true;
                            }
                        }
                    });

                    if (!bucketed) {
                        item.PlanEstimate = columns[columns.length - 1].getColumnValue();
                    }
                }
            });
            callback(items);
        }

        rallyDataSource.findAll(queries, bucketItems);
    };

    this._refreshBoard = function() {
        var columns = that._getColumns();

        var cardboardConfig = {
            types: [],
            attribute: "PlanEstimate",
            columns: columns,
            maxCardsPerColumn: 200,
            items: that._getItems,
            sortAscending: true,
            order: "Rank",
            enableRanking: false
        };

        //Build types based on checkbox selections
        dojo.forEach(checkBoxes, function(checkBox) {
            if (checkBox.getChecked()) {
                cardboardConfig.types.push(checkBox.getValue());
            }
        });

        if (!cardboard) {
            if (cardboardConfig.types.length === 0) {
                checkBoxes[0].setChecked(true);
                cardboardConfig.types.push(checkBoxes[0].getValue());
            }
            cardboard = new rally.sdk.ui.CardBoard(cardboardConfig, rallyDataSource);
            cardboard.addEventListener("preUpdate", function(c, args) {
                if (parseInt(args.fieldsToUpdate.PlanEstimate, 10) === 0) {
                    args.fieldsToUpdate.PlanEstimate = null;
                }
            });
            cardboard.display("cardBoard");
        } else {
            cardboard.refresh(cardboardConfig);
        }
    };

    this.display = function(element) {
        var settingsDialog = new EstimationBoardSettings(rallyDataSource);

        //Build app layout
        this._createLayout(element);

        //Refresh board
        this._refreshBoard();
    };
}
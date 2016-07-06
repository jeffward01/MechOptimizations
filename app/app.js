
var app = angular.module('AngularAuthApp', ['ui.router', 'LocalStorageModule', 'angular-loading-bar', 'ui.bootstrap', 'ui.bootstrap-slider', 'smoothScroll']);


//custom directives
app.directive('showTab',
function () {
    return {
        link: function (scope, element, attrs) {
            $(element).click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
        }
    };
});
app.filter('timezone', function () {

    return function (val) {
        if (val == null) {
            return;
        }
        var date = new Date(val);
        return new Date(date.getUTCFullYear(),
                        date.getUTCMonth(),
                        date.getUTCDate(),
                        date.getUTCHours(),
                        date.getUTCMinutes(),
                        date.getUTCSeconds());
    };

});

//Jeff Added this filter 3/14/16 for use in detail-Product.html
app.filter('joinBy', function () {
    return function (input, delimiter) {
        return (input || []).join(delimiter || ',');
    };
});

app.filter('displayStat', function () {
    return function (item) {
        item = "Stat";
        return item;
    }
});


app.filter('setDecimal', function ($filter) {
    return function (input, places) {
        if (isNaN(input)) return input;
        // If we want 1 decimal place, we want to mult/div by 10
        // If we want 2 decimal places, we want to mult/div by 100, etc
        // So use the following to create that factor
        var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
        return Math.round(input * factor) / factor;
    };
});

//Jeff Added this filter 3/15/16 for use in Search Bar Assignee
app.filter('unique', function () {
    return function (collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

app.directive('compileTemplate', function ($compile, $parse) {
    return {
        link: function (scope, element, attr) {
            var parsed = $parse(attr.ngBindHtml);
            var getStringValue = function () { return (parsed(scope) || '').toString(); }

            //Recompile if the template changes
            scope.$watch(getStringValue, function () {
                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }
    }
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                if (scope.$parent.insideModal == "AddProducts") {
                    scope.$apply(function () {
                        scope.$eval("searchProductsModal()");
                    });
                } else {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                }

                event.preventDefault();
            }
        });
    };
});


app.directive('awDatepickerPattern', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelCtrl) {
            var dRegex = new RegExp(attrs.awDatepickerPattern);

            ngModelCtrl.$parsers.unshift(function (value) {
                if (value == '' || value.length == 0) {
                    ngModelCtrl.$setValidity('date', true);
                    return value;
                }
                if (typeof value === 'string' && value.length > 1) {


                    var isValid = dRegex.test(value);
                    ngModelCtrl.$setValidity('date', isValid);

                    if (!isValid) {
                        return undefined;
                    }

                }

                return value;
            });

        }
    };
});


app.directive('externalLink',
function () {
    return {
        link: function (scope, element, attrs) {
            $(element).click(function (e) {
                //e.preventDefault();
                return true;
            });
        }
    };
});





app.directive('customfileupload',
function () {
    return {
        link: function (scope, element, attrs) {
            $(element).filestyle(
                {
                    buttonText: 'Select',
                    iconName: 'icon folder'

                });
        }
    };
});

app.directive('elemReady',
    function($parse) {
        return {
            restrict: 'A',
            link: function($scope, elem, attrs) {
                elem.ready(function() {
                    $scope.$apply(function() {
                        var func = $parse(attrs.elemReady);
                        func($scope);
                    });
                });
            }
        }
    });

app.directive('security', ['$compile', 'localStorageService', '$timeout', function ($compile, localStorageService, $timeout) {
    return {
        link: function (scope, element, attrs) {
            var userInfo = localStorageService.get('authenticationData');
            if (userInfo != null) {
                var allowedActions = userInfo.contactActions;
                var actions = attrs.actions.split(',');
                var counter = 0;
                angular.forEach(allowedActions, function (allowedAction) {
                    angular.forEach(actions, function (action) {
                        if (allowedAction.name == action) {
                            counter++;
                        }
                    });
                });
                if (counter == 0) {
                    $(element).remove();
                }
            } else {
                $(element).remove();
            }
        }
    }
}]);


app.directive('securitydisable', ['$compile', 'localStorageService', '$timeout', function ($compile, localStorageService, $timeout) {
    return {
        link: function (scope, element, attrs) {
            $timeout(function () {
                var userInfo = localStorageService.get('authenticationData');
                if (userInfo != null) {
                    var allowedActions = userInfo.contactActions;
                    var actions = attrs.actions.split(',');
                    var counter = 0;
                    angular.forEach(allowedActions, function (allowedAction) {
                        angular.forEach(actions, function (action) {
                            if (allowedAction.name == action) {
                                counter++;
                            }
                        });
                    });
                    if (counter == 0) {
                        $(element).prop("disabled", "disabled");
                    }
                } else {
                    $(element).prop("disabled", "disabled");
                }
            }, 0);
        }
    }
}]);


app.directive('securityhide', ['$compile', 'localStorageService', '$timeout', function ($compile, localStorageService, $timeout) {
    return {
        link: function (scope, element, attrs) {
            var userInfo = localStorageService.get('authenticationData');
            if (userInfo == null) {

                $(element).remove();
            }
        }
    }
}]);


app.directive('securityreadonlyhide', ['$compile', 'localStorageService', '$timeout', function ($compile, localStorageService, $timeout) {
    return {
        link: function (scope, element, attrs) {
            var userInfo = localStorageService.get('authenticationData');
            if (userInfo != null) {
                if (userInfo.roleId < 3) {
                    $(element).remove();
                }

            } else {
                $(element).remove();
            }
        }
    }
}]);


app.directive('breadcrumbs', ['$log', '$parse', '$interpolate', function () {
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            itemDisplayNameResolver: '&'
        },
        templateUrl: 'app/views/directives/breadcrumbs.html',
        controller: ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {

            var defaultResolver = function (state) {

                var displayName = state.data.displayName;

                return displayName;
            };

            var isCurrent = function (state) {
                return $state.$current.name === state.name;
            };

            var setNavigationState = function () {
                $scope.$navigationState = {
                    currentState: $state.$current,
                    params: $stateParams,
                    getDisplayName: function (state) {

                        if ($scope.hasCustomResolver) {
                            return $scope.itemDisplayNameResolver({
                                defaultResolver: defaultResolver,
                                state: state,
                                isCurrent: isCurrent(state)
                            });
                        }
                        else {
                            return defaultResolver(state);
                        }
                    },
                    isCurrent: function (state) {

                        return isCurrent(state);
                    },
                    isException: function () {
                        if ($scope.stateExceptions.indexOf(this.currentState.name) > -1) return true;
                        return false;
                    },

                }
                $scope.emptyName = function () {
                    return function (item) {
                        return item.data.displayName != "";
                    };
                }
                $scope.stateExceptions = ['SearchMyView.DetailProduct', 'SearchMyView.DetailLicense'];
            };

            $scope.$on('$stateChangeSuccess', function () {
                setNavigationState();
            });

            setNavigationState();
        }],
        link: function (scope, element, attrs, controller) {
            scope.hasCustomResolver = angular.isDefined(attrs['itemDisplayNameResolver']);
        }
    };
}]);

app.directive('reportcrumbs', ['$log', '$parse', '$interpolate', function () {
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            itemDisplayNameResolver: '&'
        },
        templateUrl: 'app/views/directives/reportcrumbs.html',
        controller: ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
            var setNavigationState = function () {
                $scope.$navigationState = {
                    currentState: $state.$current,
                    params: $stateParams,

                }
                $scope.emptyName = function () {
                    return function (item) {
                        return item.data.displayName != "";
                    };
                }

            };

            $scope.$on('$stateChangeSuccess', function () {
                setNavigationState();
            });

            setNavigationState();
        }],
        link: function (scope, element, attrs, controller) {
            scope.hasCustomResolver = angular.isDefined(attrs['itemDisplayNameResolver']);
        }
    };
}]);
angular.module('ui.bootstrap-slider', [])
    .directive('sliderCustomScale', [
        '$parse', '$timeout', '$rootScope', function ($parse, $timeout, $rootScope) {
            return {
                restrict: 'AE',
                replace: true,
                template: '<div class="customslider"><input class="slider-input" type="text" /></div>',
                require: 'ngModel',
                scope: {
                    max: "=",
                    min: "=",
                    step: "=",
                    value: "=",
                    ngModel: '=',
                    ngDisabled: '=',
                    range: '=',
                    sliderid: '=',
                    ticks: '=',
                    ticksLabels: '=',
                    ticksPositions: '=',
                    scale: '=',
                    formatter: '&',
                    onStartSlide: '&',
                    onStopSlide: '&',
                    onSlide: '&'
                },
                link: function ($scope, element, attrs, ngModelCtrl, $compile) {
                    var ngModelDeregisterFn, ngDisabledDeregisterFn;

                    initSlider();

                    function initSlider() {
                        var options = {};

                        function setOption(key, value, defaultValue) {
                            options[key] = value || defaultValue;
                        }

                        function setFloatOption(key, value, defaultValue) {
                            options[key] = value ? parseFloat(value) : defaultValue;
                        }

                        function setBooleanOption(key, value, defaultValue) {
                            options[key] = value ? value + '' === 'true' : defaultValue;
                        }

                        function getArrayOrValue(value) {
                            return (angular.isString(value) && value.indexOf("[") === 0) ? angular.fromJson(value) : value;
                        }

                        function setViewValue(value) {
                            if (angular.isArray(value)) {
                                var rangeValue = [$scope.ticksLabels[value[0] - 1], $scope.ticksLabels[value[1] - 1]];
                                ngModelCtrl.$setViewValue(rangeValue);
                            } else {
                                ngModelCtrl.$setViewValue(value);
                            }

                        }

                        setOption('id', $scope.sliderid);
                        setOption('orientation', attrs.orientation, 'horizontal');
                        setOption('selection', attrs.selection, 'before');
                        setOption('handle', attrs.handle, 'round');
                        setOption('tooltip', attrs.sliderTooltip || attrs.tooltip, 'hide');
                        setOption('tooltipseparator', attrs.tooltipseparator, ':');
                        setOption('ticks', $scope.ticks);
                        setOption('ticks_labels', $scope.ticksLabels);
                        if ($scope.ticksPositions)
                            setOption('ticks_positions', $scope.ticksPositions);
                        setOption('scale', $scope.scale, 'linear');

                        setFloatOption('min', $scope.min, 0);
                        setFloatOption('max', $scope.max, 10);
                        setFloatOption('step', $scope.step, 1);
                        var strNbr = options.step + '';
                        var decimals = strNbr.substring(strNbr.lastIndexOf('.') + 1);
                        setFloatOption('precision', attrs.precision, decimals);

                        setBooleanOption('tooltip_split', attrs.tooltipsplit, false);
                        setBooleanOption('enabled', attrs.enabled, true);
                        setBooleanOption('naturalarrowkeys', attrs.naturalarrowkeys, false);
                        setBooleanOption('reversed', attrs.reversed, false);

                        setBooleanOption('range', $scope.range, false);
                        if (options.range) {
                            if (angular.isArray($scope.value)) {
                                options.value = $scope.value;
                            } else if (angular.isString($scope.value)) {
                                options.value = getArrayOrValue($scope.value);
                                if (!angular.isArray(options.value)) {
                                    var value = parseFloat($scope.value);
                                    if (isNaN(value)) value = 5;

                                    if (value < $scope.min) {
                                        value = $scope.min;
                                        options.value = [value, options.max];
                                    } else if (value > $scope.max) {
                                        value = $scope.max;
                                        options.value = [options.min, value];
                                    } else {
                                        options.value = [options.min, options.max];
                                    }
                                }
                            } else {
                                options.value = [options.min, options.max]; // This is needed, because of value defined at $.fn.slider.defaults - default value 5 prevents creating range slider
                            }

                            $scope.ngModel = [$scope.ticksLabels[options.value[0] - 1], $scope.ticksLabels[options.value[1] - 1]]; // needed, otherwise turns value into [null, ##]
                        } else {
                            setFloatOption('value', $scope.value, 5);
                        }

                        if ($scope.formatter) options.formatter = $scope.$eval($scope.formatter);

                        var slider = $(element).find(".slider-input").eq(0);

                        // check if slider jQuery plugin exists
                        if ($.fn.slider) {
                            // adding methods to jQuery slider plugin prototype
                            $.fn.slider.constructor.prototype.disable = function () {
                                this.picker.off();
                            };
                            $.fn.slider.constructor.prototype.enable = function () {
                                this.picker.on();
                            };

                            // destroy previous slider to reset all options
                            if (slider.data("slider"))
                                slider.slider('destroy');

                            slider.slider(options);
                            //slider.click();
                            // everything that needs slider element
                            var updateEvent = getArrayOrValue(attrs.updateevent);
                            if (angular.isString(updateEvent)) {
                                // if only single event name in string
                                updateEvent = [updateEvent];
                            } else {
                                // default to slide event
                                updateEvent = ['slide'];
                            }
                            angular.forEach(updateEvent, function (sliderEvent) {
                                slider.on(sliderEvent, function (ev) {
                                    setViewValue(ev.value);
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                });
                            });
                            slider.on('change', function (ev) {
                                setViewValue(ev.value.newValue);
                                $timeout(function () {
                                    $scope.$apply();
                                });
                            });

                            // Event listeners
                            var sliderEvents = {
                                slideStart: 'onStartSlide',
                                slide: 'onSlide',
                                slideStop: 'onStopSlide'
                            };
                            angular.forEach(sliderEvents, function (sliderEventAttr, sliderEvent) {
                                slider.on(sliderEvent, function () {
                                    if ($scope[sliderEventAttr]) {
                                        if ($rootScope.$$phase) {
                                            $scope.$evalAsync($scope[sliderEventAttr]);
                                        } else {
                                            $scope.$apply($scope[sliderEventAttr]);
                                        }
                                    }
                                });
                            });

                            // deregister ngDisabled watcher to prevent memory leaks
                            if (angular.isFunction(ngDisabledDeregisterFn)) {
                                ngDisabledDeregisterFn();
                                ngDisabledDeregisterFn = null;
                            }

                            ngDisabledDeregisterFn = $scope.$watch('ngDisabled', function (value) {
                                if (value) {
                                    slider.slider('disable');
                                } else {
                                    slider.slider('enable');
                                }
                            });

                            // deregister ngModel watcher to prevent memory leaks
                            if (angular.isFunction(ngModelDeregisterFn)) ngModelDeregisterFn();
                            ngModelDeregisterFn = $scope.$watch('ngModel', function (value) {
                                if ($scope.range) {
                                    var min = options.min;
                                    var max = options.max;
                                    if (value && value.length > 0) {
                                        min = $scope.ticksLabels.indexOf(value[0]) + 1;
                                        max = $scope.ticksLabels.indexOf(value[1]) + 1;
                                    }
                                    slider.slider('setValue', [min, max]);
                                } else {
                                    slider.slider('setValue', parseFloat(value));
                                }
                            }, true);
                        }
                    }

                    var watchers = ['min', 'max', 'step', 'range', 'scale'];
                    angular.forEach(watchers, function (prop) {
                        $scope.$watch(prop, function () {
                            initSlider();
                        });
                    });
                }
            };
        }
    ]);
app.directive('multiselectDropdown', function () {
    return {
        link: function (scope, element, attrs, controller) {
            $(element).click(function (e) {
                e.stopPropagation();
            });

        }
    };
});
//JEff cecheck this later
app.directive('advancedDropdown', function () {

    return {
        scope: {
            dropdownAfterShow: '=dropdownAfterShow'
        },
        link: function (scope, element, attrs, controller) {
            var menu = $(element).parent().find(".advanced-dropdown-menu");
            var firstCall = true;
            $(element).click(function (e) {
                e.stopPropagation();
                menu.toggle();
                menu.toggleClass("open");
                if (firstCall && scope.dropdownAfterShow) scope.$apply(scope.dropdownAfterShow);
                firstCall = false;
                var closeHandler = $("body").data("closeHandler");
                if (menu.hasClass("open") && !closeHandler) {
                    $("body").data("closeHandler", true);
                    $('body').one('click', function (e) {
                        var element = $(e.target);
                        var parent = element.parent();
                        if (!element.hasClass("dropdown-toggle") && !parent.hasClass("dropdown-toggle")) {
                            $(".open").each(function (index, el) {
                                $(el).toggle();
                                $(el).removeClass("open");
                            });
                            $("body").data("closeHandler", false);
                        }
                    });
                }
            });
            menu.find(".dropdown-toggle").click(function (e) {
                var currentToggle = $(e.currentTarget);
                var parent = currentToggle.closest(".dropdown");
                var dropMenu = parent.find(".dropdown-menu-form");
                menu.find(".dropdown-menu-form.open").each(function (index, el) {
                    if (!$(el).is(dropMenu)) {
                        $(el).toggle();
                        $(el).removeClass("open");
                    }
                });
                dropMenu.toggle();
                dropMenu.toggleClass("open");
                //e.stopPropagation();
            });
            menu.find(".dropdown-menu-form").click(function (e) {
                e.stopPropagation();
            });
            menu.click(function (e) {
                var subItem = $(e.target);
                var subParent = subItem.parent();
                if (!subItem.hasClass("dropdown-toggle"))
                    e.stopPropagation();
                menu.find(".dropdown-menu-form.open.open").each(function (index, el) {
                    $(el).toggle();
                    $(el).removeClass("open");
                });
            });
        }
    };
});

app.directive('stickyHeaders', ['$timeout', function ($timeout) {
    return {
        scope: {
            stickyHeaders: '='
        },
        link: function (scope, element, attrs) {
            var table = jQuery(element);
            var columnHeaders = table.find(" > thead > tr > th");
            var columnHeaderCount = columnHeaders.length;
            var sizeArray = new Array();
            for (var i = 0; i < columnHeaderCount; i++) {
                sizeArray.push(0);
            }

            scope.$watchCollection('stickyHeaders', function (newVal, oldVal) {
                if (newVal)
                    $timeout(resize, 50);
            });
            function resize() {
                for (var i = 0; i < columnHeaderCount; i++) {
                    sizeArray[i] = 0;
                }

                var headers = table.find("> thead > tr");
                angular.forEach(headers, function (header, index) {
                    var columns = $(header).find("th");
                    angular.forEach(columns, function (column, index) {
                        $(column).css('width', '0px');
                    });
                });
                angular.forEach(headers, function (header) {
                    var columns = $(headers).find("th");
                    angular.forEach(columns, function (column, index) {
                        var currentWidth = column.clientWidth;
                        if (currentWidth > sizeArray[index]) sizeArray[index] = currentWidth;
                    });
                });

                var rows = table.find("> tbody > tr");
                angular.forEach(rows, function (row) {
                    var columns = $(row).find("td");
                    angular.forEach(columns, function (column, index) {
                        var currentWidth = column.clientWidth;
                        if (currentWidth > sizeArray[index]) sizeArray[index] = currentWidth;
                    });
                });

                var table2 = table.find(">");
                var totalSize = table2[0].offsetWidth;
                var size = 0;
                for (var i = 0; i < columnHeaderCount; i++) {
                    size += sizeArray[i];
                }

                var remainingLength = totalSize - size
                var remainingLengthPerField = remainingLength / columnHeaderCount;

                angular.forEach(headers, function (header, index) {
                    var columns = $(header).find("th");
                    angular.forEach(columns, function (column, index) {
                        $(column).css('width', sizeArray[index] + remainingLengthPerField + 'px');
                    });
                });

                angular.forEach(rows, function (row) {
                    var columns = $(row).find("td");
                    angular.forEach(columns, function (column, index) {
                        $(column).css('width', sizeArray[index] + remainingLengthPerField + 'px');
                    });

                });
            }
            $(window).resize(function () {
                resize();
            });
        }
    };
}]);
app.filter('slice', function () {
    return function (arr, start, end) {
        return (arr || []).slice(start, end);
    };
});

app.filter('isSingleSelected', function () {
    return function (arr) {
        var array = arr || [];
        var selectedNo = array.filter(function singledFilter(category) {
            return category.selected == true;
        });
        return selectedNo.length != 1;
    };
});
app.filter('isMore1Selected', function () {
    return function (arr) {
        var array = arr || [];
        var selectedNo = array.filter(function singledFilter(category) {
            return category.selected == true;
        });
        return selectedNo.length > 1;
    };
});
app.filter('countSelected', function () {
    return function (arr) {
        var array = arr || [];
        var selectedNo = array.filter(function singledFilter(category) {
            return category.selected == true;
        });
        return selectedNo.length;
    };
});
app.filter('unique', function () {
    return function (collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});
app.filter('uniqueSimpleArray', function () {
    return function (collection) {
        var output = [],
            keys = [];

        angular.forEach(collection, function (item) {
            var key = item;
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

app.filter('returnConfigurationIcon', function () {
    return function (configurationId) {
        var cssClass = "";


        switch (configurationId) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 11:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 30:
            case 31:
            case 32:
            case 33:
            case 36:
            case 38:
            case 48:
            case 49:
            case 50:
            case 51:
                cssClass = "icon config-physical";
                break;

            case 10:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 25:
            case 26:
            case 27:
            case 28:
            case 29:
            case 34:
            case 35:
            case 37:
            case 39:
            case 40:
            case 41:
            case 42:
            case 43:
            case 44:
            case 45:
            case 46:
            case 47:
            case 52:

                cssClass = "icon config-digital";
                break;

        }

        return cssClass;
    };
});


app.filter('isNoneSelected', function () {
    return function (arr) {
        var array = arr || [];
        var selectedNo = array.filter(function singledFilter(category) {
            return category.selected == true;
        });
        return selectedNo.length == 0;
    };
});

app.filter('isAllSelected', function () {
    return function (arr) {
        var array = arr || [];
        if (array.length == 0) return false;
        var unselected = USL.Common.FirstInArray(array, 'selected', false);
        if (!unselected) return true;
        return false;
    };
});
app.filter('onlySelected', function () {
    return function (arr) {
        var array = arr || [];
        return array.filter(function (item) {
            return item.selected;
        });
    };
});
app.filter('selectAll', function () {
    return function (arr, value) {
        var array = arr || [];
        angular.forEach(array, function (item) {
            item.selected = value;
        });
    };
});
app.filter("isEmpty", function () {
    return function (input) {
        if (!input) return true;
        return false;
    };

});
app.filter("format", function () {
    return function (input) {
        var args = arguments;
        return input.replace(/\{(\d+)\}/g, function (match, capture) {
            return args[1 * capture + 1];
        });
    };
});

// This filter makes the assumption that the input will be in decimal form (i.e. 17%).
app.filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input, decimals) + '%';
    };
}]);

app.directive('editColumns', ['$filter', function ($filter) {
    return {
        scope: {
            editColumns: '=',
            hidden: '=hiddenColumns',
            resultData: '=resultsData'
        },
        link: function (scope, element, attrs) {
            var table = jQuery(element);
            var columns = table.find(" > thead > tr > th");
            angular.forEach(columns, function (value, key) {
                var elm = jQuery(value);
                if (!elm.data("type")) {
                    var visible = !elm.data("visible") || elm.data("visible") == "true" ? true : false;
                    var defaultVal = elm.data("default") ? true : false;
                    var item = { name: elm.text(), key: key, selected: visible, isDefault: defaultVal };
                    scope.editColumns.push(item);
                    if (!visible)
                        hidden.push(item);
                }
            });
            scope.$watchCollection('hidden', function (newVal, oldVal) {
                redrawTable(newVal);
                angular.forEach(scope.editColumns, function (item) {
                    var isUnselected = USL.Common.FirstInArray(scope.hidden, 'key', item.key);
                    if (isUnselected) item.selected = false;
                });
            });
            scope.$watchCollection('resultData', function (newVal, oldVal) {
                redrawTable(scope.hidden);
            });

            function redrawTable(newVal) {
                var hiddenColumns = USL.Common.SingleFieldArray(newVal, 'key', false);
                table.find("> thead > tr > th").each(function (i, item) {
                    if (hiddenColumns.indexOf(i) != -1) {
                        jQuery(item).hide();
                    } else {
                        jQuery(item).show();
                    }
                });
                table.find("> tbody > tr.editColumnsSelectable").each(function (i, el) {
                    jQuery(el).find("> td").each(function (ii, item) {
                        if (hiddenColumns.indexOf(ii) != -1) {
                            jQuery(item).hide();
                        } else {
                            jQuery(item).show();
                        }
                    });
                });
            }
        }
    };
}]);

app.directive('digitsOnly', function () {
    // type: 123 or 123.45 or .123
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {

                if (newValue) {
                    if (newValue.length === 1 && newValue === '.') return;

                    if (isNaN(newValue)) {
                        ngModel.$setViewValue(oldValue);
                        ngModel.$render();
                    }
                }

            });
        }
    };
});

app.directive('lettersOnly', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {

                if (newValue) {
                    if (!/^[a-zA-Z ]*$/.test(newValue)) {
                        ngModel.$setViewValue(oldValue);
                    }
                    else {
                        ngModel.$setViewValue(newValue);
                    }
                    ngModel.$render();
                }
            });
        }
    };
});

app.directive('phoneNumber', function () {
    // type: 123 or 123.45 or .123
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, $element, attrs, ngModel) {
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {

                var changed = $element[0].classList.contains('ng-dirty');

                if (newValue) {
                    if (newValue.length === 1 && newValue === '+') return;

                    if (isNaN(newValue)) {
                        ngModel.$setViewValue(oldValue);
                        ngModel.$render();
                        changed = false;
                    }

                    if (newValue.length < 3 && changed) {
                        $element[0].classList.add("field-error");
                    }
                    else {
                        $element[0].classList.remove("field-error");
                    }
                }
            });
        }
    };
});

app.directive('emailAddress', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, $element, $attrs, ngModel) {
            $scope.$watch($attrs.ngModel, function (value) {
                var isValid = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value);
                ngModel.$setValidity($attrs.ngModel, isValid);

                if (value && !isValid && $element[0].classList.contains('ng-dirty')) {
                    $element[0].classList.add("field-error");
                }
                else {
                    $element[0].classList.remove("field-error");
                }
            });
        }
    }
});

app.directive('underValue', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, $element, $attrs, ngModel) {
            $scope.$watch($attrs.ngModel, function (value) {
                var isValid = Number(value) > 0 && Number(value) <= $attrs.underValue;
                ngModel.$setValidity($attrs.ngModel, isValid);

                if (!isValid && $element[0].classList.contains('ng-dirty')) {
                    $element[0].classList.add("field-error");
                }
                else {
                    $element[0].classList.remove("field-error");
                }
            });
        }
    }
});


//This turns off Angular debugging tools which makes angular faster for production
//app.config(function ($stateProvider, $urlRouterProvider, $compileProvider) {
app.config(function ($stateProvider) {
    //  $compileProvider.debugInfoEnabled(false);  <-- This causes an angular error

    //__Routing Below__

    //$routeProvider.when("/home", {
    //    controller: "licensesController",
    //    templateUrl: "/app/views/home.html"
    //});
    
    
    
    
    $stateProvider.state('Licenses', {
        url: "/search-MyView",
        templateUrl: { '@': { controller: "licensesController", templateUrl: "/app/views/search-MyView.html" } },
        controller: "licensesController",
        data:
        {
            displayName: 'License Search'
        }
    }).state('Licenses.Details', {
        url: "/search-MyView",
        views: { '@': { controller: "licensesController", templateUrl: "/app/views/search-MyView.html" } },
        data: {
            displayName: "License Details"
        }
    });

    $stateProvider.state('SearchLicenses', {
        url: "/search-Licenses",
        templateUrl: "/app/views/search-Licenses.html",
        controller: "licensesController",
        data:
        {
            displayName: 'License Search'
        }
    });

    $stateProvider.state('Admin', {
        url: "/admin",
        templateUrl: "/app/views/admin.html",
        controller: "adminController",
        data:
        {
            displayName: 'Admin'
        }
    });

    $stateProvider.state('Contacts', {
        url: "/contact/edit",
        templateUrl: "/app/views/contact/contact.html",
        controller: "contactsController",
        data:
        {
            displayName: 'Contact'
        }
    });

    $stateProvider.state('SearchMyView', {
        url: "/search-MyView",
        templateUrl: "/app/views/search-MyView.html",
        controller: "globalController",
        data:
        {
            displayName: ''
        }
    }).state('SearchMyView.Tabs', {
        url: "/Tabs",
        templateUrl: "/app/views/partials/tabs-Partial.html",
        //controller: "globalController",
        data:
        {
            displayName: ''
        }
    }).state('SearchMyView.DetailProduct', {
        url: "/detail-Product/{productId}",
        templateUrl: "/app/views/detail-Product.html",
        controller: "productDetailsController",
        data:
        {
            displayName: 'Product Details'
        }
    }).state('SearchMyView.DetailLicense', {
        url: "/detail-License/{licenseId}/{myView}",
        templateUrl: "/app/views/detail-License.html",
        controller: "licenseDetailsController",
        data:
        {
            displayName: 'License Details'
        },
        params:
        {
            myView: ''

        }
    }).state('SearchMyView.DetailMyLicense', {
        url: "/detail-MyLicense/{licenseId}/:myview",
        templateUrl: "/app/views/detail-License.html",
        controller: "licenseDetailsController",
        data:
        {
            displayName: 'License Details'
        }
    }).state("SearchMyView.DetailLicense.StepsModal", createModalStateObject()).state("SearchMyView.DetailLicense.StepsModal.AddProducts", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Add Products'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddProducts.html",
                controller: "addProductsController"

            }
        }
    }).state("SearchMyView.DetailLicense.StepsModal.CreateLicense", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Create License'
        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                controller: "licenseInfoController"
            }
        }
    }).state("SearchMyView.DetailLicense.StepsModal.EditLicense", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Edit License',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                    controller: "licenseInfoController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.EditRates", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Edit Rates',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-EditRates.html",
                    controller: "editRatesController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.CreateProduct", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Create Product',
        }, params: { licenseData: null, products: null, productId: null, isCreate: true },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                controller: "productInfoController"
            }
        }
    }).state("SearchMyView.DetailLicense.StepsModal.CreateProductAddTracks", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Add Tracks',
        }, params: { licenseData: null, products: null, productId: null },
        //        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddTracks.html",
                controller: "addTracksController"
            }
        }
    }).state("SearchMyView.DetailLicense.StepsModal.EditConfigs", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Edit Configs',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-EditConfigs.html",
                    controller: "editConfigurationsController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.GenerateDocument", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Generate Document',

        },
        params: { licenseData: null, actionId: "", products: null, files: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-IssueLicense.html",
                    controller: "generateDocController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.ExecuteDocument", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Execute Document'

        },
        params: { licenseData: null, actionId: "", products: null, files: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-ExecuteLicense.html",
                    controller: "executeLicenseController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.GenerateDocumentPreview", {
        parent: 'SearchMyView.DetailLicense.StepsModal',
        data:
        {
            displayName: 'Generate Document',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-LicensePreview.html",
                    controller: "issueLicenseController"
                }
            }
    }).state("SearchMyView.DetailLicense.StepsModal.GenerateDirectDocumentPreview", {
        data:
        {
            displayName: 'Generate Direct Document',

        },
        params: { licenseData: null, actionId: "", products: null, otherValues: null },
        views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-LicensePreview.html",
                    controller: "issueLicenseController"
                }
            }
    })
        .state("SearchMyView.DetailLicense.StepsModal.EditWriterRate", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Edit Writer Rate'

            },
            params: { license: null, licenseTypeId: null, licenseId: null, writer: null, productId: null, recordingId: null, songDuration: null, claimException: null, statsRollup: null, trackStatsRollup: null },
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-EditWriterRate.html",
                        controller: "editWriterRates"
                    }
                }
        }).state("SearchMyView.DetailLicense.StepsModal.AddWriterNote", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Add Writer Note'

            },
            params: { writer: null},
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-AddWriterNote.html",
                        controller: "addWriterNoteController"
                    }
                }
        }).state("SearchMyView.DetailLicense.StepsModal.EditWriterNote", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'View/Edit Writer Note'

            },
            params: { writer: null, writerNotes: null, buttons:null},
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-EditWriterNote.html",
                        controller: "editWriterNoteController"
                    }
                }
        }).state("SearchMyView.DetailLicense.StepsModal.UploadDocument", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Upload Document'

            },
            params: { licenseId: null, files: null },
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-UploadDoc.html",
                        controller: "uploadDocController",
                        //size:'sm'
                    }
                }

            //});
        }).state("SearchMyView.DetailLicense.StepsModal.WritersConsent", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Writers Consent'

            },
            params: { config: null, files: null, recording: null, writer: null, product: null },
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-WritersConsent.html",
                        controller: "writersConsentController"
                    }
                }
        }).state("SearchMyView.DetailLicense.StepsModal.WritersIsIncluded", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Writers Is Included'

            },
            params: { config: null, files: null, recording: null, writer: null, product: null, rate1: null },
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-LicenseWriter.html",
                        controller: "licenseWriterController"
                    }
                }
        }).state("SearchMyView.DetailLicense.StepsModal.PaidQuarter", {
            parent: 'SearchMyView.DetailLicense.StepsModal',
            data:
            {
                displayName: 'Edit Paid Quarter'

            },
            params: { licenesId: null, config: null, recording: null, writer: null, product: null },
            views:
                {
                    "modalView@":
                    {
                        templateUrl: "/app/views/partials/modal-PaidQuarter.html",
                        controller: "padiQuarterController"
                    }
                }
        }).state("SearchMyView.DetailProduct.StepsModal", createModalStateObject()).state("SearchMyView.DetailProduct.StepsModal.EditProduct", {
            parent: 'SearchMyView.DetailProduct.StepsModal',
            data:
            {
                displayName: 'Edit Product',
            }, params: { licenseData: null, products: null, productId: null },
            views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                    controller: "productInfoController"
                }
            }
        }).state("SearchMyView.DetailProduct.StepsModal.CreateProduct", {
            parent: 'SearchMyView.DetailProduct.StepsModal',
            data:
            {
                displayName: 'Create Product',
            }, params: { licenseData: null, products: null, productId: null, isCreate: true },
            views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                    controller: "productInfoController"
                }
            }
        })
    .state("SearchMyView.DetailProduct.StepsModal.CreateProductAddTracks", {
        parent: 'SearchMyView.DetailProduct.StepsModal',
        data:
        {
            displayName: 'Add Tracks',
        }, params: { licenseData: null, products: null, productId: null },
        //        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddTracks.html",
                controller: "addTracksController"
            }
        }
    }).state("SearchMyView.DetailProduct.StepsModal.CreateLicense", {
        parent: 'SearchMyView.DetailProduct.StepsModal',
        data:
        {
            displayName: 'Create License'
        },
        params: { products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                controller: "licenseInfoController"
            }
        }
    }).state("SearchMyView.DetailProduct.StepsModal.EditLicense", {
        parent: 'SearchMyView.DetailProduct.StepsModal',
        data:
        {
            displayName: 'Edit License',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
         {
             "modalView@":
             {
                 templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                 controller: "licenseInfoController"
             }
         }
    }).state("SearchMyView.DetailProduct.StepsModal.AddProducts", {
        parent: 'SearchMyView.DetailProduct.StepsModal',
        data:
        {
            displayName: 'Add Products'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddProducts.html",
                controller: "addProductsController"

            }
        }

    }).state("SearchMyView.DetailProduct.StepsModal.EditConfigs", {
        parent: 'SearchMyView.DetailProduct.StepsModal',
        data:
        {
            displayName: 'Edit Config'
        },
        params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-EditConfigs.html",
                controller: "editConfigurationsController"
            }
        }
    });;


    $stateProvider.state('SearchMyView.Tabs.ProductsTab', {
        url: "/ProductsTab",
        templateUrl: "/app/views/partials/search-GridProducts.html",
        controller: "productsController",
        data:
        {
            displayName: 'Product Search'
        }
    }).state("SearchMyView.Tabs.ProductsTab.StepsModal", createModalStateObject()).state("SearchMyView.Tabs.ProductsTab.StepsModal.CreateLicense", {
        parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
        data:
        {
            displayName: 'Create License'
        },
        params: { products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                controller: "licenseInfoController"
            }
        }
    })
       .state("SearchMyView.Tabs.ProductsTab.StepsModal.CreateProduct", {
           parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
           data:
           {
               displayName: 'Create Product',
               //            controller: "productInfoController"
           },
           params: { licenseData: null, products: null, productId: null },
           views:
           {
               "modalView@":
               {
                   templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                   controller: "productInfoController"
               }
           }
       }).state("SearchMyView.Tabs.ProductsTab.StepsModal.CreateProductAddTracks", {
           parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
           data:
           {
               displayName: 'Add Tracks',
           },
           params: { licenseData: null, products: null, productId: null },
           //        },
           views:
           {
               "modalView@":
               {
                   templateUrl: "/app/views/partials/modal-step-AddTracks.html",
                   controller: "addTracksController"
               }
           }
       }).state("SearchMyView.Tabs.ProductsTab.StepsModal.CopyProduct", {
           parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
           data:
           {
               displayName: 'Create License'
           },
           views:
           {
               "modalView@":
               {
                   templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                   controller: "licenseInfoController"
               }
           }
       }).state("SearchMyView.Tabs.ProductsTab.StepsModal.AddProductsInProducts", {
           parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
           data:
           {
               displayName: 'Add Products'
           },
           params: { licenseData: null, products: null },
           views:
           {
               "modalView@":
               {
                   templateUrl: "/app/views/partials/modal-step-AddProducts.html",
                   controller: "addProductsController"
               }
           }
       }).state("SearchMyView.Tabs.ProductsTab.StepsModal.EditConfigsInProducts", {
           parent: 'SearchMyView.Tabs.ProductsTab.StepsModal',
           data:
           {
               displayName: 'Edit Config'
           },
           params: { licenseData: null, products: null },
           views:
           {
               "modalView@":
               {
                   templateUrl: "/app/views/partials/modal-EditConfigs.html",
                   controller: "editConfigurationsController"
               }
           }
       });

    $stateProvider.state('SearchMyView.Tabs.LicenseTab', {
        url: "/LicenseTab",
        templateUrl: "/app/views/partials/search-GridLicenses.html",
        controller: "licensesController",
        data:
        {
            displayName: 'License Search'
        }
    }).state("SearchMyView.Tabs.LicenseTab.StepsModal", createModalStateObject()).state("SearchMyView.Tabs.LicenseTab.StepsModal.AddProducts", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Add Products'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddProducts.html",
                controller: "addProductsController"

            }
        }

    }).
    state("SearchMyView.Tabs.LicenseTab.StepsModal.CreateProduct", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Create Product',
        }, params: { licenseData: null, products: null, productId: null, isCreate: true },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                controller: "productInfoController"
            }
        }
    }).
    state("SearchMyView.Tabs.LicenseTab.StepsModal.CreateProductAddTracks", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Add Tracks',
        }, params: { licenseData: null, products: null, productId: null },
        //        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddTracks.html",
                controller: "addTracksController"
            }
        }
    })
    .state("SearchMyView.Tabs.LicenseTab.StepsModal.EditConfigs", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Edit Config'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-EditConfigs.html",
                controller: "editConfigurationsController"
            }
        }
    }).state("SearchMyView.Tabs.LicenseTab.StepsModal.CreateLicense", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Create License'
        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                controller: "licenseInfoController"
            }
        }
    }).state("SearchMyView.Tabs.LicenseTab.StepsModal.EditLicense", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Edit License',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
         {
             "modalView@":
             {
                 templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                 controller: "licenseInfoController"
             }
         }
    }).state("SearchMyView.Tabs.LicenseTab.StepsModal.EditRates", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Edit Rates',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
         {
             "modalView@":
             {
                 templateUrl: "/app/views/partials/modal-EditRates.html",
                 controller: "editRatesController"
             }
         }
    }).state("SearchMyView.Tabs.LicenseTab.StepsModal.NewNote", {
        parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Edit Rates',

        },
        params: { licenseData: null, actionId: "", products: null },
        views:
         {
             "modalView@":
             {
                 templateUrl: "/app/views/partials/modal-EditRates.html",
                 controller: "editRatesController"
             }
         }
    });
    /*
    $stateProvider.state("SearchMyView.DetailLicense.StepsModal", {
        abstract: true,
        url: '',
        data: {
            modalInstance: null
        },
        onEnter: ['$modal', '$state', function ($modal, $state) {
            this.data.modalInstance = $modal.open({
                template: '<div ui-view="modalView"></div>',
                controller: 'editConfigurationsController',
                backdrop: 'static',
                size: 'lg'
            });
        }],
        onExit: ['$modal', '$state', function ($modal, $state) {
            this.data.modalInstance.dismiss();
        }]
    });
    */

    $stateProvider.state("DetailLicense.EditConfigs", {
        //parent: 'SearchMyView.Tabs.LicenseTab.StepsModal',
        data:
        {
            displayName: 'Edit Config'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-EditConfigs.html",
                controller: "editConfigurationsController"
            }
        }
    });

    $stateProvider.state('SearchMyView.Tabs.MyViewTab', {
        url: "/MyViewTab",
        templateUrl: "/app/views/partials/search-GridMyView.html",
        controller: "licensesController",
        data:
        {
            displayName: ''
        }
    }).state("SearchMyView.Tabs.MyViewTab.StepsModal", createModalStateObject()).state("SearchMyView.Tabs.MyViewTab.StepsModal.AddProducts", {
        parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
        data:
        {
            displayName: 'Add Products'
        }, params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddProducts.html",
                controller: "addProductsController"

            }
        }

    }).state("SearchMyView.Tabs.MyViewTab.StepsModal.CreateProduct", {
        parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
        data:
        {
            displayName: 'Create Product',
        }, params: { licenseData: null, products: null, productId: null, isCreate: true },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-ProductInfo.html",
                controller: "productInfoController"
            }
        }
    }).state("SearchMyView.Tabs.MyViewTab.StepsModal.CreateProductAddTracks", {
        parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
        data:
        {
            displayName: 'Add Tracks',
        }, params: { licenseData: null, products: null, productId: null },
        //        },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-step-AddTracks.html",
                controller: "addTracksController"
            }
        }
    }).

        state("SearchMyView.Tabs.MyViewTab.StepsModal.EditConfigs", {
            parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
            data:
            {
                displayName: 'Edit Config'
            }, params: { licenseData: null, products: null },
            views:
            {
                "modalView@":
                {
                    //templateUrl: "/app/views/partials/modal-EditConfigs.html",
                    //controller: "editConfigurationsController"
                    //templateUrl: "/app/views/partials/modal-step-AddConfigurations.html",
                    templateUrl: "/app/views/partials/modal-EditConfigs.html",
                    //controller: "addConfigurationsController"
                    controller: "editConfigurationsController"
                }
            }
        }).state("SearchMyView.Tabs.MyViewTab.StepsModal.CreateLicense", {
            parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
            data:
            {
                displayName: 'Create License'
            },
            views:
            {
                "modalView@":
                {
                    templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                    controller: "licenseInfoController"
                }
            }
        }).state("SearchMyView.Tabs.MyViewTab.StepsModal.EditLicense", {
            parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
            data:
            {
                displayName: 'Edit License',

            },
            params: { licenseData: null, actionId: "", products: null },
            views:
             {
                 "modalView@":
                 {
                     templateUrl: "/app/views/partials/modal-step-LicenseInfo.html",
                     controller: "licenseInfoController"
                 }
             }
        }).state("SearchMyView.Tabs.MyViewTab.StepsModal.EditRates", {
            parent: 'SearchMyView.Tabs.MyViewTab.StepsModal',
            data:
            {
                displayName: 'Edit Rates',

            },
            params: { licenseData: null, actionId: "", products: null },
            views:
             {
                 "modalView@":
                 {
                     templateUrl: "/app/views/partials/modal-EditRates.html",
                     controller: "editRatesController"
                 }
             }
        });

    $stateProvider.state("LoginModal", {
        abstract: true,
        url: '',
        view: {},
        data: {
            modalInstance: null
        },
        onEnter: [
            '$modal', '$state', function ($modal, $state) {
                this.data.modalInstance = $modal.open({
                    template: '<div ui-view="modalView"></div>',
                    controller: 'loginContainerController',
                    backdrop: 'static',
                    size: 'md'
                });
            }
        ],
        onExit: [
            '$modal', '$state', function ($modal, $state) {
                this.data.modalInstance.dismiss();
            }
        ]
    }).state("LoginModal.Login", {
        url: '/login',
        parent: 'LoginModal',
        data:
        {
            displayName: 'Login'
        },
        params: { licenseData: null, products: null },
        views:
        {
            "modalView@":
            {
                templateUrl: "/app/views/partials/modal-Login.html",
                controller: "loginController"
            }
        }
    });

    $stateProvider.state('Signup', {
        url: "/signup",
        templateUrl: "/app/views/signup.html",
        controller: "signupController",
        data:
        {
            displayName: 'Signup'
        }
    });
    ////States for reports


    $stateProvider.state('SearchReports', {
        url: "/search-Reports",
        templateUrl: "/app/views/search-Reports.html",
        controller: "globalReportsController",
        data:
        {
            displayName: ''
        }
    }).state('SearchReports.Tabs', {
        url: "/Tabs",
        templateUrl: "/app/views/partials/tabsReports-Partial.html",
        //controller: "globalController",
        data:
        {
            displayName: ''
        }
    });

    $stateProvider.state('SearchReports.Tabs.Priority', {
        url: "/Priority",
        templateUrl: "/app/views/partials/search-ReportsGridPriority.html",
        controller: "productsReportsController",
        data:
        {
            displayName: ''
        }
    });

    $stateProvider.state('SearchReports.Tabs.Mechanical', {
        url: "/Mechanical",
        templateUrl: "/app/views/partials/search-ReportsGridMechanical.html",
        controller: "licensesMechanicalController",
        data:
        {
            displayName: ''
        }
    });

    $stateProvider.state('SearchReports.Tabs.Consent', {
        url: "/Consent",
        templateUrl: "/app/views/partials/search-ReportsGridConsent.html",
        controller: "licensesConsentController",
        data:
        {
            displayName: ''
        }
    });

    //? is this necessary
    /*
    $stateProvider.state('SearchProducts', {
        url: "/search-Products",
        templateUrl: "/app/views/search-Products.html",
        controller: "editConfigurationsController",
        data:
        {
            displayName: 'Product Search'
        }
    });
    */

    /* old initial oAuth stuff
    $stateProvider.state('Login', {
        url: "/login",
        templateUrl: "/app/views/login.html",
        //templateUrl: 'app/views/partials/modal-Login.html',
        controller: "/app/controllers/loginController",
        data:
        {
            displayName: 'Login'
        }
    });
   
    $stateProvider.state('Orders', {
        url: "/orders",
        templateUrl: "/app/views/orders.html",
        controller: "ordersController",
        data:
        {
            displayName: 'Orders'
        }
    });
    $stateProvider.state('Refresh', {
        url: "/refresh",
        templateUrl: "/app/views/refresh.html",
        controller: "refreshController",
        data:
        {
            displayName: 'Refresh'
        }
    });
    $stateProvider.state('Tokens', {
        url: "/tokens",
        templateUrl: "/app/views/tokens.html",
        controller: "tokensManagerController",
        data:
        {
            displayName: 'Tokens'
        }
    });
    $stateProvider.state('Associate', {
        url: "/associate",
        templateUrl: "/app/views/associate.html",
        controller: "associateController",
        data:
        {
            displayName: 'Associate'
        }
    });
    $stateProvider.state('Contacts', {
        url: "/signup",
        templateUrl: "/app/views/contacts.html",
        controller: "contactsController",
        data:
        {
            displayName: 'Contacts'
        }
    });
    $stateProvider.state('Songs', {
        url: "/signup",
        templateUrl: "/app/views/songsList.html",
        controller: "viewSongsController",
        data:
        {
            displayName: 'Songs'
        }
    });
    */

    //$urlRouterProvider.otherwise("/search-MyView/Tabs/MyViewTab");

    //$opbeatProvider.config({
    //    orgId: '44c0361314aa4bb2927e4dbf533e3507',
    //    appId: '3177ccbbbc'
    //});
});
app.constant('ngAuthSettings', APPCONFIG);

/*
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', function (authService) {
    authService.fillAuthData();
}]);
*/

//app.config(function ($httpProvider) {
//    $httpProvider.interceptors.push('safeInterceptorService');
//});

app.run(['safeService', function (safeService) {
    safeService.checkAuthentication();
}]);




function createModalStateObject() {
    return {
        abstract: true,
        url: '',
        view: {},
        data: {
            modalInstance: null
        },
        params: {
            modalSize: 'lg'
        },
        onEnter: [
            '$modal', '$state', '$stateParams', function ($modal, $state, $stateParams) {
                this.data.modalInstance = $modal.open({
                    template: '<div ui-view="modalView"></div>',
                    controller: 'stepContainerController',
                    backdrop: 'static',
                    size: $stateParams.modalSize || 'lg',
                    keyboard: false
                });
            }
        ],
        onExit: [
            '$modal', '$state', function ($modal, $state) {
                this.data.modalInstance.dismiss();
            }
        ]
    }
}

// Adds active class to viewable page on Subnav
function subNavController($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
}



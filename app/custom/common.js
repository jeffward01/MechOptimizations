var USL = USL || {};
USL.Common = USL.Common || {};
USL.Common.SingleFieldArray = function (array, field, onlySelected) {
    var result = new Array();
    angular.forEach(array, function (value, key) {
        if((onlySelected && value['selected'] == true) || !onlySelected)
        result.push(value[field]);
    });
    return result;
}
USL.Common.FirstInArray = function(array, field, fieldValue) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][field] == fieldValue) return array[i];
    }
    return null;
}
USL.Common.FirstInArrayNested = function (array, field, fieldValue) {
    var fields = field.split('.');
    for (var i = 0; i < array.length; i++) {
        if (array[i][fields[0]][fields[1]] == fieldValue) return array[i];
    }
    return null;
}

USL.Common.FindAndRemove = function (array, field, fieldValue) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][field] == fieldValue) {
             array.splice(i, 1);
             return true;
        }
    }
    return false;
}
USL.Common.FindAndRemoveExcept = function (array, field, fieldValue) {
    var i = 0;
    while(i<array.length){
    if (array[i][field] != fieldValue) {
            array.splice(i, 1);
            continue;
    }
        i++;
    }
}
USL.Common.FindAndRemoveNested = function (array, field, fieldValue) {
    var fields = field.split('.');

    //allow for single '.' field name
    if (fields.length > 1) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][fields[0]][fields[1]] == fieldValue) {
                array.splice(i, 1);
                return true;
            }
        }
    }
    else {
        for (var i = 0; i < array.length; i++) {
            if (array[i][fields[0]] == fieldValue) {
                array.splice(i, 1);
                return true;
            }
        }
    }
    /*
    for (var i = 0; i < array.length; i++) {
        if (array[i][fields[0]][fields[1]] == fieldValue) {
            array.splice(i, 1);
            return true;
        }
    }
    */
    return false;
}

USL.Common.UnselectAndRemove = function (array, field, fieldValue) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][field] == fieldValue) {
            array[i].selected = false;
            array.splice(i, 1);

            return true;
        }
    }
    return false;
}


USL.Common.DeselectAll = function(array) {
    angular.forEach(array, function(item) {
        item.selected = false;
    });
}
USL.Common.FirstSelected = function(array) {
    var found = false;
    if (array != null) {
        var length = array.length;
        var i = 0;
        while (i < length && !found) {
            found = array[i].selected;
            i++;
        }
    }
    return found;
}
USL.Common.CreateEmptyDefaults = function(userId) {
    return {
        contactId: userId,
        userSetting: {}
    }
}
USL.Common.ReadPageDefaults = function(data, page) {
    if (data && data.userSetting) {
        var settings = JSON.parse(data.userSetting);
        return settings[page];
    }
    return null;
}
USL.Common.IsIEReturnVersion = function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');

    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    if (trident > 0) {
        // IE 11 (or newer) => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    // other browser
    return false;
}
USL.Common.SetSessionCookie = function (name, value) {
    if (!USL.Common.IsIEReturnVersion()) {
        document.cookie = name + "=" + value + "; expires=0; path=/";
    }
    else {
        document.cookie = name + "=" + value + "; path=/";
    }
}
USL.Common.ClearCookie = function(name) {
        document.cookie = name + "=" + false + "; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
}
USL.Common.GetCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
}


USL.Common.SetCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

USL.Common.isValidField = function (value) {
    // value = field string value
    if (angular.isUndefined(value) || value == '' || /^Select \w+/.test(value)) {
        return false;
    };
    return true;
}

USL.Common.isValidEmail = function (value) {
    if (angular.isUndefined(value) || value == '' || !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value)) {
        return false;
    };
    return true;
}

USL.Common.isValidPhone = function (value) {
    if (angular.isUndefined(value) || value == '' || value.length<3) {
        return false;
    };
    return true;
}

USL.Common.CloseModalBackground = function() {
    //This removes the background modals may leave open.
    $('body').removeClass('modal');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    //This closes the modal and removes the backgroud
    var currentStates = $state.$current.name.split('.');
    currentStates.pop();
    currentStates.pop();
    $state.go(currentStates.join('.'), {}, { reload: $scope.reloadNeeded });
}
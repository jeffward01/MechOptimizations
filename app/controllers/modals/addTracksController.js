'use strict';
app.controller('addTracksController', ['$scope', 'productsService', '$stateParams', '$state', 'medleysService', 'safeService', function ($scope, productsService, $stateParams, $state, medleysService, safeService) {

    var productId = $scope.selectedProductId; //$stateParams.productId;

    //$scope.productId = productId;
    $stateParams.productId = productId;
    $scope.safeauthentication = safeService.getAuthentication();
    var sproductId = $stateParams.productId;
    $scope.trackTypes = [];
    $scope.selectedTrackType = { trackType: "Select Type"};
    $scope.newproductLink = null;
    $scope.controlOptions = ['UNKNOWN', 'YES', 'NO'];
    $scope.disableAddSample = true;
    $scope.selectcontrolOption = function (productLink, controlOption) {
        productLink.track.controlled = controlOption;
        if (controlOption != "YES") {
            productLink.track.copyrights.length = 0;
        }
    }
    $scope.versionTypes = [];
    $scope.selectedVersionType = {name: "Select version"};
    $scope.deleteWork = function (productLink, work) {
        for (var i = 0; i < productLink.track.copyrights.length; i++) {
            if (productLink.track.copyrights[i] == work) {
                productLink.track.copyrights.splice(i,1);
                break;
            }
        }
        if (productLink.track.copyrights.length == 0) {
            productLink.track.controlled = 'UNKNOWN';
        }
    }
    $scope.deleteTrackSample = function (productLink, track) {
        USL.Common.FindAndRemove(productLink.trackSamples, 'id', track.id);
    }
    $scope.getNewProductLink = function () {
        $scope.newproductLink = null;
        var newartist = {
            id: 0,
            name: ''
        }
        var newtrack = {
            id: 0,
            title: '',
            artist: newartist,
            controlled: 'UNKNOWN',
            copyrights: [],
            duration: '',
            databaseVersion:0
        }
        var newproductLink = {
            id: 0,
            index: '',
            productId: 0,
            cdNumber: '',
            isrc: '',
            track: newtrack,
            databaseVersion:0
        }
        $scope.newproductLink = newproductLink;
        $scope.newproductLink.productId = $scope.selectedProductId;
        $scope.newproductLink.track.copyrights = [];
        $scope.newproductLink.worksSearch = {safeId:'', workCode:'', title:'', principalArtists:'', writers:'', acquisitionLocation:''};

    }

    $scope.validProductLink = function () {

        var msg = [];
        if ($scope.newproductLink.index.length == 0 ||  isNaN($scope.newproductLink.index)) {
            msg.push('Index # must be numeric');
        }

        if ($scope.newproductLink.cdNumber.length == 0 || isNaN($scope.newproductLink.cdNumber)) {
            msg.push('CD# must be numeric')
        }

        if ($scope.newproductLink.track.title.length == 0) {
            msg.push('Title is required');
        }
        if ($scope.newproductLink.track.artist.name.length == 0) {
            msg.push('Artist is required');
        }
        
        if ($scope.newproductLink.track.duration.length != 8) {
            msg.push('Duration is required in HH:MM:SS format');
        }


        for (var i = 0; i < $scope.productLinks.length; i++) {
            if ($scope.productLinks[i].index == $scope.newproductLink.index && $scope.productLinks[i].cdNumber == $scope.newproductLink.cdNumber) {
                msg.push('CD#/Index# already used');
            }
        }

        for (var i = 0; i < msg.length; i++) {
            noty({
                text: msg[i],
                type: 'error',
                timeout: 2500,
                layout: "top"
            });
        }

        if (msg.length > 0) {
            return false;
        }
        else {
            return true;
        }
    }

    $scope.addTempProductLink = function () {
        if ($scope.validProductLink()) {
            $scope.productLinks.push($scope.newproductLink);
            $scope.getNewProductLink();
        }
    }

    $scope.productLinks = [];
    $scope.artistList = [];
    $scope.trackList = [];
    $scope.worksList = [];

    $scope.selectedTrack = null;
    $scope.selectedArtist = null;
    $scope.selectedProductLink = null;
    $scope.productLinkObject = null;
    
    $scope.track = { artist: null, title: null };


    $scope.cancelEdit = function (productLink) {
        $scope.getProductLinks(productId);
        $scope.getNewProductLink();
    }

    $scope.editProductLink = function(productLink) {
        $scope.selectedProductLink = productLink;
        $scope.productLinkObject = productLink;
        $scope.selectedTrackType = { trackType: "Select Type" };
        productLink.trackSamples = [];
        $scope.disableAddSample = true;
        medleysService.getMedleys(productLink.track.id).then(function (result) {
            angular.forEach(result.data, function (sample) {
                productLink.trackSamples.push({ id: sample.medleyTrackId, duration: sample.medleyDuration.substring(3,8), type: { trackTypeid: sample.trackTypeId }, title: sample.title, artist: {name:sample.artist},trackTypeId:sample.trackTypeId});
            });
            
        }, function(error) {
        });
    };

    $scope.deleteProductLink = function (productLink) {
        noty({
            text: "Are you sure you want to remove this Track from the Product?",
            type: 'confirm',
            modal: true,
            timeout: 5000,
            layout: "center",
            buttons: [
        {
            addClass: 'btn-default', text: 'Ok', onClick: function ($noty) {

                $noty.close();

                productsService.deleteProductLink(productLink).then(function (result) {
                    if (result.data.success)  {

                        var message = "Track removed from Product";
                        noty({
                            text: message,
                            type: 'success',
                            timeout: 2500,
                            layout: "top"
                        });

                        $scope.getProductLinks(productId);
                        $scope.getNewProductLink();

                    }
                    else {
                    }
                }, function (error) {
                    var notymessage = "Error removing track from product ";
                    for (var i = 0; i < result.errorList.length; i++) {
                        notymessage += result.errorList[i].message + "\n"
                    }
                    noty({
                        text: notymessage,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                });
            }
        },
        {
            addClass: 'btn-default', text: 'Cancel', onClick: function ($noty) {
                $noty.close();

            }
        }
            ]
        });

    }

    $scope.selectTrack = function (productLink, track) {
        $scope.selectedTrack = track;
        productLink.track.title = track.title;
        productLink.track.id = track.id;
        productLink.track.artist = track.artist;
        productLink.track.controlled = 'YES';
        productLink.track.databaseVersion = track.databaseVersion;
        productLink.track.isrc = track.isrc;
        
        $scope.trackList.length = 0;

        var request = {
            trackId: track.id,
            callerInfo: {contactId: $scope.safeauthentication.contactId, siteLocationCode: 'US2', safeUserId: $scope.safeauthentication.safeId}
        };

        //productsService.getTrackDetails(track.id).then(function (result) {
        productsService.getTrackDetails(request).then(function (result) {
            if (result.data) {
                if (result.data.success) {
                    productLink.track.copyrights.length = 0;
                    productLink.track.copyrights.push({ workCode: result.data.value.pipsCode });
                    productLink.track.duration = result.data.value.duration.slice(3);
                }
                else {
                    noty({
                        text: 'No track details',
                        type: 'error',
                        timeout: 5000,
                        layout: "top"
                    });
                }
            }
            else {
                for (var i = 0; i < result.errors.length; i++) {
                    noty({
                        text: 'error getting tracks ' + result.data.errors[i].message,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                }
            }
        }, function (error) {
            var notymessage = "Error getting tracks ";
            for (var i = 0; i < result.errorList.length; i++) {
                notymessage += result.errorList[i].message + "\n"
            }
            noty({
                text: notymessage,
                type: 'error',
                timeout: false,
                layout: "top"
            });
        });
    }

    $scope.selectArtist = function (productLink,artist) {
        $scope.selectedArtist = artist;
        productLink.track.artist = artist;
        productLink.track.title = '';
        productLink.track.id = 0;
        productLink.track.copyrights.length = 0;
        productLink.track.controlled = 'UNKNOWN';
        $scope.selectedTrack = { id: 0, title: '' };
        $scope.artistList.length = 0;
    }


    $scope.trackAutosuggest = function (productLink) {
        if (productLink.track.title.length > 2) {
            var artistId = null;
            if ($scope.selectedArtist != null) {
                artistId = $scope.selectedArtist.id;
            }
            var query = productLink.track.title;
            $scope.trackList.length = 0;

            var request = {
                query: query,
                artistId: artistId,
                albumId: null,
                siteLocationCode: null,
                filterMusicOwner: false
            };

            productsService.trackAutosuggest(request).then(function (result) {
                if (result.data.success) {
                    if (result.data.values.length > 0) {
                        $scope.trackList = result.data.values;
                    }
                }
                else {
                    for (var i = 0; i < result.data.errors.length; i++) {
                        noty({
                            text: 'error getting tracks ' + result.data.errors[i].message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    }
                }
            }, function (error) {
                var notymessage = "Error getting tracks ";
                for (var i = 0; i < result.data.errorList.length; i++) {
                    notymessage += result.data.errorList[i].message + "\n"
                }
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            });
        }
        else {
            $scope.trackList.length = 0;
        }
    }

   
    $scope.artistAutosuggest = function (productLink) {
        if (productLink.track.artist.name.length > 2) {
        //if ($scope.track.artist.length > 2) {
            var query = productLink.track.artist.name;
            $scope.artistList.length = 0;
            productLink.track.id = 0;
            $scope.selectedTrack = {id: 0, title: ''};

            productsService.artistAutosuggest(query).then(function (result) {
                if (result.data.success) {
                    if (result.data.values.length > 0) {
                        $scope.artistList = result.data.values;
                    }
                }
                else {
                    for (var i = 0; i < result.data.errors.length; i++) {
                        noty({
                            text: 'error getting artists ' + result.data.errors[i].message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    }
                }
            }, function (error) {
                var notymessage = "Error getting artists ";
                for (var i = 0; i < result.data.errorList.length; i++) {
                    notymessage += result.data.errorList[i].message + "\n"
                }
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: 5000,
                    layout: "top"
                });
            });
        }
        else {
            $scope.artistList.length = 0;
        }
    }
    $scope.selectWork = function (productLink, work) {
        productLink.worksSearch = work;
        $scope.productLinkObject.worksSearch = work;
    }
    $scope.selectTrackSample = function (productLink, track) {
        productLink.componentTracksSearch = track;
    }
    $scope.addWork = function (productLink) {
        if (productLink.track.copyrights == null) {
            productLink.track.copyrights = [];
        }
        if (productLink.track.copyrights.indexOf(productLink.worksSearch) < 0) {
            productLink.track.copyrights.push(productLink.worksSearch);
            productLink.track.worksSearch = { safeId: '', workCode: '', title: '', principalArtists: '', writers: '', acquisitionLocation: '' };
        }

        $scope.productLinkObject.worksSearch = null;
    }
    $scope.addTrackSample = function (productLink) {
        if (!productLink.componentTracksSearch.id) return;
        var exists = USL.Common.FirstInArray(productLink.trackSamples, 'id', productLink.componentTracksSearch.id);
        if (!exists) {
            productLink.componentTracksSearch.type = $scope.selectedTrackType;
            productLink.componentTracksSearch.duration = "";
            productLink.trackSamples.push(productLink.componentTracksSearch);
            productLink.componentTracksSearch = {title:''};
        }
    }

    $scope.clearTitleSearch = function (searchTitle) {
        if (typeof searchTitle == 'undefined' || searchTitle == '') {
            $scope.worksList = [];
        }
        else {
            $scope.worksSearch(searchTitle);
        }
    }
    $scope.clearWorkTitleSearch = function (searchTitle, productLink) {
        if (typeof searchTitle == 'undefined' || searchTitle == '') {
            productLink.componentTracksSuggest.length = 0;
        }
        else {
            $scope.worksSearch(searchTitle, productLink);
        }
    }
    $scope.worksSearch = function (searchTitle) {
        $scope.worksList.length = 0;
        if (searchTitle.length > 2) {
            var request = {
                safeId: $scope.safeauthentication.safeId,
                title: searchTitle,
                siteAcquisitionLocationCode: 'US2',
                totalResults: 40
            }
            productsService.worksSearch(request).then(function (result) {
                var lworks = [];
                angular.forEach(result.data.values, function (item) {
                    lworks.push({
                        acquisitionLocationCode: item.dealOwningLocations[0],
                        principalArtists: item.artist,
                        title: item.songTitle,
                        workCode: item.songCode,
                        writers: item.writers
                    });
                });
                result.data.values = lworks;
                if (result.data.success) {
                    if (result.data.values.length > 0) {
                        $scope.worksList = result.data.values;
                    }
                }
                else {
                    for (var i = 0; i < result.data.errors.length; i++) {
                        noty({
                            text: 'error searching works ' + result.data.errors[i].message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    }
                }
            }, function (error) {
                var notymessage = "Error searching works ";
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            });
        }
        else {
            $scope.worksList.length = 0;
        }
    }
    $scope.sampleSuggest = function (searchTitle, productLink) {
        productLink.componentTracksSuggest.length = 0;
        
        if (searchTitle.length > 2) {
            var request = {
                query: searchTitle,
                artistId: null,
                albumId: null,
                siteLocationCode: null,
                filterMusicOwner: false
            };

            productsService.trackAutosuggest(request).then(function (result) {
                if (result.data.success) {
                    if (result.data.values.length > 0) {
                        productLink.componentTracksSuggest = result.data.values;
                    }
                }
                else {
                    for (var i = 0; i < result.data.errors.length; i++) {
                        noty({
                            text: 'error searching works ' + result.data.errors[i].message,
                            type: 'error',
                            timeout: false,
                            layout: "top"
                        });
                    }
                }
            }, function (error) {
                var notymessage = "Error searching works ";
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            });
        }
        else {
            productLink.componentTracksSuggest.length = 0;
        }
    }

    $scope.modal_submit = false;
    $scope.modal_add_submit = false;

    $scope.isValidField = function (value) {
        if (/^[0-5][0-9]:[0-5][0-9]$/.test(value)) {
            return true;
        }
        return false;
    }

    $scope.validEditFields = function () {

        /*        
        if (!$scope.validIsrc(document.getElementsByClassName("productLink-track-isrc"))) {
            msg += "ISRC must be in the format CC-XX-YY-NNNN<br />";
            noty({
                text: msg,
                type: 'error',
                timeout: false,
                layout: "top"
            });

            //ISRC must be in the correct format (see <a href='https://en.wikipedia.org/wiki/International_Standard_Recording_Code' onclick='return false'>here</a> for details)
            return false;
        }
        */
        var isrcs = document.getElementsByClassName("productLink-track-isrc");
        var msg = "";
        for (var i = 0; i < isrcs.length; i++) {
            if (isrcs[i].offsetParent !== null && !$scope.validIsrc(isrcs[i])) {
                msg += "ISRC must be 12 characters long and will format to CC-XXX-YY-NNNNN<br />";
                noty({
                    text: msg,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
                return false;
            }
        }


        var durations = document.getElementsByClassName("productLink-track-duration");
        var sampledurations = document.getElementsByClassName("comp-track-duration");

        for (var i = 0; i < durations.length; i++) {
            if (durations[i].offsetParent !== null && !$scope.isValidField(durations[i].value)) {
                return false;
            }
        }

        for (var i = 0; i < sampledurations.length; i++) {
            if (sampledurations[i].offsetParent !== null && !$scope.isValidField(sampledurations[i].value)) {
                return false;
            }
        }
        return true;
    }

    $scope.validAddFields = function () {
        var msg = "";
        var cdNumber = document.getElementById("newproductLink-cdNumber").value;
        var index = document.getElementById("newproductLink-index").value;
        var artist = document.getElementById("newproductLink-artist").value;
        var title = document.getElementById("newproductLink-title").value;
        var isrc = document.getElementById("newproductLink-isrc").value;
        var duration = document.getElementById("newproductLink-duration").value;

        /*
        if (!cdNumber || !index || !artist || !title) {
            return false;
        }
        */

        if (index.length == 0 || isNaN(index)) {
            msg += 'Index # must be numeric<br />';
        }

        if (cdNumber.length == 0 || isNaN(cdNumber)) {
            msg += 'CD# must be numeric <br />';
        }

        if (title.length == 0) {
            msg += 'Title is required<br />';
        }
        if (artist.length == 0) {
            msg += 'Artist is required<br />';
        }

        if (!/^\d{1,2}\:\d{2}$/.test(duration)) {
            msg += 'Duration is required in MM:SS format <br />';
        }

        for (var i = 0; i < $scope.productLinks.length; i++) {
            if ($scope.productLinks[i].index == $scope.newproductLink.index && $scope.productLinks[i].cdNumber == $scope.newproductLink.cdNumber) {
                msg += 'CD#/Index# already used <br />';
            }
        }

        if (!$scope.validIsrc(document.getElementById("newproductLink-isrc"))) {
            msg += "ISRC must be 12 characters long and will format to CC-XXX-YY-NNNNN<br />";
            //ISRC must be in the correct format (see <a href='https://en.wikipedia.org/wiki/International_Standard_Recording_Code' onclick='return false'>here</a> for details)

        }

        if (msg.length > 0) {
            noty({
                text: msg,
                type: "error",
                timeout: false,
                layout: "top"
            });

            return false;
        }
        else
        {
            return true;
        }
    }

    $scope.validIsrc = function (isrcid) {
        
        var isrc = isrcid.value.toUpperCase();
        var v = false;

        if (isrc.length == 0) {
            v =  true;
        }
        else {

            //valid isrc format CC-XXX-YY-NNNNN
            //CC -alpha
            //XXX - alpha
            //YY, NNNNN - numeric
            //length == 12 and no formatting
            //length == 15 and has hyphens
            //ISRC must be in the correct format (see <a href='https://en.wikipedia.org/wiki/International_Standard_Recording_Code' onclick='return false'>here</a> for details)

            var unformattedIsrc = /^[a-zA-Z]{2}[0-9a-zA-Z]{3}\d{7}$/;
            var formattedIsrc = /^[a-zA-Z]{2}\-[0-9a-zA-Z]{3}\-\d{2}\-\d{5}$/;

            //if (isrc.length == 15) {
            //    if (formattedIsrc.exec(isrc)) {
            //        v = true;
            //    }
            //}
            
            if (isrc.length == 12) {
                if (unformattedIsrc.exec(isrc)) {
                    //format isrc
                    var newisrc = isrc.slice(0, 2) + "-" + isrc.slice(2, 5) + "-" + isrc.slice(5, 7) + "-" + isrc.slice(7, 12);
                    isrcid.value = newisrc.toUpperCase();
                    v = true;
                }
            }
            else if (isrc.length == 15) {
                if (formattedIsrc.exec(isrc)) {
                    v = true;
                }
            }
            
        }
        return v;

    }

    function formatIsrc(isrc) {
        var v = false;
        var formattedIsrc = "";
        if (isrc) {
            formattedIsrc = isrc.toUpperCase();
        }

            //valid isrc format CC-XXX-YY-NNNNN
            //CC -alpha
            //XXX - alpha
            //YY, NNNNN - numeric
            //length == 12 and no formatting
            //length == 15 and has hyphens
            //ISRC must be in the correct format (see <a href='https://en.wikipedia.org/wiki/International_Standard_Recording_Code' onclick='return false'>here</a> for details)

        var unformattedIsrcEx = /^[a-zA-Z]{2}[0-9a-zA-Z]{3}\d{7}$/;
        var formattedIsrcEx = /^[a-zA-Z]{2}\-[0-9a-zA-Z]{3}\-\d{2}\-\d{5}$/;

        if (formattedIsrc.length == 12) {
            if (unformattedIsrcEx.exec(formattedIsrc)) {
                //format isrc
                formattedIsrc = formattedIsrc.slice(0, 2) + "-" + formattedIsrc.slice(2, 5) + "-" + formattedIsrc.slice(5, 7) + "-" + formattedIsrc.slice(7, 12);
            }
        }

        return formattedIsrc;

    }


    $scope.saveProductLink = function (productLink) {

        productLink.track.isrc = formatIsrc(productLink.track.isrc);

        if (!productLink.id) { // is a new product
            $scope.modal_add_submit = true;
            if (!$scope.validAddFields()) return;
        }
        else {
            $scope.modal_submit = true;
            if (!$scope.validEditFields()) return;
        }

        $scope.modal_add_submit = false;

        var copyrights = [];
        if (productLink.track.copyrights != null) {
            for (var i = 0; i < productLink.track.copyrights.length; i++) {
                copyrights.push({ workCode: productLink.track.copyrights[i].workCode });
            }
        }
        var request = {
            id: productLink.id,
            productId: productLink.productId,
            cdNumber: productLink.cdNumber,
            index: productLink.index,
            databaseVersion: productLink.databaseVersion,
            track: {
                id: productLink.track.id,
                title: productLink.track.title,
                artist: { id: productLink.track.artist.id, name: productLink.track.artist.name },
                controlled: productLink.track.controlled,
                duration: "00:" + productLink.track.duration,
                isrc: productLink.track.isrc,
                copyrights: copyrights,
                databaseVersion: productLink.track.databaseVersion
            }
        }

        productsService.saveProductLink(request).then(function(result) {
            var notymessage = '';
            var notytype = 'success';

            if (result.data.success) {
                //$state.go("SearchMyView.Tabs.ProductsTab.StepsModal.CreateProductAddTracks", { productId: $scope.selectedProductId });

                $scope.getProductLinks($scope.selectedProductId);
                $scope.getNewProductLink();

                notymessage = 'product link updated';
                notytype = "success";
                noty({
                    text: notymessage,
                    type: notytype,
                    timeout: 2500,
                    layout: "top"
                });


            } else {
                notymessage = "error adding productLink ";
                for (var i = 0; i < result.data.errorList.length; i++) {
                    notymessage += result.data.errorList[i].message + "\n"
                }
                noty({
                    text: notymessage,
                    type: 'error',
                    timeout: false,
                    layout: "top"
                });
            }
        }, function(error) {
            notymessage = "Error occurred adding productLink ";
            for (var i = 0; i < result.data.errorList.length; i++) {
                notymessage += result.data.errorList[i].message + "\n"
            }
            noty({
                text: notymessage,
                type: 'error',
                timeout: false,
                layout: "top"
            });
        });

        //this is an async call to save medleys and samples
       // var allMedleysAndSample = [];
       // angular.forEach(productLink.trackSamples, function (sample) {
       //     var duration = "00:" + sample.duration;
       //     allMedleysAndSample.push({ trackId: productLink.track.id, medleyTrackId: sample.id, medleyDuration: duration, trackTypeId: sample.type.trackTypeid, createdBy: $scope.safeauthentication.contactId, title: sample.title, artist: sample.artist.name });
       // });
       // if (allMedleysAndSample.length==0) {
       //     allMedleysAndSample.push({ trackId: productLink.track.id });
       // }
       //medleysService.addMedleys(allMedleysAndSample).then(function(result) {
       //     var a = "test";
       // }, function(error) {
       // });

    };

    $scope.getProductLinks = function (productId) {
        $scope.productLinks.length = 0;

        productsService.getProductLinks(productId).then(function (result) {
            if (result.data) {
                if (result.data.length > 0) {
                    $scope.productLinks = result.data;
                    for (var i = 0; i < $scope.productLinks.length; i++) {
                        //only display duration at MM:HH strip off the first three characters and add them back on when posting
                        if ($scope.productLinks[i].track.duration != null) {
                            $scope.productLinks[i].track.duration = $scope.productLinks[i].track.duration.slice(3);
                        }
                        $scope.productLinks[i].workSearch = { workCode: '', title: '', principalArtists: '', writers: '', acquisitionLocation: '' };
                        $scope.productLinks[i].componentTracksSearch = {title:''};
                        $scope.productLinks[i].componentTracksSuggest = [];
                        if ($scope.productLinks[i].trackSamples == null) $scope.productLinks[i].trackSamples = [];
                    }
                    //for (var i = 0; i < $scope.productLinks.length; i++) {
                    //    if ($scope.productLinks[i].track.copyrights == null) {
                    //        $scope.productLinks[i].track.copyrights = [];
                    //    }
                    //}
                }
                /*
                else {
                    noty({
                        text: 'No track records',
                        type: 'error',
                        timeout: 5000,
                        layout: "top"
                    });
                }
                */
            }
            else {
                for (var i = 0; i < result.data.errors.length; i++) {
                    noty({
                        text: 'error getting tracks ' + result.data.errors[i].message,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                }
            }
        }, function (error) {
            var notymessage = "Error getting tracks ";
            for (var i = 0; i < result.data.errorList.length; i++) {
                notymessage += result.data.errorList[i].message + "\n"
            }
            noty({
                text: notymessage,
                type: 'error',
                timeout: false,
                layout: "top"
            });
        });
    }
    $scope.selectTrackType = function(trackType) {
        $scope.selectedTrackType = trackType;
        $scope.disableAddSample = false;
    };
    $scope.getTrackTypes = function() {
        if ($scope.trackTypes.length == 0) {
            productsService.getTrackTypes().then(function (results) {
                $scope.trackTypes = results.data;
            }, function (error) {
            });
        }
    }
    /*
    // not righ for this
    $scope.getProductTracks = function(productId) {

        $scope.productLinks.length = 0;

        productsService.getProductTracks(productId).then(function (result) {
            if (result.data) {
                if (result.data.length > 0) {
                    $scope.productLinks = result.data;
                }
            }
            else {
                for (var i = 0; i < result.data.errors.length; i++) {
                    noty({
                        text: 'error getting tracks ' + result.data.errors[i].message,
                        type: 'error',
                        timeout: false,
                        layout: "top"
                    });
                }
            }
        }, function (error) {
            var notymessage = "Error getting tracks ";
            for (var i = 0; i < result.data.errorList.length; i++) {
                notymessage += result.data.errorList[i].message + "\n"
            }
            noty({
                text: notymessage,
                type: 'error',
                timeout: false,
                layout: "top"
            });
        });
    }
    */
    /*
    $scope.ok = function () {

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    */

    $scope.cancelMe = function () {
        $scope.goToParent(null, true);
        /*
        $state.reload().then(function () {
            $state.go('SearchMyView.DetailLicense', { licenseId: $scope.selectedLicense.licenseId });
        });
        */
    }

    $scope.saveMe = function () {
        //additional functionality pending?
        $scope.goToParent(null, true);
        //$state.reload().then(function () {
        //    $scope.cancel();
        //});
    }

    $scope.Back = function () {
        $scope.modalPreviousStep({ isCreate: false });
    }
    $scope.getVersionTypes = function() {
        productsService.getVersionTypes().then(function (results) {
            $scope.versionTypes = results.data;
        }, function (error) {
        });
    };
    $scope.selectVersionType = function (type) {
        $scope.selectedVersionType = type;
    };
    $scope.getVersionTypes();
    $scope.getProductLinks(productId);
    $scope.getNewProductLink();
}]);
'use strict';
app.controller('issueLicenseController', ['$scope', 'licensesService', 'licenseProductsService', 'filesService', '$filter', '$stateParams', '$state', function ($scope, licensesService, licenseProductsService, filesService, $filter, $stateParams, $state) {

    $scope.showActionButton = false;


    $scope.init = function() {

        if ($state.current.name == 'SearchMyView.DetailLicense.StepsModal.GenerateDirectDocumentPreview') {
            $scope.directPreviewFromDetailsPage = true;
            $scope.selectedTemplate = { Name: 'US License Template', Url: 'app/views/partials/license-template.html' }
            $scope.templatePreviewData = $scope.selectedTemplate;
        } else {
            $scope.directPreviewFromDetailsPage = false;
        }

    }
    //license data is in $scope.selectedLicense
    $scope.getLicensePreview = function () {
            licenseProductsService.getLicensePreview($scope.selectedLicense.licenseId).then(function(result) {
                angular.forEach(result.data.licenseProducts, function(item) {
                    item.productConfigurationSelection = $scope.getProductConfigurationSelection(item);
                    if (item.productConfigurationSelection.length > 0) {
                        $scope.showActionButton = true;
                    }


                    //samples
                    angular.forEach(item.recordings, function (record) {
                        if (record.track.copyrights.length != 0) {
                            angular.forEach(record.track.copyrights, function (copyright) {
                                if (copyright.sampledWorks && copyright.sampledWorks.length > 0){
                                    record.hasSample = true;
                                } else {
                                    record.hasSample = false;
                                }
                            });
                        }
                    });

                });


                angular.forEach(result.data.licenseProducts, function (item) {
                    angular.forEach(item.recordings, function (record) {
                        angular.forEach(record.writers, function (writer) {
                            angular.forEach(writer.originalPublishers, function (publisher) {
                                publisher.SeExists = false;
                                publisher.zeroValue = false;
                                var boolSet = false;
                                angular.forEach(publisher.administrators, function (subpub) {
                                    if (subpub.capacityCode == "SE") {
                                        publisher.SeExists = true;
                                    }
                                    if (subpub.mechanicalCollectablePercentage == 0) {
                                        if (!boolSet) {
                                            publisher.zeroValue = true;
                                        }
                                        boolSet = true;
                                    } else {
                                        publisher.zeroValue = false;
                                        boolSet = true;
                                    }
                                    if (subpub.name == publisher.name) {
                                        publisher.sameName = true;
                                    }
                                });
                            });
                        });
                    });
                });
                

                $scope.selectedLicense.licensePreview = result.data;
                $scope.populateLicensePreviewData($scope.selectedLicense.licensePreview);
                $scope.LicensePreviewData.licenseNotes = getNotes($scope.selectedLicense.licenseNoteList, "note", "License");
                $scope.LicensePreviewData.agreementNotes = getNotes($scope.selectedLicense.licenseNoteList, "note", "Agreement");

            });
    };

    //(function ($) {
    //    $.extend($.fn, {
    //        makeCssInline: function () {
    //            this.each(function (idx, el) {
    //                var style = el.style;
    //                var properties = [];
    //                for (var property in style) {
    //                    if ($(this).css(property)) {
    //                        properties.push(property + ':' + $(this).css(property));
    //                    }
    //                }
    //                this.style.cssText = properties.join(';');
    //                $(this).children().makeCssInline();
    //            });
    //        }
    //    });
    //}(jQuery));


    $scope.print = function () {

        window.frames["print_frame"].document.body.innerHTML = $('#licensePreviewModalContent').html();
        window.frames["print_frame"].window.focus();
        window.frames["print_frame"].window.print();

    }


    function removeOutForSignatureAttachments() {
        //remove previous OUT_FOR_SIGNATURE attachments
        var selectedAttachments = [];
        angular.forEach($scope.licenseAttachments, function (attachment) {
            if (attachment.fileName.indexOf("_OUT_FOR_SIGNATURE") > -1) {
                selectedAttachments.push(attachment);
            }
        });

        filesService.removeMultiple(selectedAttachments).then(function (result) {

            // Remove from UI
            for (var i = 0; i < $scope.licenseAttachments.length; i++) {
                var j = 0;
                var found = false;
                while ( j < selectedAttachments.length && !found) {
                    if (selectedAttachments[j].fileName == $scope.licenseAttachments[i].fileName) {
                        $scope.licenseAttachments.splice(i, 1);
                        found = true;
                    }
                    j++;
                }

            }

        }, function (error) {

        });
    }

    $scope.ok = function () {
        console.log(JSON.stringify($scope.selectedLicense));
        $scope.selectedLicense.licenseStatusId = 6;
        $scope.selectedLicense.licenseStatus.licenseStatus = "Issued";
        removeOutForSignatureAttachments();
        licensesService.updateLicenseStatus($scope.selectedLicense).then(function (result) {
            $scope.cancel();
        }, function (error) { });

     //   $('#licensePreviewModalContent').makeCssInline();
        createLicensePreviewHtmlFile();


    };

    function createLicensePreviewHtmlFile() {
        updateCssForPdf();        

        var stringBuilder = "";     
        stringBuilder += "<html>";
        stringBuilder += "<head>";
        stringBuilder += "<head>";
        stringBuilder += "<body>";
        stringBuilder += $('#licensePreviewModalContent').html();
        stringBuilder += "<\/body>";
        stringBuilder += "<\/html>";

        var dataObject =
        {
            htmlText: stringBuilder,
            licenseId: $scope.selectedLicense.licenseId,
            fileName: $scope.fileName,
            Subject: $scope.adobeSubjectLine,
            Content: $scope.adobeContent,
            fromContactId: $scope.selectedFrom.contactId
    }
        licensesService.uploadGeneratedLicensePreview(dataObject);
    }

    var updateCssForPdf = function () {
        $('#licensePreviewModalContent .signatureDateTagPdfChanges').css({
            "display": "inline-block",
            "width": "200pt",
            "height": "60pt",
            "vertical-align" : "top",
            "margin-top": "33px"
            });
        $('#licensePreviewModalContent .hideOnHtmlDisplayOnPdf').css("display", "inline-block");
        

    }

    $scope.init();
    $scope.getLicensePreview();


    $scope.currentDate = moment().format();

    

    $scope.LicensePreviewData = {
        configuration: null,
        songTitles: null,
        globalConfigurations: [],
        licenseNotes: "",
        agreementNotes: ""
    };


    $scope.signatureTag = "{{Sig_es_:signer1:signature}}";
    $scope.signatureDateTag = "{{date_es_:signer1:date}}";

    $scope.termOptionText = "";



    $scope.getProductConfigurationSelection = function (product) {

        var productConfigurationIdsSelection = [];
        var productConfigurationSelection = [];
        var productObject = product || [];


        var x = 0;
        var recordings = productObject.recordings;
        if (recordings != null) {
            while (x < recordings.length) {
                var i = 0;
                var writers = recordings[x].writers;

                if (writers != null) {
                    while (i < writers.length) {
                        var j = 0;
                        if (writers[i].licenseProductRecordingWriter != null && writers[i].licenseProductRecordingWriter.rateList != null) {
                            var rateList = writers[i].licenseProductRecordingWriter.rateList;

                            while (j < rateList.length) {
                                if (rateList[j].writerRateInclude) {
                                    //if ($.inArray(rateList[j].configuration_id, productConfigurationIdsSelection) === -1)
                                    //productConfigurationIdsSelection.push(rateList[j].configuration_id);
                                    if ($.inArray(rateList[j].product_configuration_id, productConfigurationIdsSelection) === -1) {
                                        productConfigurationIdsSelection.push(rateList[j].product_configuration_id);
                                    }
                                }
                                j++;
                            }
                        }
                        i++;
                    }
                }
                x++;
            }
        }

        var i = 0;
        var productHeaderConfigurations = productObject.productHeader.configurations;
        while (i < productConfigurationIdsSelection.length) {
            var j = 0;
            while (j < productHeaderConfigurations.length) {
                //if (productConfigurationIdsSelection[i] == productHeaderConfigurations[j].configuration.id && productHeaderConfigurations[j].licenseProductConfiguration!=null) {
                /*
                var configurationObj = {
                    upc: productHeaderConfigurations[j].upc,
                    name: productHeaderConfigurations[j].configuration.name,
                    catalogNumber: productHeaderConfigurations[j].licenseProductConfiguration.catalogNumber,
                    releaseDate: productHeaderConfigurations[j].releaseDate,
                    configurationType: productHeaderConfigurations[j].configuration.type
                }
                */
                if (productConfigurationIdsSelection[i] == productHeaderConfigurations[j].id && productHeaderConfigurations[j].licenseProductConfiguration != null) {

                    var configurationObj = {
                        product_configuration_id: productHeaderConfigurations[j].id,
                        configuration_id: productHeaderConfigurations[j].configuration.id,
                        upc: productHeaderConfigurations[j].upc,
                        name: productHeaderConfigurations[j].configuration.name,
                        catalogNumber: productHeaderConfigurations[j].licenseProductConfiguration.catalogNumber,
                        releaseDate: productHeaderConfigurations[j].releaseDate,
                        configurationType: productHeaderConfigurations[j].configuration.type
                    }
                    productConfigurationSelection.push(configurationObj);

                }
                j++;
            }
            i++;
        }
        return productConfigurationSelection;
    }


    $scope.displayEscaletedRates = function (rateList, rate) {
        var display = true;
        var config_Id = rate.configuration_id;
        var escalatedRate = (rate.escalatedRate != null);

        if (escalatedRate) {

            var minLicenseWriterRateId = rate.licenseWriterRateId;
            angular.forEach(rateList, function (item) {

                if (item.configuration_id == config_Id && minLicenseWriterRateId > item.licenseWriterRateId && item.escalatedRate != null) {
                    minLicenseWriterRateId = item.licenseWriterRateId;
                }

            });

            if (minLicenseWriterRateId != rate.licenseWriterRateId) {
                display = false;
            }

        }

        return display;

    }

    $scope.populateLicensePreviewData = function (licenseData) {

        if ($scope.directPreviewFromDetailsPage) {
            $scope.termOptionText = "You shall pay royalties and account to us quarterly, within forty-five (45) days after the end of each calendar quarter, on the basis of phonorecords made and distributed.";
        } else {


            if ($scope.$parent.templatePreviewData.Name == 'US License Template') {
                if ($scope.selectedTermOption.Name.toLowerCase() == "quarterly") {
                    $scope.termOptionText = "You shall pay royalties and account to us quarterly, within forty-five (45) days after the end of each calendar quarter, on the basis of phonorecords made and distributed.";
                } else if ($scope.selectedTermOption.Name.toLowerCase() == "semi-annually") {
                    $scope.termOptionText = "You shall pay royalties and account to us semi-annually, within forty-five (45) days after the end of each calendar semi-annual period, on the basis of Products made and distributed.";
                }else
                {
                    $scope.termOptionText = "You shall pay royalties and account to us semi-annually, within ninety (90) days after the periods ending June 30th and December 31st, on the basis of phonorecords made and distributed.";
                }

            }

            if ($scope.$parent.templatePreviewData.Name == 'US DVD License Template') {
                if ($scope.selectedTermOption.Name.toLowerCase() == "quarterly") {
                    $scope.termOptionText = "You shall pay royalties and account to us quarterly, within forty-five (45) days after the end of each calendar quarter, on the basis of Products made and distributed.";
                } else {
                    $scope.termOptionText = "You shall pay royalties and account to us semi-annually, within forty-five (45) days after the end of each calendar semi-annual period, on the basis of Products made and distributed.";
                }
            }

            if ($scope.$parent.templatePreviewData.Name == 'Canadian License Template') {
                if ($scope.selectedTermOption.Name.toLowerCase() == "quarterly") {
                    $scope.termOptionText = "You shall pay royalties and account to us quarterly, within forty-five (45) days after the end of each calendar quarter.";
                } else {
                    $scope.termOptionText = "You shall pay royalties and account to us semi-annually, within forty-five (45) days after the end of each calendar semi-annual period.";
                }
            }

        }
        getLabelValues(licenseData);

        getConfigValue(licenseData);

        var scheduleFirst = getSchedule(licenseData, "first");
        var scheduleLast = getSchedule(licenseData, "last");

        var tracks = 0;
        var i = 0;
        var trackName = "";
        var songTitles = "";
        var licenseProductsLength = licenseData.licenseProducts.length;
        while (tracks <= 1 && i < licenseProductsLength) {
            var j = 0;
            while (tracks <= 1 && j < licenseData.licenseProducts[i].recordings.length && licenseData.licenseProducts[i].productConfigurationSelection.length > 0) {
                var x = 0;
                var writers = licenseData.licenseProducts[i].recordings[j].writers;
                if (writers != null) {
                    while (tracks <= 1 && x < writers.length) {
                        if (writers[x].licenseProductRecordingWriter.rateList != null) {
                            var y = 0;
                            var rateList = writers[x].licenseProductRecordingWriter.rateList;
                            while (tracks <= 1 && y < rateList.length) {
                                if (rateList[y].writerRateInclude) {
                                    if (tracks == 0) {
                                        trackName = licenseData.licenseProducts[i].recordings[j].track.title;
                                    }
                                    y = rateList.length;
                                    x = writers.length;
                                    tracks++;
                                }
                                y++;
                            }
                        }
                        x++;
                    }
                }

                j++;
            }
            i++;
        }

        if (tracks <= 1) {
            $scope.LicensePreviewData.songTitles = trackName;
        } else {
            songTitles = "See Schedule " + scheduleFirst;
            if (scheduleLast.length > 0 && scheduleFirst !==scheduleLast) {
                songTitles = "See Schedules " + scheduleFirst + " - " + scheduleLast;
            }
            $scope.LicensePreviewData.songTitles = songTitles;
        }


        var artists = [];
        var artistName = "";
        i = 0;
        while (artists.length <= 1 && i < licenseProductsLength) {
            if ((artists.indexOf(licenseData.licenseProducts[i].productHeader.artist.id) === -1) && licenseData.licenseProducts[i].productConfigurationSelection.length > 0) {
                artists.push(licenseData.licenseProducts[i].productHeader.artist.id);
                artistName = licenseData.licenseProducts[i].productHeader.artist.name;
            }
            i++;
        }

        $scope.LicensePreviewData.umpgText = ((scheduleFirst!==scheduleLast && scheduleLast !="") ? ("See Schedules " + scheduleFirst + " - " + scheduleLast) : "See Schedule " + scheduleFirst);
        $scope.LicensePreviewData.productTitle = getProductTitle(licenseData);
        $scope.LicensePreviewData.artistName = (artists.length === 1) ? artistName : ((scheduleFirst !== scheduleLast && scheduleLast != "") ? ("See Schedules " + scheduleFirst + " - " + scheduleLast) : "See Schedule " + scheduleFirst);

        $scope.effectiveDateCalculated = $scope.selectedLicense.effectiveDate == null ? $scope.currentDate : $filter('timezone')($scope.selectedLicense.effectiveDate);

    };

    var getProductTitle = function (licenseData) {

        var i = 0;
        var noProducts = 0;
        var productTitle = "";
        while (i < licenseData.licenseProducts.length) {
            var productConfigs = licenseData.licenseProducts[i].productConfigurationSelection;
            if (productConfigs.length > 0) {
                noProducts++;
                productTitle = licenseData.licenseProducts[i].productHeader.title;
            }
            i++;
        }

        if (noProducts != 1) {
            productTitle = $scope.LicensePreviewData.umpgText;
        }

        return productTitle;

    }

    $scope.getSplit = function (writer) {
        
        if ( writer.licenseProductRecordingWriter.splitOverride!=null && writer.licenseProductRecordingWriter.splitOverride >= 0) return writer.licenseProductRecordingWriter.splitOverride;
        if (writer.licenseProductRecordingWriter.claimExceptionOverride !== 0 && writer.licenseProductRecordingWriter.claimExceptionOverride != null) return writer.licenseProductRecordingWriter.claimExceptionOverride;
        return toPercent(writer.contribution);
        
    }

    function toPercent (x) {
        return ((x / 100) * 100).toFixed(2);
    }

    $scope.joinValues = function (currentArray, attr) {
        var out = [];
        for (var i = 0; i < currentArray.length; i++) {
            out.push(currentArray[i][attr]);
        }
        return out.join(", ");
    }

    var getLabelValues = function (licenseData) {
        $scope.LabelValue = "";
        var labels = [];
        angular.forEach(licenseData.licenseProducts, function(item) {
            if (item.productConfigurationSelection.length > 0) {

                if (item.productHeader.recordLabel!=null && $.inArray(item.productHeader.recordLabel.name, labels) == -1) {
                    labels.push(item.productHeader.recordLabel.name);
                }
            }
        });

        if (labels.length > 0) {
            $scope.LabelValue = labels.join(', ');
        }


    }

    var getNotes = function (currentArray, attr, noteType) {
        var out = [];
        for (var i = 0; i < currentArray.length; i++) {
            if (currentArray[i].noteType.noteType === noteType) {
                out.push(currentArray[i][attr]);
            }
        }
        return out.join(", ");
    }

    $scope.displayScheduleLetter = function (product) {
        return String.fromCharCode(64 + product.scheduleId);
    }

    var getSchedule = function (licenseData, element) {
        var value = "";
        var min = 100;
        var max = 1;
        for (var i = 0; i < licenseData.licenseProducts.length; i++) {
            if (min > licenseData.licenseProducts[i].scheduleId && licenseData.licenseProducts[i].productConfigurationSelection.length > 0) {
                min = licenseData.licenseProducts[i].scheduleId;
            }
            if (max < licenseData.licenseProducts[i].scheduleId && licenseData.licenseProducts[i].productConfigurationSelection.length > 0) {
                max = licenseData.licenseProducts[i].scheduleId;
            }
        }
        switch (element) {
        //need to make this dinamically
            case "first":
                value = (min == 100)? "" : String.fromCharCode(64 + min);
                break;
            case "last":
                value = (max == 1)? "" : String.fromCharCode(64 + max);
                break;

        default:
            return "";
        }

        return value;
    }


    var getConfigValue = function (licenseData) {

        var physical = false;
        var digital = false;
        angular.forEach(licenseData.licenseProducts, function (item) {
            if (item.productConfigurationSelection.length > 0) {

                angular.forEach(item.productConfigurationSelection, function(configs) {
                    switch (configs.configurationType.toLowerCase()) {
                    case "physical":
                        physical = true;
                        break;
                    case "digital":
                        digital = true;
                        break;
                    case "both":
                        physical = true;
                        digital = true;
                        break;
                    }
                });
                
            }
        });

        $scope.LicensePreviewData.configuration = "";
        if (physical && !digital) {
            $scope.LicensePreviewData.configuration = "Physical";
        }

        if (!physical && digital) {
            $scope.LicensePreviewData.configuration = "Digital";
        }

        if (physical && digital) {
            $scope.LicensePreviewData.configuration = "Physical and Digital";
        }

       
    };


    $scope.writerExistsOnRecord = function (record) {
        var displayRecord = false;
      
        var i = 0;
        if (record.writers != null) {
            while (i < record.writers.length && !displayRecord) {
                var j = 0;
                if (record.writers[i].licenseProductRecordingWriter!=null && record.writers[i].licenseProductRecordingWriter.rateList!=null) {
                    while (j < record.writers[i].licenseProductRecordingWriter.rateList.length && !displayRecord) {
                        if (record.writers[i].licenseProductRecordingWriter.rateList[j].writerRateInclude) {
                            displayRecord = true;
                        }
                        j++;
                    }
                }
                i++;
            }
        }
        return displayRecord;

    }

    $scope.displaySpecialStatus = function (rate) {
        var displayText = "";

        angular.forEach(rate.specialStatusList, function (specialStatus) {

            //MFN id = 9, MOU Default Rules Applied id = 3, Non-Royalty Bearing Use id = 11
            if (specialStatus.specialStatusId == 9 || specialStatus.specialStatusId == 3 || specialStatus.specialStatusId == 11) {

                if (displayText == "") {
                    displayText = specialStatus.lU_SpecialStatuses.specialStatus;
                }
                else
                {
                    displayText = displayText + ", " +  specialStatus.lU_SpecialStatuses.specialStatus;        
                }
            }
        });

        return displayText;
    }


    $scope.displaySpecialStatusHeader = function (record) {

        var displayStatus = false;

        var i = 0;
        while (i < record.writers.length && !displayStatus) {
            var j = 0;
            var rateList = record.writers[i].licenseProductRecordingWriter.rateList;
            while (j < rateList.length && !displayStatus) {
                var k = 0;
                var specialStatusList = rateList[j].specialStatusList;
                while (k < specialStatusList.length && !displayStatus) {
                    //MFN id = 9, MOU Default Rules Applied id = 3, Non-Royalty Bearing Use id = 11
                    if (specialStatusList[k].specialStatusId == 9 || specialStatusList[k].specialStatusId == 3 || specialStatusList[k].specialStatusId == 11) {
                        displayStatus = true;
                    }
                    k++;
                }
                j++;
            }
            i++;
        }

        return displayStatus;

    }

    $scope.displayProductHeader = function (product) {
        var displayHeader = false;

        var i = 0;
        while (i < product.recordings.length && !displayHeader) {
            if ($scope.writerExistsOnRecord(product.recordings[i])) {
                displayHeader = true;
            }
            i++;
        }

        return displayHeader;
    }

    $scope.displayWriter = function (writer) {
        var display = writer.controlled;

        var rateFound = false;
        angular.forEach(writer.licenseProductRecordingWriter.rateList, function(item) {

            if (item.writerRateInclude == true) {
                rateFound = true;
            }

        });

        display = display && rateFound;


        //USL-672 16/09/2015
        //if (display && writer.controlled) {
            
        //    var currentRateList = writer.licenseProductRecordingWriter.rateList;
        //    var i = 0;
        //    while (i < currentRateList.length && display) {
        //        if (currentRateList[i].rate == 0 || currentRateList[i].perSongRate == 0 || currentRateList[i].proRataRate == 0) {
        //            display = false;
        //        }
                
        //        i++;
        //    }

        //}

        //USL-673 - 16/09/2015
        //if (display) {

        //    var currentRateList = writer.licenseProductRecordingWriter.rateList;
        //    var i = 0;
        //    while (i < currentRateList.length && display) {
        //        if (currentRateList[i].licenseDate !=null) {
        //            display = false;
        //        }

        //        i++;
        //    }

        //}

        //USL-674 16/09/2015
        //if (display) {
        //    var currentRateList = writer.licenseProductRecordingWriter.rateList;
        //    var i = 0;
        //    while (i < currentRateList.length && display) {
        //        // for the moment, no need to interate throw specialStatusList
        //        if ((currentRateList[i].specialStatusList.length) > 0 && display) {
        //            if (currentRateList[i].specialStatusList[0].lU_SpecialStatuses.specialStatusId > 0) {
        //                display = false;
        //            }
        //        }
                
        //        i++;
        //    }
        //}

        return display;
    }

    $scope.getCurrentConfigurations = function (record) {

        var i = 0;
        var j = 0;

        var escaletedRate = false;
        if (record.writers != null) {
            while (i < record.writers.length && !escaletedRate) {           
                    var currentWriter = record.writers[i];
                    var currentRateList = currentWriter.licenseProductRecordingWriter.rateList;
                    j = 0;
                    while (j < currentRateList.length && !escaletedRate) {
                        if (currentRateList[j].writerRateInclude && currentRateList[j].escalatedRate != null) {
                            escaletedRate = true;
                        }
                        j++;
                }
                i++;
            }
        }
        if (escaletedRate) {
            return "EscaletedRates";
        } else {
            return "PhysicalOrDigital";
        }
        
    }


    $scope.getRateTypes = function (support, writer) {

        var i = 0;
        var rateList = [];
        if (writer != null) {
            rateList = writer.licenseProductRecordingWriter.rateList;
            while (i < rateList.length) {
                if (rateList[i].configuration_type === support) {
                    return rateList[i].rateType.rateType;
                }
                i++;
            }

        }
        return "";
    }

    $scope.getRate = function (support, rateType, writer) {
        var i = 0;
        var rateList = [];
        rateList = writer.licenseProductRecordingWriter.rateList;
        while (i < rateList.length) {
            if (rateList[i].configuration_type === support) {
                return rateList[i][rateType];
            }
            i++;
        }
        return "";
    }

    $scope.getProductConfigurationUpc = function (product_configuration_id) {
        var upc = "";
        for (var i = 0; i < $scope.selectedLicense.licensePreview.licenseProducts.length; i++) {
            for (var j = 0; j < $scope.selectedLicense.licensePreview.licenseProducts[i].productConfigurationSelection.length; j++) {
                if ($scope.selectedLicense.licensePreview.licenseProducts[i].productConfigurationSelection[j].product_configuration_id == product_configuration_id) {
                    upc = $scope.selectedLicense.licensePreview.licenseProducts[i].productConfigurationSelection[j].upc;
                    break;
                }
            }
            if (upc != null && upc.length > 0) {
                break;
            }
        }
        return upc;
    }

    //Jeff Added these filters
    $scope.emptyOrNull = function (item) {
        return !(item.Message === null || item.Message.trim().length === 0);
    }

}]);


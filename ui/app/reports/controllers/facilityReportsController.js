'use strict';

angular.module('bahmni.reports')
    .controller('FacilityReportsController', ['$scope', 'appService', 'reportService', 'FileUploader', 'messagingService', 'spinner', '$rootScope', 'auditLogService', function ($scope, appService, reportService, FileUploader, messagingService, spinner, $rootScope, auditLogService) {
        var appName = "facilityReports";
        $scope.uploader = new FileUploader({
            url: Bahmni.Common.Constants.uploadReportTemplateUrl,
            removeAfterUpload: true,
            autoUpload: true
        });

        $scope.uploader.onSuccessItem = function (fileItem, response) {
            fileItem.report.reportTemplateLocation = response;
        };

        $rootScope.default = _.isUndefined($rootScope.default) ? {facilityReportsRequiringDateRange: {}, facilityReportsNotRequiringDateRange: {}} : $rootScope.default;
        $scope.reportsDefined = true;
        $scope.enableReportQueue = appService.getAppDescriptor().getConfigValue("enableReportQueue");

        $scope.setDefault = function (item, header) {
            var setToChange = header === 'facilityReportsRequiringDateRange' ? $rootScope.facilityReportsRequiringDateRange : $rootScope.facilityReportsNotRequiringDateRange;
            if (item === 'responseType') {
                setToChange.forEach(function (report) {
                    report[item] = $rootScope.default[header][item];
                });
            } else {
                setToChange.forEach(function (report) {
                    report[item] = moment($rootScope.default[header][item], 'DD-MM-YYYY').format('DD-MM-YYYY');
                });
            }
        };

        var isDateRangeRequiredFor = function (report) {
            return _.find($rootScope.facilityReportsRequiringDateRange, {name: report.name});
        };

        var validateReport = function (report) {
            if (!report.responseType) {
                messagingService.showMessage("error", "Select format for the report: " + report.name);
                return false;
            }
            if (report.responseType === 'application/vnd.ms-excel-custom' && !report.reportTemplateLocation) {
                if (!report.config.macroTemplatePath) {
                    messagingService.showMessage("error", "Workbook template should be selected for generating report: " + report.name);
                    return false;
                }
                report.reportTemplateLocation = report.config.macroTemplatePath;
            }
            // report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate);
            // report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate);
            var startDate = moment(report.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            var stopDate = moment(report.stopDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            if (isDateRangeRequiredFor(report) && (!startDate || !stopDate)) {
                var msg = [];
                if (!startDate) {
                    msg.push("start date");
                }
                if (!stopDate) {
                    msg.push("end date");
                }
                messagingService.showMessage("error", "Please select the " + msg.join(" and "));
                return false;
            }
            if (report.type == 'concatenated' && report.responseType == reportService.getMimeTypeForFormat('CSV')) {
                messagingService.showMessage('error', 'CSV format is not supported for concatenated reports');
                return false;
            }
            return true;
        };

        $scope.downloadReport = function (report) {
            if (validateReport(report)) {
                var startDate = moment(report.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                var stopDate = moment(report.stopDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                var objReport = angular.copy(report);
                objReport.startDate = startDate;
                objReport.stopDate = stopDate;
                objReport.appName = appName;
                reportService.generateReport(objReport);
                if (report.responseType === 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
                log(report.name);
            }
        };

        var log = function (reportName) {
            auditLogService.log(undefined, 'RUN_REPORT', {reportName: reportName}, "MODULE_LABEL_REPORTS_KEY");
        };

        $scope.scheduleReport = function (report) {
            if (validateReport(report)) {
                var startDate = moment(report.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                var stopDate = moment(report.stopDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                var objReport = angular.copy(report);
                objReport.startDate = startDate;
                objReport.stopDate = stopDate;
                objReport.appName = appName;
                spinner.forPromise(reportService.scheduleReport(objReport)).then(function () {
                    messagingService.showMessage("info", report.name + " added to My Reports");
                }, function () {
                    messagingService.showMessage("error", "Error in scheduling report");
                });
                if (report.responseType === 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
                log(report.name);
            }
        };

        var initializeFormats = function () {
            var supportedFormats = appService.getAppDescriptor().getConfigValue("supportedFormats") || _.keys(reportService.getAvailableFormats());
            supportedFormats = _.map(supportedFormats, function (format) {
                return format.toUpperCase();
            });
            $scope.formats = _.pick(reportService.getAvailableFormats(), supportedFormats);
        };

        var initialization = function () {
            var reportList = appService.getAppDescriptor().getConfigForPage("facilityReports");
            $rootScope.facilityReportsRequiringDateRange = _.isUndefined($rootScope.facilityReportsRequiringDateRange) ? _.values(reportList).filter(function (report) {
                return !(report.config && report.config.dateRangeRequired === false);
            }) : $rootScope.facilityReportsRequiringDateRange;
            $rootScope.facilityReportsNotRequiringDateRange = _.isUndefined($rootScope.facilityReportsNotRequiringDateRange) ? _.values(reportList).filter(function (report) {
                return (report.config && report.config.dateRangeRequired === false);
            }) : $rootScope.facilityReportsNotRequiringDateRange;
            $scope.reportsDefined = _.values(reportList).length > 0;

            initializeFormats();
        };

        initialization();
    }]);
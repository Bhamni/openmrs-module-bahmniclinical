'use strict';

angular.module('bahmni.clinical')
    .directive('diseaseTemplate', function () {

        var controller = function ($scope) {
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                diseaseTemplate: "=template",
                patient:"="
            },
            templateUrl: "dashboard/views/diseaseTemplate.html"
        };
    });
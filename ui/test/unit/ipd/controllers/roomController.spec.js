'use strict';

describe('RoomController', function () {

    var controller;
    var rootScope;
    var scope;
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var state = jasmine.createSpyObj('$state',['go']);
    var room = {
        "name": "ROOM1",
        "beds": [
            [{
            "empty": false,
            "available": false,
            "bed": {"bedId": 1, "bedNumber": "404-a", "bedType": "normal bed", "bedTags": ["Sourav"], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 2, "bedNumber": "404-b", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 3, "bedNumber": "404-c", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 4, "bedNumber": "404-d", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }], [{
            "empty": false,
            "available": false,
            "bed": {"bedId": 5, "bedNumber": "404-e", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 6, "bedNumber": "404-f", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 7, "bedNumber": "404-g", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": true,
            "bed": {"bedId": 8, "bedNumber": "404-h", "bedType": "deluxe bed", "bedTags": [], "status": "AVAILABLE"}
        }], [{
            "empty": true,
            "available": false,
            "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
        }, {
            "empty": true,
            "available": false,
            "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
        }, {
            "empty": true,
            "available": false,
            "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 9, "bedNumber": "404-i", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }]],
        "totalBeds": 9,
        "availableBeds": 1
    };

    appService.getAppDescriptor.and.returnValue({
        formatUrl: function(){
        }
    });
    beforeEach(function () {
        module('bahmni.ipd');
    });

    var initController = function (rootScope, state) {
        controller('RoomController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            messagingService: messagingService,
            appService: appService
        });
    };

    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            rootScope.bedDetails =
            {
                bedId: 9,
                bedNumber: "404-i",
                physicalLocationName: "room1"
            };
            spyOn(scope, '$emit');
            scope.room = room;
        });
    });

    it('should initialize bed info based on Admitted Patient Details', function () {
        var expectedBed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        state.current = {name: "bedManagement.bed"};
        initController(rootScope, state);
        expect(scope.selectedBed).toEqual(expectedBed);
        expect(scope.$emit).toHaveBeenCalledWith("event:bedSelected", scope.selectedBed);
    });

    it('should show a error message, when state is bedManagement.patient and trying to select an occupied bed', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        state.current = {name: "bedManagement.patient"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "Please select an available bed");
    });

    it('should emit an event with name event:bedSelected and bed info, when selectedbed is not OCCUPIED and the state is bedManagement.patient', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "AVAILABLE"
        };
        state.current = {name: "bedManagement.patient"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(scope.$emit).toHaveBeenCalledWith("event:bedSelected", bed);
    });

    it('Should reset patient on rootScope on selecting AVAILABLE bed and go to bedManagement.bed state ', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "AVAILABLE"
        };
        rootScope.patient = {name: "patientName", uuid: "patientUuid"};
        state.current = {name: "bedManagement"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(rootScope.patient).toBeUndefined();
        expect(state.go).toHaveBeenCalledWith("bedManagement.bed", jasmine.any(Object));
    });

    it('Should not reset patient on rootScope on selecting AVAILABLE bed and go to bedManagement.bed state ', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        rootScope.patient = {name: "patientName", uuid: "patientUuid"}
        state.current = {name: "bedManagement"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(rootScope.patient).not.toBeUndefined();
        expect(state.go).toHaveBeenCalledWith("bedManagement.bed", jasmine.any(Object));
    });

});
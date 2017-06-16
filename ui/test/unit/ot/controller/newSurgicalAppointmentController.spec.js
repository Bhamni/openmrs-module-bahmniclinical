'use strict';

describe("newSurgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper, _window, getAppDescriptor;
    q = jasmine.createSpyObj('$q', ['all', 'when']);
    var patientService = jasmine.createSpyObj('patientService', ['search']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes']);
    var programService = jasmine.createSpyObj('programService', ['getEnrollmentInfoFor']);
    getAppDescriptor = jasmine.createSpyObj('getAppDescriptor', ['getExtensions', 'getConfigValue', 'formatUrl']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    appService.getAppDescriptor.and.returnValue(getAppDescriptor);

    var ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    _window = jasmine.createSpyObj('$window', ['open', 'location']);


    var attributeTypes = {
        "results": [
            {
                "uuid": "25ef8484-3a1f-11e7-83f8-0800274a5156",
                "name": "procedure"
            },
            {
                "uuid": "25ef9562-3a1f-11e7-83f8-0800274a5156",
                "name": "estTimeHours"
            },
            {
                "uuid": "25efa512-3a1f-11e7-83f8-0800274a5156",
                "name": "estTimeMinutes"
            },
            {
                "uuid": "25efb2ef-3a1f-11e7-83f8-0800274a5156",
                "name": "cleaningTime"
            },
            {
                "uuid": "25efd013-3a1f-11e7-83f8-0800274a5156",
                "name": "otherSurgeon"
            },
            {
                "uuid": "25efdf1b-3a1f-11e7-83f8-0800274a5156",
                "name": "surgicalAssistant"
            },
            {
                "uuid": "25efec33-3a1f-11e7-83f8-0800274a5156",
                "name": "anaesthetist"
            },
            {
                "uuid": "25eff89a-3a1f-11e7-83f8-0800274a5156",
                "name": "scrubNurse"
            },
            {
                "uuid": "25f0060e-3a1f-11e7-83f8-0800274a5156",
                "name": "circulatingNurse"
            },
            {
                "uuid": "25f0060e-3a1f-11e7-83f8-0800274a5156",
                "name": "notes"
            }
        ]
    };
    q.all.and.returnValue(specUtil.simplePromise([{data: attributeTypes}]));
    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));
    patientService.search.and.returnValue(specUtil.simplePromise({data: {pageOfResults: [{name: "patient1 uuid"}, {name: "patient"}]}}));
    surgicalAppointmentService.getSurgicalAppointmentAttributeTypes.and.returnValue(specUtil.simplePromise({data: attributeTypes}));
    surgicalAppointmentService.getSurgeons.and.callFake(function () {
        return {data: {results: [{uuid: "uuid1", name: "provider1"}, {uuid: "uuid2", name: "provider2"}]}};
    });
    var enrollmentInfo = {
        patient: {uuid: "patientUuid"},
        dateEnrolled: "06-08-2017",
        uuid: "enrollmentUuid",
        program: {uuid: "programUuid"}
    };
    programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([]));

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
    });

    var createController = function () {
        controller('NewSurgicalAppointmentController', {
            $scope: scope,
            $q: q,
            $window: _window,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            patientService: patientService,
            messagingService: messagingService,
            programService: programService,
            appService: appService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            ngDialog: ngDialog
        });
    };

    it("should map the display name for patients", function () {
        var patients = [{givenName: "Natsume", familyName: "Hyuga", identifier: "IQ12345"},
            {givenName: "Sakura", familyName: "Mikan", identifier: "IQ12346"}];

        createController();
        var patientsWithDisplayName = scope.responseMap(patients);

        expect(patientsWithDisplayName.length).toEqual(2);
        expect(patientsWithDisplayName[0].label).toEqual("Natsume Hyuga ( IQ12345 )");
        expect(patientsWithDisplayName[1].label).toEqual("Sakura Mikan ( IQ12346 )");
    });

    it("should save data in proper format ", function () {
        scope.ngDialogData = {id: 1, actualStartDatetime: "2017-02-02T09:09:00.0Z", actualEndDatetime: "2017-02-02T10:09:00.0Z",
            sortWeight: 0, patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        createController();
        scope.addSurgicalAppointment = jasmine.createSpy("addSurgicalAppointment");
        scope.surgicalAppointmentForm = {$valid: true};

        scope.createAppointmentAndAdd();

        var appointment = {
            id: 1,
            patient: scope.ngDialogData.patient,
            sortWeight: 0,
            actualStartDatetime: "2017-02-02T09:09:00.0Z",
            actualEndDatetime: "2017-02-02T10:09:00.0Z",
            surgicalAppointmentAttributes: {
                procedure: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                        name: 'procedure'
                    }
                },
                cleaningTime: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efb2ef-3a1f-11e7-83f8-0800274a5156',
                        name: 'cleaningTime'
                    }, value: 15
                },
                estTimeMinutes: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efa512-3a1f-11e7-83f8-0800274a5156',
                        name: 'estTimeMinutes'
                    }, value: 0
                },
                estTimeHours: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef9562-3a1f-11e7-83f8-0800274a5156',
                        name: 'estTimeHours'
                    }, value: 0
                },
                otherSurgeon: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efd013-3a1f-11e7-83f8-0800274a5156',
                        name: 'otherSurgeon'
                    }
                },
                surgicalAssistant: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                        name: 'surgicalAssistant'
                    }
                },
                anaesthetist: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                        name: 'anaesthetist'
                    }
                },
                scrubNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                        name: 'scrubNurse'
                    }
                },
                circulatingNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'circulatingNurse'
                    }
                },
                notes: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'notes'
                    }
                }
            }
        };

        expect(scope.addSurgicalAppointment).toHaveBeenCalledWith(appointment);
        expect(q.when).toHaveBeenCalled();
    });

    it("should search the patient, when patientinfo passed to it", function () {
        createController();
        scope.patient = "pa";
        scope.search();
        expect(patientService.search).toHaveBeenCalledWith("pa");
    });

    it("should close the dialog when clicked on close", function () {
        createController();
        scope.close();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should initialize scope variables for appointment with data from the dialogData in edit appointment mode", function () {
        var ngDialogData = {
            id: 1,
            sortWeight: 0,
            notes: "need more assistants",
            patient: {
                uuid: "patientUuid",
                display: "firstName lastName",
                person: {given_name: "firstName", family_name: "lastName"}
            }
        };
        ngDialogData.surgicalAppointmentAttributes = {
            surgicalAppointmentAttributeType: {
                uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156",
                name: "procedure"
            }, value: "surgery on left leg"
        };
        scope.ngDialogData = ngDialogData;

        createController();

        expect(scope.attributes).toBe(ngDialogData.surgicalAppointmentAttributes);
        expect(scope.attributeTypes).toBe(attributeTypes.results);
        expect(scope.selectedPatient).toBe(ngDialogData.patient);
    });

    it("should only initialize the attributes, attributeTypes, when dialogData is not provided, in create appointment mode", function () {
        var ngDialogData = {};
        var surgicalAppointmentAttributes = {
            procedure: {
                surgicalAppointmentAttributeType: {
                    uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                    name: 'procedure'
                }
            },
            cleaningTime: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efb2ef-3a1f-11e7-83f8-0800274a5156',
                    name: 'cleaningTime'
                }, value: 15
            },
            estTimeMinutes: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efa512-3a1f-11e7-83f8-0800274a5156',
                    name: 'estTimeMinutes'
                }, value: 0
            },
            estTimeHours: {
                surgicalAppointmentAttributeType: {
                    uuid: '25ef9562-3a1f-11e7-83f8-0800274a5156',
                    name: 'estTimeHours'
                }, value: 0
            },
            otherSurgeon: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efd013-3a1f-11e7-83f8-0800274a5156',
                    name: 'otherSurgeon'
                }
            },
            surgicalAssistant: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                    name: 'surgicalAssistant'
                }
            },
            anaesthetist: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                    name: 'anaesthetist'
                }
            },
            scrubNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                    name: 'scrubNurse'
                }
            },
            circulatingNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                    name: 'circulatingNurse'
                }
            },
            notes: {
                surgicalAppointmentAttributeType: {
                    uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                    name: 'notes'
                }
            }
        };
        scope.ngDialogData = ngDialogData;

        createController();

        expect(scope.attributes).toEqual(surgicalAppointmentAttributes);
        expect(scope.attributeTypes).toBe(attributeTypes.results);
        expect(scope.notes).toBeUndefined();
        expect(scope.selectedPatient).toBeUndefined();
    });

    it("should disable the edit patient name when trying to edit the saved surgical appointment", function () {
        var ngDialogData = {id: 1, sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;
        scope.patient = ngDialogData.patient.display;

        createController();

        expect(scope.isEditMode()).toBeTruthy();
    });

    it("should enable the edit patient name when trying to edit the unsaved surgical appointment", function () {
        var ngDialogData = { sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;
        scope.patient = ngDialogData.patient.display;

        createController();

        expect(scope.isEditMode()).toBeFalsy();
    });

    it("should deep clone the surgeon for other surgeon", function () {
        scope.surgeons = [{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}];

        createController();

        expect(scope.otherSurgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
        scope.otherSurgeons[0].name= "surgeon1 modified";
        expect(scope.surgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
    });

    it("should open the patient dashboard when user click on patient name in edit mode", function () {
        getAppDescriptor.getConfigValue.and.returnValue({
            link : "/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY"
        });
        getAppDescriptor.formatUrl.and.returnValue("formattedUrl");
        scope.patient = { uuid: "patientUuid", display: "patient-GAN2020" };
        scope.ngDialogData = { id: "someId", patient: scope.patient };
        programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([enrollmentInfo]));
        createController();

        scope.goToForwardUrl();
        expect(scope.enrollmentInfo).toBe(enrollmentInfo);
        expect(getAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientDashboardUrl');
        expect(getAppDescriptor.formatUrl).toHaveBeenCalledWith("/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY", jasmine.any(Object));
        expect(_window.open).toHaveBeenCalledWith("formattedUrl");
    });

    it("should throw error when the forward url configured for the patient is invalid, all the required params are not present on the scope", function () {
        var forwardUrl = {
            link : "/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY",
            errorMessage: "Configured forward url is invalid"
        };
        getAppDescriptor.getConfigValue.and.returnValue(forwardUrl);
        scope.patient = { uuid: "patientUuid", display: "patient-GAN2020" };
        scope.ngDialogData = { id: "someId", patient: scope.patient };
        programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([]));

        scope.enrollmentInfo = undefined;
        createController();

        scope.goToForwardUrl();
        expect(getAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientDashboardUrl');
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', forwardUrl.errorMessage);
    }); 

});

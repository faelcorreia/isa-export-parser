'use strict';

angular.module('isa-export-parser', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('app', {
            url: '/app',
            templateUrl: 'views/app.html',
            controller: 'AppCtrl'
        })

        .state('app.policies', {
            url: '/policies',
            templateUrl: 'views/section.html',
            controller: 'PoliciesCtrl'
        })

        .state('app.section', {
            url: '/section/:sectionId/:id',
            templateUrl: 'views/section.html',
            controller: 'SectionCtrl'
        })

        $urlRouterProvider.otherwise('/app/policies')
    }
])

.constant("sections", {
    data: [{
        name: "Address Ranges",
        url: "parsed_addressranges.json",
    }, {
        name: "Computer Sets",
        url: "parsed_computersets.json",
    }, {
        name: "Computers",
        url: "parsed_computers.json",
    }, {
        name: "Domain Name Sets",
        url: "parsed_domainnamesets.json",
    }, {
        name: "Enterprise Networks",
        url: "parsed_enterprisenetworks.json",
    }, {
        name: "Networks Sets",
        url: "parsed_networksets.json",
    }, {
        name: "Protocols",
        url: "parsed_protocols.json",
    }, {
        name: "Proxy Schedule Templates",
        url: "parsed_proxyscheduletemplates.json",
    }, {
        name: "URL Sets",
        url: "parsed_urlsets.json",
    }, {
        name: "User Sets",
        url: "parsed_usersets.json",
    }]
})

.factory('Parseds', ['$http',
    function($http) {
        var get = function(file, callback) {
            $http.get("json/" + file).then(function(response) {
                callback(response.data)
            })
        }
        return {
            get: get
        }
    }
])

.controller('AppCtrl', ['$scope', 'sections', 'Parseds',
    function($scope, sections, Parseds) {
        sections.data.forEach(function(section) {
            Parseds.get(section.url, function(data) {
                section.header = data[0]
                section.data = data.slice(1, data.length)
            })
        })
        $scope.sections = sections.data
    }
])

.controller('PoliciesCtrl', ['$scope', 'Parseds', 'sections',
    function($scope, Parseds, sections) {
        var section = {
            name: "Policies",
            url: "parsed_policies.json",
        }

        var convertId = function(line, policyPos, namePos) {
            try {
                var newValue
                line[policyPos].forEach(function(obj1, index) {
                    sections.data.forEach(function(s, sectionPos) {
                        s.data.forEach(function(obj2) {
                            if (obj1 === obj2[0][0]) {
                                newValue = {
                                    id: obj1,
                                    sectionPos: sectionPos,
                                    name: obj2[namePos][0]
                                }
                            }
                        })
                    })
                    line[policyPos][index] = newValue
                })
            } catch (e) {
                console.log(e)
            }
        }

        Parseds.get(section.url, function(data) {
            section.header = data[0]
            section.data = data.slice(1, data.length)
            section.data.forEach(function(line) {
                convertId(line, section.header.indexOf("Source"), 1)
                convertId(line, section.header.indexOf("Destination"), 1)

                convertId(line, section.header.indexOf("DestinationDomainNameSets"), 1)
                convertId(line, section.header.indexOf("ProtocolsUsed"), 1)
                convertId(line, section.header.indexOf("URLSet"), 1)
                convertId(line, section.header.indexOf("UserSets"), 1)
                convertId(line, section.header.indexOf("ScheduleUsed"), 1)
            })
            $scope.section = section
        })
    }
])

.controller('SectionCtrl', ['$scope', '$stateParams', 'Parseds', 'sections', '$anchorScroll', '$location',
    function($scope, $stateParams, Parseds, sections, $anchorScroll, $location) {
        $scope.section = sections.data[$stateParams.sectionId]
        if (typeof($stateParams.id) !== 'undefined') {
            $location.hash($stateParams.id)
            $anchorScroll()
            $scope.id = $stateParams.id
        }
    }
])

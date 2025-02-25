(function () {
    'use strict';

    angular.module('marketplace.list', ['ngRoute', 'jhipster.service'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/list', {
                templateUrl: '/documentation-archive-v6-to-v7/v7.4.0/modules/marketplace/list/list.html',
                controller: 'ModuleListCtrl'
            });
        }])
        .controller('ModuleListCtrl', ModuleListCtrl);

    ModuleListCtrl.$inject = ['$scope', '$location', '$filter', 'ModuleService', 'NpmService'];

    function ModuleListCtrl($scope, $location, $filter, ModuleService, NpmService) {
        $scope.total = 0;
        $scope.loaded = false;
        var PAGE_SIZE = 25;

        function getModules() {
            ModuleService.getAllModules(0, PAGE_SIZE).success(function (res) {
                if (res.total > PAGE_SIZE) {
                    PAGE_SIZE = res.total;
                    getModules();
                } else {
                    var modulesList = [];
                    $scope.total = res.total;
                    $scope.moduleConfig = {}
                    ModuleService.getModulesConfig().success(function (moduleConfig) {
                        $scope.moduleConfig = moduleConfig;

                        $scope.modules = []
                        angular.forEach(res.objects, function (module) {
                            if (!($scope.moduleConfig.blacklistedModules && $scope.moduleConfig.blacklistedModules[module.package.name])) {
                                $scope.modules.push(module);
                                modulesList.push(module.package.name);
                            }
                        });

                        $scope.loaded = true;

                        NpmService.getNpmDownloadsLastMonth(modulesList.join(',')).success(function (data) {
                            angular.forEach($scope.modules, function (module) {
                                var npmstats = data[module.package.name];
                                module.downloads = npmstats && npmstats.downloads || 0;
                            });
                        });
                    });
                }
            });
        }

        getModules();

        $scope.details = function (module) {
            ModuleService.setCurrent(module);
            $location.path('/details/' + module.package.name);
        };

        $scope.isVerified = function (module) {
            return $scope.moduleConfig.verifiedModules && $scope.moduleConfig.verifiedModules[module.package.name];
        };
    }
})();

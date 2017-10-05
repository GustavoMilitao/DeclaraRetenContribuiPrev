(function () {
	'use strict';

	angular
	    .module('app.cooperados.declararetencontribuiprev', ['app.cooperados.service', 'ngRoute'])
	    .controller('DeclaraRetenContribuiPrevController', DeclaraRetenContribuiPrevController)
	    .config(config);


	/** @ngInject */


	/** @ngInject */
	function config($routeProvider){
	    $routeProvider
	    .when('/', {
		templateUrl: '/js/cooperado/unimedbh/declararetencontribuiprev/declararetencontribuiprev.html',
		controller: 'DeclaraRetenContribuiPrevController as vm',
		resolve:{
 			consultarCooperado:function(cooperados){                   
                 return cooperados.consultarCooperado();                                            
            }
		}
	    })
	    .otherwise({
		redirectTo: '/'
	    });

	}

	/** @ngInject */
	function DeclaraRetenContribuiPrevController($scope,cooperados,consultarCooperado) {

		/* Objetos utilizados na inclusão atual */
		$scope.mesInicialRef = "";
		$scope.mesFinalRef = "";
		$scope.mesInicialRefData = null;
		$scope.mesFInalRefData = null;
		$scope.empresasPagadoras = [];
		$scope.anexos = [];
		$scope.empresaAIncluir = {
			cnpj : "",
			nomeEmpresa : "",
			valSalarContrib : 0.0,
			valRetencInss : 0.0
		}
		/* ------------------------------- */


		$scope.dadosRetencContribPrev;
		$scope.param1 = "VAI VIR PREENCHIDO";
		$scope.param2 = "VAI VIR PREENCHIDO";
	}

	angular.element(document).ready(function() {
	  angular.bootstrap(document.getElementById("despesas_plano_de_saude"), ['app.cooperados.despesasPlanoDeSaude']);
	});
})();

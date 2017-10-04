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
		$scope.nome = "";
		$scope.crm = "";
		$scope.cpf = "";
		$scope.numInscInss = "";
		$scope.mesInicialRef = null;
		$scope.mesFinalRef = null;
		$scope.empresasPagadoras = [];
		$scope.anexos = [];
		$scope.param1 = "VAI VIR PREENCHIDO";
		$scope.param2 = "VAI VIR PREENCHIDO";
		$scope.fimInc = "";
		$scope.limiteMaxContrib = 0.0;

		$scope.empresaAIncluir = {
			cnpj : "",
			nomeEmpresa : "",
			valSalarContrib : 0.0,
			valRetencInss : 0.0
		}


	}

	angular.element(document).ready(function() {
	  angular.bootstrap(document.getElementById("despesas_plano_de_saude"), ['app.cooperados.despesasPlanoDeSaude']);
	});
})();

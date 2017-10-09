(function () {
	'use strict';

	angular
		.module('app.cooperados.declararetencontribuiprev', ['ngMask']/*['app.cooperados.service', 'ngRoute']*/)
		.controller('DeclaraRetenContribuiPrevController', DeclaraRetenContribuiPrevController);
	// .config(config);


	/** @ngInject */

	/** @ngInject */
	// function config($routeProvider){
	//     $routeProvider
	//     .when('/', {
	// 	templateUrl: '/js/cooperado/unimedbh/declararetencontribuiprev/declararetencontribuiprev.html',
	// 	controller: 'DeclaraRetenContribuiPrevController as vm',
	// 	resolve:{
	// 		consultarCooperado:function(cooperados){                   
	//              return cooperados.consultarCooperado();                                            
	//         }
	// 	}
	//     })
	//     .otherwise({
	// 	redirectTo: '/'
	//     });

	// }

	/** @ngInject */
	function DeclaraRetenContribuiPrevController($scope/*,cooperados,consultarCooperado*/) {

		/* Objetos utilizados na inclusão atual */
		$scope.mesInicialRef = "";
		$scope.mesFinalRef = "";
		$scope.mesInicialRefData = null;
		$scope.mesFInalRefData = null;
		$scope.empresasPagadoras = [{ razSoc: "TESTE", numIns: "1", valSalarContrib: "0", valRetencInss: "0" }];
		$scope.anexos = [];
		$scope.liEAceito = false;
		$scope.empresaAIncluir = {
			cnpj: "",
			nomeEmpresa: "",
			valSalarContrib: 0.0,
			valRetencInss: 0.0
		}
		$scope.somaValoresBaseContrib;
		$scope.filterEmpresa = [];
		$scope.hideEmpresa = true;
		$scope.desabilitarCamposEmpresa = false;
		/* ------------------------------- */

		$scope.dadosRetencContribPrev = {};
		$scope.dadosRetencContribPrev.informacoesDatasPermitidas = {};
		$scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc = "11/11/2011";
		$scope.dadosRetencContribPrev.dadosCooperado = {};
		$scope.dadosRetencContribPrev.dadosCooperado.fotEmp = "http://www.gettyimages.com/gi-resources/images/Embed/new/embed2.jpg";
		$scope.dadosRetencContribPrev.listaCNPJ = [];
		for (var i = 0; i < 1000; i++) {
			$scope.dadosRetencContribPrev.listaCNPJ.push({
				numIns: "1122333444555",
				razSoc: "EMPRESA DE TESTE DO GUGU1"
			});
		}
		// $scope.dadosRetencContribPrev.listaCNPJ.push({
		// 	numIns : "43215",
		// 	razSoc : "EMPRESA DE TESTE DO GUGU2"
		// });
		// $scope.dadosRetencContribPrev.listaCNPJ.push({
		// 	numIns : "54321",
		// 	razSoc : "EMPRESA DE TESTE DO GUGU3"
		// });
		// $scope.dadosRetencContribPrev.listaCNPJ.push({
		// 	numIns : "32154",
		// 	razSoc : "EMPRESA DE TESTE DO GUGU4"
		// });
		// $scope.dadosRetencContribPrev.listaCNPJ.push({
		// 	numIns : "21543",
		// 	razSoc : "EMPRESA DE TESTE DO GUGU5"
		// });
		$scope.param1 = "Se dados acima incorretos, entrar em contato com sua analista de relacionamento para atualização.";
		$scope.param2 = "VAI VIR PREENCHIDO {PARAMETRO 2}";
		$scope.incluirEmpresa = function () {
			$scope.empresasPagadoras.push($scope.empresaAIncluir);
			$scope.empresaAIncluir = {
				numIns: "",
				razSoc: "",
				valSalarContrib: 0.0,
				valRetencInss: 0.0
			}
			$scope.desabilitarCamposEmpresa = false;
		}

		$scope.completeEmpresa = function () {
			if ($scope.empresaAIncluir.numIns && $scope.empresaAIncluir.numIns != "") {
				$scope.hideEmpresa = false;
				var output = [];
				angular.forEach($scope.dadosRetencContribPrev.listaCNPJ, function (empresa) {
					if (empresa.numIns.toLowerCase().indexOf($scope.empresaAIncluir.numIns.toLowerCase()) >= 0
						&& output.length < 10) {
						output.push(empresa);
					}
				});
				$scope.filterEmpresa = output;
			} else {
				$scope.hideEmpresa = true;
			}
		}

		$scope.unificarAnexos = function () {
			$scope.anexos = $scope.anexos.filter(function (elem, index, self) {
				return index == self.indexOf(elem);
			})
		}

		$scope.removerEmpresa = function (cnpj) {
			for (var i = 0; i < $scope.empresasPagadoras.length; i++) {
				if ($scope.empresasPagadoras[i].numIns === cnpj) {
					$scope.empresasPagadoras.splice(i, 1);
				}
			}
		}

		$scope.anexosSelecionados = function($event) {
			for (var i = 0; i < this.files.length; i++) {
				if (!contemNaLista(this.files[i].name, $scope.anexos))
					$scope.anexos.push(this.files[i].name);
			}
		}

		$scope.insertLineEmpresa = function (empresa) {
			if ($scope.contemEmpresaNaLista(empresa.numIns, $scope.empresasPagadoras)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				// empresasPagadoras.push(empresa);
				// $scope.empresaAIncluir.cnpj = "";
				$scope.empresaAIncluir.numIns = empresa.numIns;
				$scope.empresaAIncluir.razSoc = empresa.razSoc;
				$scope.desabilitarCamposEmpresa = true;
				$scope.hideEmpresa = true;
				// $http({
				// 	method: "PUT",
				// 	url: '/teams/' + team._id,
				// 	headers: {
				// 		'Content-Type': "application/json"
				// 	},
				// 	data: team
				// });
			}
		}

		

		$scope.contemEmpresaNaLista = function (cnpj, listaEmpresas) {
			var contem = false;
			for (var i = 0; i < listaEmpresas.length; i++) {
				if (listaEmpresas[i].numIns === cnpj) {
					contem = true;
				}
			}
			return contem;
		}

		$scope.contemNaLista = function (objeto, objetos) {
			var contem = false;
			for (var i = 0; i < objetos.length; i++) {
				if (objetos[i] === objeto) {
					contem = true;
				}
			}
			return contem;
		}

		var getInicioValidade = function (refIni) {
			return "01/" + refIni;
		}

		var getFimValidade = function (refFim) {
			var mesEAno = refFim.split("/");
			var dias = getNumDiasMes(mesEAno[0].mesEAno[1]);
			return dias + "/" + refFim;
		}

		var getNumDiasMes = function (mes, ano) {

			var ehBissexto = ((ano % 4 == 0) && (ano % 100 != 0)) || (ano % 400 == 0);
			switch (mes) {
				case 1: return 31;
				case 2: return ehBissexto ? 29 : 28;
				case 3: return 31;
				case 4: return 30;
				case 5: return 31;
				case 6: return 30;
				case 7: return 31;
				case 8: return 31;
				case 9: return 30;
				case 10: return 31;
				case 11: return 30;
				case 12: return 31;
			}
			// Colocar no útil
		}
	}


	// angular.element(document).ready(function() {
	//   angular.bootstrap(document.getElementById("despesas_plano_de_saude"), ['app.cooperados.despesasPlanoDeSaude']);
	// });
})();

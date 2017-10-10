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
		/* Tela */
		$scope.refIni = "";
		$scope.refFin = "";
		$scope.empresasPagadoras = [];
		$scope.anexos = [];
		$scope.liEAceito = false;
		$scope.empresaAIncluir = {
			cnpj: "",
			nomeEmpresa: "",
			valSalarContrib: 0.0,
			valRetencInss: 0.0
		}
		$scope.somaValoresRetencInss = 0;
		$scope.filterEmpresa = [];
		$scope.hideEmpresa = true;
		$scope.desabilitarCamposEmpresa = false;
		$scope.desabilitaEnvio = false;
		/* Fim dados Tela */

		/* Dados cooperado */
		$scope.dadosRetencContribPrev = {};
		/* Fim dados cooperado */
		/* ------------------------------- */

		/* MOCKS */
		$scope.dadosRetencContribPrev.informacoesDatasPermitidas = {};
		$scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc = "11/11/2018";
		$scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc = "01/10/2017";
		$scope.dadosRetencContribPrev.dadosCooperado = {};
		$scope.dadosRetencContribPrev.dadosCooperado.fotEmp = "http://www.gettyimages.com/gi-resources/images/Embed/new/embed2.jpg";
		$scope.dadosRetencContribPrev.listaCNPJ = [];
		$scope.dadosRetencContribPrev.declaracoesIncluidas_cmpIni_cmpFim = [];
		for (var i = 0; i < 1000; i++) {
			$scope.dadosRetencContribPrev.listaCNPJ.push({
				numIns: "1122333444555",
				razSoc: "EMPRESA DE TESTE DO GUGU1"
			});
		}

		$scope.param1 = "Se dados acima incorretos, entrar em contato com sua analista de relacionamento para atualização.";
		$scope.param2 = "VAI VIR PREENCHIDO {PARAMETRO 2}";

		$scope.dadosRetencContribPrev.informacoesDatasPermitidas.limCon = 5000;

		/* FIM DOS MOCKS */

		/* AutoComplete */

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

		$scope.insertLineEmpresa = function (empresa) {
			if (contemEmpresaNaLista(empresa.numIns, $scope.empresasPagadoras)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				$scope.empresaAIncluir.numIns = empresa.numIns;
				$scope.empresaAIncluir.razSoc = empresa.razSoc;
				$scope.desabilitarCamposEmpresa = true;
				$scope.hideEmpresa = true;
			}
		}

		/* Fim AutoComplete */

		$scope.adicionarEmpresa = function () {
			if (!$scope.empresaAIncluir.numIns || $scope.empresaAIncluir.numIns == "" ||
				!$scope.empresaAIncluir.valSalarContrib || $scope.empresaAIncluir.valSalarContrib == 0) {
				alert("Obrigatório informar o CNPJ e Valor do Salário de Contribuição!");
			}
			else {
				//Validar CNPJ.
				if (parseFloat($scope.empresaAIncluir.valRetencInss) > parseFloat($scope.empresaAIncluir.valSalarContrib)) {
					alert("Valor de retenção do INSS deverá ser inferior ou igual ao valor do salário de contribuição!");
				} else {
					$scope.incluirEmpresa($scope.empresaAIncluir, $scope.empresasPagadoras);
					$scope.desabilitarCamposEmpresa = false;
					$scope.somaValoresRetencInss += parseFloat($scope.empresaAIncluir.valRetencInss);
					$scope.empresaAIncluir = {
						numIns: "",
						razSoc: "",
						valSalarContrib: 0.0,
						valRetencInss: 0.0
					}
				}
			}
		}

		$scope.incluirEmpresa = function (empresa, lista) {
			if (contemEmpresaNaLista(empresa.numIns, lista)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				lista.push(empresa);
			}
		}

		$scope.unificarAnexos = function () {
			$scope.anexos = $scope.anexos.filter(function (elem, index, self) {
				return index == self.indexOf(elem);
			})
		}

		$scope.removerAnexo = function (anexo) {
			// $scope.$apply(function ($scope) {
			// });
			for (var i = 0; i < $scope.anexos.length; i++) {
				if ($scope.anexos[i].name === anexo.name) {
					$scope.anexos.splice(i, 1);
				}
			}
		}

		$scope.removerEmpresa = function (cnpj) {
			for (var i = 0; i < $scope.empresasPagadoras.length; i++) {
				if ($scope.empresasPagadoras[i].numIns === cnpj) {
					$scope.somaValoresRetencInss -= $scope.empresasPagadoras[i].valRetencInss;
					$scope.empresasPagadoras.splice(i, 1);

				}
			}
		}

		$scope.anexosSelecionados = function (input) {
			$scope.$apply(function ($scope) {
				for (var i = 0; i < input.files.length; i++) {
					if (!contemNaLista(input.files[i].name, $scope.anexos))
						$scope.anexos.push(input.files[i]);
				}
				input.value = '';
			});
		}

		$scope.enviarDeclaracao = function () {
			//VALIDAÇÕES DE ENVIO DE DECLARAÇÃO.
			if ($scope.somaValoresRetencInss >= $scope.dadosRetencContribPrev.informacoesDatasPermitidas.limCon) {
				var txt;
				var r = confirm("Confirma a retenção dos valores de INSS no período de "+ $scope.refIni +" a "+$scope.refIni+" via outras fontes pagadoras informada?");
				if (r == true) {
					//Enviar declaração.
				} else {
					//Limpar tela
				}
			}
		}


		$scope.tratarInicioReferencia = function () {
			var dataAtual = new Date();
			if ($scope.inicioRefEhAnoAtual()) {
				if (dataAtual.getDate() >
					parseInt($scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim)) {
					$scope.desabilitaEnvio = true;
					alert("Data limite para envio da declaração do mês corrente ultrapassada!");
				}
			}
			else {
				if($scope.inicioRefEhMenorCompetenciaAtual()){
					alert("Não é permitido o lançamento de declarações com competência inicial inferior à competência atual.");
					$scope.desabilitaEnvio = true;
				}
			}
			if (!$scope.inicioRefEhAnoAtual()) {
				alert("Mês inicial de referência deverá ser dentro do ano corrente!");
				$scope.refIni = "";
			}
			if (!$scope.fimRefEhAnoAtual()) {
				alert("Mês final de referência deverá ser dentro do ano corrente!");
				$scope.refFinRef = "";
			}
			if ($scope.fimRefEhMaiorIniRef()) {
				alert("Mês final de referência deverá ser posterior ou igual ao mês ano inicial de referência!");
				$scope.refFinRef = "";
			}
		}

		$scope.fimRefEhMaiorIniRef = function () {
			var splitDtFinRef = $scope.refFin.split("/");
			var splitDtIniRef = $scope.refIni.split("/");
			var anoIni = splitDtIniRef[1];
			var anoFim = splitDtFinRef[1];
			var mesIni = splitDtIniRef[1];
			var mesFim = splitDtFinRef[1];
			var dataIni = new Date(parseInt(anoIni), parseInt(mesIni) - 1);
			var dataFim = new Date(parseInt(anoFim), parseInt(mesFim) - 1);
			if (dataFim > dataIni) {
				return true;
			}
			return false;
		}

		$scope.fimRefEhAnoAtual = function () {
			var splitDtFinRef = $scope.refFin.split("/");
			var ano = splitDtFinRef[1];
			var dataAtual = new Date();
			if (ano == dataAtual.getFullYear()) {
				return true;
			}
			return false;
		}

		$scope.inicioRefEhAnoAtual = function () {
			var splitDtIniRef = $scope.refIni.split("/");
			var ano = splitDtIniRef[1];
			var dataAtual = new Date();
			if (ano == dataAtual.getFullYear()) {
				return true;
			}
			return false;
		}

		$scope.diaLimiteJaPassou = function(dia){
			var splitDtIniRef = $scope.refIni.split("/");
			var ano = splitDtIniRef[1];
			var mes = splitDtIniRef[0];
			var diaLimite = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim;
			var dataAtual = new Date();
			if (ano == dataAtual.getFullYear() && mes == dataAtual.getMonth()) {
				return true;
			}
			return false;
		}

		$scope.inicioRefEhAnoAtual = function () {
			var splitDtIniRef = $scope.refIni.split("/");
			var ano = splitDtIniRef[1];
			var mes = splitDtIniRef[0];
			var dataAtual = new Date();
			if (ano == dataAtual.getFullYear() && mes == dataAtual.getMonth()) {
				return true;
			}
			return false;
		}

		$scope.inicioRefEhMenorCompetenciaAtual = function () {
			var splitDtIniRef = $scope.refIni.split("/");
			var ano = splitDtIniRef[1];
			var mes = splitDtIniRef[0];
			var dataAtual = new Date();
			var dataRefIni = new Date(parseInt(ano), parseInt(mes));
			if (dataAtual > dataRefIni) {
				return true;
			}
			return false;
		}

		$scope.getDataFimInc = function () {
			var split = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		$scope.getDataInicioInc = function () {
			var split = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		$scope.jaEnviadaHoje = function () {
			for (var i = 0; i < $scope.dadosRetencContribPrev.declaracoesIncluidas_cmpIni_cmpFim.length; i++) {
				var status = $scope.dadosRetencContribPrev.declaracoesIncluidas_cmpIni_cmpFim[i].staTus;
				if (status == 1 || status == 2 || status == 3 || status == 4) {
					var split = $scope.dadosRetencContribPrev.declaracoesIncluidas_cmpIni_cmpFim[i].datMov.split("/");
					var ano = split[2];
					var mes = split[1];
					var dia = split[0];
					var data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
					if (data === new Date()) {
						return true;
					}
				}
			}
			return false;
		}
	}

	$scope.tratarPermissaoEnvioDeclaracao = function(){
		if (new Date() > $scope.getDataFimInc()) { //RN 08
			$scope.desabilitaEnvio = true;
			alert("Prazo para envio da declaração encerrado em " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc);
		}
		else {
			if (new Date() < $scope.getDataInicioInc()) { // RN 09
				$scope.desabilitaEnvio = true;
				alert("Declaração de Retenção de contribuição previdenciária poderá ser enviada a partir do dia " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc);
			}
		}
	}

	function a (){
			if ($scope.jaEnviadaHoje()) { // RN 10
				var txt;
				var r = confirm("Declaração de retenção de contribuição previdenciária já foi enviada na data de hoje. Deseja Substituir?");
				if (r == true) {
					// Excluir declaração enviada.
					//RN19 (Dúvida, tirar com Elayne)
				} else {
					$scope.desabilitaEnvio = true;
				}
			}
	}

	angular.element(document).ready(function () {
		$scope.tratarPermissaoEnvioDeclaracao();
	});
})();

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
}

var contemEmpresaNaLista = function (cnpj, listaEmpresas) {
	var contem = false;
	for (var i = 0; i < listaEmpresas.length; i++) {
		if (listaEmpresas[i].numIns === cnpj) {
			contem = true;
		}
	}
	return contem;
}

var contemNaLista = function (objeto, objetos) {
	var contem = false;
	for (var i = 0; i < objetos.length; i++) {
		if (objetos[i].name === objeto) {
			contem = true;
		}
	}
	return contem;
}
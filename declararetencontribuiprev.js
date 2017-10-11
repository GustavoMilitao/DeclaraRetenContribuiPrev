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

        $scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim = 11;

		$ = window.jQuery;


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

			//Se o campo estiver vazio não há nada a ser validado
			if($scope.refIni.length == 0) return;


            var dataAtual = new Date();

            var diaLimite = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim;

            if(!$scope.isAnoCorrente($scope.refIni)) {
                $scope.refIni = '';
                alert("Mês inicial de referência deverá ser dentro do ano corrente!");
                $('#refIni').focus();
            } else if($scope.isCompetenciaAnterior()) {
                alert("Não é permitido o lançamento de declarações com competência inicial inferior à competência atual!");
                $('#refIni').focus();
            } else if($scope.isCompetenciaAtual() && dataAtual.getDate() > diaLimite) {
				alert("Data limite para envio da declaração do mês corrente ultrapassada!");
                $('#refIni').focus();
			}

		}


        $scope.tratarFimReferencia = function() {

            //Se o campo estiver vazio não há nada a ser validado
            if($scope.refFin.length == 0) return;

            if(!$scope.isAnoCorrente($scope.refFin)) {
                $scope.refFin = '';
                alert("Mês final de referência deverá ser dentro do ano corrente!");
            }


            if($scope.isRefFinalMaior($scope.refIni, $scope.refFin)) {
                $scope.refFin = '';
                alert("Mês final de referência deverá ser anterior ou igual ao mês ano inicial de referência!");
                $('#refFin').focus();
			}

		}

		$scope.isCompetenciaAtual = function() {

			var splitDtIniRef = $scope.refIni.split("/");

			var mes = splitDtIniRef[0];
			var ano = splitDtIniRef[1];

			var dataAtual = new Date();

			if(mes == dataAtual.getMonth() + 1 && ano == dataAtual.getFullYear()) {
				return true;
			} else {
                $scope.refIni = '';
				return false;
			}

		}

        $scope.isCompetenciaAnterior = function() {

            var splitDtIniRef = $scope.refIni.split("/");

            var mes = splitDtIniRef[0];
            var ano = splitDtIniRef[1];

            var dataAtual = new Date();

            if(ano < dataAtual.getFullYear()) {
                $scope.refIni = '';
            	return true;
            }


            if(mes < (dataAtual.getMonth() + 1)) {
                $scope.refIni = '';
                return true;
            }


            return false;

        }


		$scope.isAnoCorrente = function(valorCampo) {

            var dataAtual = new Date();

            var splitDtIniRef = valorCampo.split("/");

            var ano = splitDtIniRef[1];

            if(ano != dataAtual.getFullYear()) {
            	return false;
			}

			return true;

		}

		$scope.isRefFinalMaior = function(refIni, refFim) {

			var refIniArr = refIni.split('/');
			var refFimArr = refFim.split('/');

			var diaInicio = refIniArr[0];
			var anoInicio = refIniArr[1];

            var diaFim = refFimArr[0];
            var anoFim = refFimArr[1];

			if(anoFim < anoInicio) return true;

			if(diaFim < diaInicio) return true;


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

        angular.element(document).ready(function () {
            $scope.tratarPermissaoEnvioDeclaracao();
        });
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